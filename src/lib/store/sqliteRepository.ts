import Database from 'better-sqlite3';
import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage } from '@/types';
import { IMemoryRepository } from './interfaces';
import { getDatabase } from './sharedDb';

export class SqliteRepository implements IMemoryRepository {
  private dbPath: string | undefined;

  constructor(dbPath?: string) {
    this.dbPath = dbPath;
  }

  private getDb(): Database.Database {
    return getDatabase(this.dbPath);
  }

  async initialize(): Promise<void> {
    this.getDb().exec(`
      CREATE TABLE IF NOT EXISTS memory_events (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, sourceId TEXT NOT NULL, sourceType TEXT NOT NULL,
        title TEXT NOT NULL, summary TEXT NOT NULL, content TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Unknown', timestamp TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]', entities TEXT NOT NULL DEFAULT '[]',
        importance INTEGER NOT NULL DEFAULT 5, metadata TEXT, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        description TEXT DEFAULT '', metadata TEXT, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY, sourceId TEXT NOT NULL, targetId TEXT NOT NULL,
        type TEXT NOT NULL, description TEXT DEFAULT '',
        weight INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, content TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Unknown', timestamp TEXT NOT NULL,
        eventCount INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, count INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS query_logs (
        id TEXT PRIMARY KEY, query TEXT NOT NULL, response TEXT NOT NULL,
        memoryReferences TEXT NOT NULL DEFAULT '[]', confidence REAL NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id TEXT PRIMARY KEY, conversationId TEXT NOT NULL, role TEXT NOT NULL,
        content TEXT NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_mem_events_type ON memory_events(type);
      CREATE INDEX IF NOT EXISTS idx_mem_events_source ON memory_events(sourceId);
      CREATE INDEX IF NOT EXISTS idx_mem_events_ts ON memory_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
      CREATE INDEX IF NOT EXISTS idx_rels_source ON relations(sourceId);
      CREATE INDEX IF NOT EXISTS idx_rels_target ON relations(targetId);
      CREATE INDEX IF NOT EXISTS idx_conv_id ON conversation_messages(conversationId);
    `);
  }

  async getAllMemoryEvents(): Promise<MemoryEvent[]> {
    return (this.getDb().prepare('SELECT * FROM memory_events ORDER BY timestamp DESC').all() as any[]).map(this.mapEvent);
  }

  async getMemoryEvent(id: string): Promise<MemoryEvent | undefined> {
    const row = this.getDb().prepare('SELECT * FROM memory_events WHERE id = ?').get(id) as any;
    return row ? this.mapEvent(row) : undefined;
  }

  async addMemoryEvent(event: MemoryEvent): Promise<void> {
    this.getDb().prepare(`INSERT OR REPLACE INTO memory_events (id,type,sourceId,sourceType,title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(event.id, event.type, event.sourceId, event.sourceType, event.title, event.summary, event.content, event.author, event.timestamp, JSON.stringify(event.tags), JSON.stringify(event.entities), event.importance, event.metadata ? JSON.stringify(event.metadata) : null, event.createdAt);
  }

  async addMemoryEvents(events: MemoryEvent[]): Promise<void> {
    const stmt = this.getDb().prepare(`INSERT OR REPLACE INTO memory_events (id,type,sourceId,sourceType,title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    this.getDb().transaction((items: MemoryEvent[]) => { for (const e of items) stmt.run(e.id, e.type, e.sourceId, e.sourceType, e.title, e.summary, e.content, e.author, e.timestamp, JSON.stringify(e.tags), JSON.stringify(e.entities), e.importance, e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt); })(events);
  }

  async getAllEntities(): Promise<Entity[]> { return this.getDb().prepare('SELECT * FROM entities').all() as Entity[]; }

  async getEntity(id: string): Promise<Entity | undefined> {
    return this.getDb().prepare('SELECT * FROM entities WHERE id = ?').get(id) as Entity | undefined;
  }

  async addEntity(entity: Entity): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO entities (id,name,type,description,metadata,createdAt) VALUES(?,?,?,?,?,?)').run(entity.id, entity.name, entity.type, entity.description, entity.metadata ? JSON.stringify(entity.metadata) : null, entity.createdAt);
  }

  async addEntities(entities: Entity[]): Promise<void> {
    const stmt = this.getDb().prepare('INSERT OR REPLACE INTO entities (id,name,type,description,metadata,createdAt) VALUES(?,?,?,?,?,?)');
    this.getDb().transaction((items: Entity[]) => { for (const e of items) stmt.run(e.id, e.name, e.type, e.description, e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt); })(entities);
  }

  async getAllRelations(): Promise<Relation[]> { return this.getDb().prepare('SELECT * FROM relations').all() as Relation[]; }

  async addRelation(relation: Relation): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO relations (id,sourceId,targetId,type,description,weight,createdAt) VALUES(?,?,?,?,?,?,?)').run(relation.id, relation.sourceId, relation.targetId, relation.type, relation.description, relation.weight, relation.createdAt);
  }

  async addRelations(relations: Relation[]): Promise<void> {
    const stmt = this.getDb().prepare('INSERT OR REPLACE INTO relations (id,sourceId,targetId,type,description,weight,createdAt) VALUES(?,?,?,?,?,?,?)');
    this.getDb().transaction((items: Relation[]) => { for (const r of items) stmt.run(r.id, r.sourceId, r.targetId, r.type, r.description, r.weight, r.createdAt); })(relations);
  }

  async getAllSources(): Promise<Source[]> { return this.getDb().prepare('SELECT * FROM sources ORDER BY timestamp DESC').all() as Source[]; }

  async getSource(id: string): Promise<Source | undefined> {
    return this.getDb().prepare('SELECT * FROM sources WHERE id = ?').get(id) as Source | undefined;
  }

  async addSource(source: Source): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO sources (id,name,type,content,author,timestamp,eventCount,createdAt) VALUES(?,?,?,?,?,?,?,?)').run(source.id, source.name, source.type, source.content, source.author, source.timestamp, source.eventCount, source.createdAt);
  }

  async getAllTags(): Promise<Tag[]> { return this.getDb().prepare('SELECT * FROM tags ORDER BY count DESC').all() as Tag[]; }

  async incrementTag(name: string): Promise<void> {
    const existing = this.getDb().prepare('SELECT * FROM tags WHERE name = ?').get(name);
    existing ? this.getDb().prepare('UPDATE tags SET count = count + 1 WHERE name = ?').run(name) : this.getDb().prepare('INSERT INTO tags (id,name,count) VALUES(?,?,1)').run(name, name);
  }

  async addQueryLog(log: QueryLog): Promise<void> {
    this.getDb().prepare('INSERT INTO query_logs (id,query,response,memoryReferences,confidence,createdAt) VALUES(?,?,?,?,?,?)').run(log.id, log.query, log.response, JSON.stringify(log.memoryReferences), log.confidence, log.createdAt);
  }

  async getRecentQueries(limit = 10): Promise<QueryLog[]> {
    return (this.getDb().prepare('SELECT * FROM query_logs ORDER BY createdAt DESC LIMIT ?').all(limit) as any[]).map((r) => ({ ...r, memoryReferences: JSON.parse(r.memoryReferences || '[]') }));
  }

  async getConversation(id: string): Promise<ConversationMessage[] | undefined> {
    const rows = this.getDb().prepare('SELECT role,content FROM conversation_messages WHERE conversationId=? ORDER BY createdAt ASC').all(id) as ConversationMessage[];
    return rows.length > 0 ? rows : undefined;
  }

  async addConversationMessage(id: string, message: ConversationMessage): Promise<void> {
    this.getDb().prepare('INSERT INTO conversation_messages (id,conversationId,role,content,createdAt) VALUES(?,?,?,?,?)').run(`${id}-${Date.now()}`, id, message.role, message.content, new Date().toISOString());
  }

  async searchEvents(query: string, filters?: { type?: string; source?: string; tag?: string }): Promise<MemoryEvent[]> {
    let sql = 'SELECT * FROM memory_events WHERE 1=1';
    const params: any[] = [];
    if (filters?.type) { sql += ' AND type=?'; params.push(filters.type); }
    if (filters?.source) { sql += ' AND sourceId=?'; params.push(filters.source); }
    sql += ' ORDER BY timestamp DESC';
    if (!query) { sql += ' LIMIT 50'; return (this.getDb().prepare(sql).all(...params) as any[]).map(this.mapEvent); }
    const rows = this.getDb().prepare(sql).all(...params) as any[];
    const q = query.toLowerCase();
    return rows.filter((r: any) => { const tags: string[] = JSON.parse(r.tags || '[]'); const ents: string[] = JSON.parse(r.entities || '[]'); return r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q) || r.content.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || tags.some((t) => t.toLowerCase().includes(q)) || ents.some((e) => e.toLowerCase().includes(q)); }).slice(0, 50).map(this.mapEvent);
  }

  async clear(): Promise<void> {
    this.getDb().exec('DELETE FROM conversation_messages; DELETE FROM query_logs; DELETE FROM relations; DELETE FROM entities; DELETE FROM memory_events; DELETE FROM sources; DELETE FROM tags;');
  }

  private mapEvent(row: any): MemoryEvent {
    return { id: row.id, type: row.type, sourceId: row.sourceId, sourceType: row.sourceType, title: row.title, summary: row.summary, content: row.content, author: row.author, timestamp: row.timestamp, tags: JSON.parse(row.tags || '[]'), entities: JSON.parse(row.entities || '[]'), importance: row.importance, metadata: row.metadata ? JSON.parse(row.metadata) : undefined, createdAt: row.createdAt };
  }
}
