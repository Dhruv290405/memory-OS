import Database from 'better-sqlite3';
import crypto from 'crypto';
import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage, Workspace, User } from '@/types';
import { IMemoryRepository } from './interfaces';
import { getDatabase } from './sharedDb';

export class SqliteRepository implements IMemoryRepository {
  private dbPath: string | undefined;
  private workspaceId: string | undefined;

  constructor(dbPath?: string) {
    this.dbPath = dbPath;
  }

  private getDb(): Database.Database {
    return getDatabase(this.dbPath);
  }

  setWorkspaceContext(workspaceId?: string): void {
    this.workspaceId = workspaceId;
  }

  private migrateSchema(): void {
    const db = this.getDb();
    const tables = ['memory_events', 'entities', 'relations', 'sources'];
    for (const table of tables) {
      try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN workspaceId TEXT DEFAULT 'default'`);
      } catch {
        // Column already exists
      }
    }
    try {
      db.exec("ALTER TABLE tags ADD COLUMN workspaceId TEXT DEFAULT 'default'");
    } catch {}
    try {
      db.exec("ALTER TABLE query_logs ADD COLUMN workspaceId TEXT DEFAULT 'default'");
    } catch {}
  }

  async initialize(): Promise<void> {
    this.getDb().exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
      );
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
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, passwordHash TEXT NOT NULL,
        displayName TEXT NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY, userId TEXT NOT NULL, username TEXT NOT NULL, createdAt TEXT NOT NULL
      );
    `);
    this.migrateSchema();
    try {
      this.getDb().exec("ALTER TABLE workspaces ADD COLUMN userId TEXT DEFAULT ''");
    } catch {}
  }

  private wsFilter(): string {
    return this.workspaceId ? ' WHERE workspaceId = ?' : '';
  }

  async getAllMemoryEvents(): Promise<MemoryEvent[]> {
    const sql = this.workspaceId
      ? 'SELECT * FROM memory_events WHERE workspaceId = ? ORDER BY timestamp DESC'
      : 'SELECT * FROM memory_events ORDER BY timestamp DESC';
    const rows = this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId) as any[])
      : (this.getDb().prepare(sql).all() as any[]);
    return rows.map(this.mapEvent);
  }

  async getMemoryEvent(id: string): Promise<MemoryEvent | undefined> {
    const sql = this.workspaceId
      ? 'SELECT * FROM memory_events WHERE id = ? AND workspaceId = ?'
      : 'SELECT * FROM memory_events WHERE id = ?';
    const params = this.workspaceId ? [id, this.workspaceId] : [id];
    const row = this.getDb().prepare(sql).get(...params) as any;
    return row ? this.mapEvent(row) : undefined;
  }

  private wsId(entity?: { workspaceId?: string }): string {
    return entity?.workspaceId || this.workspaceId || 'default';
  }

  async addMemoryEvent(event: MemoryEvent): Promise<void> {
    this.getDb().prepare(`INSERT OR REPLACE INTO memory_events (id,type,sourceId,sourceType,title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(event.id, event.type, event.sourceId, event.sourceType, event.title, event.summary, event.content, event.author, event.timestamp, JSON.stringify(event.tags), JSON.stringify(event.entities), event.importance, event.metadata ? JSON.stringify(event.metadata) : null, event.createdAt, this.wsId(event));
  }

  async addMemoryEvents(events: MemoryEvent[]): Promise<void> {
    const stmt = this.getDb().prepare(`INSERT OR REPLACE INTO memory_events (id,type,sourceId,sourceType,title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    this.getDb().transaction((items: MemoryEvent[]) => { for (const e of items) stmt.run(e.id, e.type, e.sourceId, e.sourceType, e.title, e.summary, e.content, e.author, e.timestamp, JSON.stringify(e.tags), JSON.stringify(e.entities), e.importance, e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt, this.wsId(e)); })(events);
  }

  async getAllEntities(): Promise<Entity[]> {
    const sql = this.workspaceId
      ? 'SELECT * FROM entities WHERE workspaceId = ?'
      : 'SELECT * FROM entities';
    return this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId) as Entity[])
      : (this.getDb().prepare(sql).all() as Entity[]);
  }

  async getEntity(id: string): Promise<Entity | undefined> {
    const sql = this.workspaceId
      ? 'SELECT * FROM entities WHERE id = ? AND workspaceId = ?'
      : 'SELECT * FROM entities WHERE id = ?';
    const params = this.workspaceId ? [id, this.workspaceId] : [id];
    return this.getDb().prepare(sql).get(...params) as Entity | undefined;
  }

  async addEntity(entity: Entity): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO entities (id,name,type,description,metadata,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?)').run(entity.id, entity.name, entity.type, entity.description, entity.metadata ? JSON.stringify(entity.metadata) : null, entity.createdAt, this.wsId(entity));
  }

  async addEntities(entities: Entity[]): Promise<void> {
    const stmt = this.getDb().prepare('INSERT OR REPLACE INTO entities (id,name,type,description,metadata,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?)');
    this.getDb().transaction((items: Entity[]) => { for (const e of items) stmt.run(e.id, e.name, e.type, e.description, e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt, this.wsId(e)); })(entities);
  }

  async getAllRelations(): Promise<Relation[]> {
    const sql = this.workspaceId
      ? `SELECT r.* FROM relations r JOIN entities e1 ON r.sourceId=e1.id JOIN entities e2 ON r.targetId=e2.id WHERE e1.workspaceId=? AND e2.workspaceId=?`
      : 'SELECT * FROM relations';
    return this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId, this.workspaceId) as Relation[])
      : (this.getDb().prepare('SELECT * FROM relations').all() as Relation[]);
  }

  async addRelation(relation: Relation): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO relations (id,sourceId,targetId,type,description,weight,createdAt) VALUES(?,?,?,?,?,?,?)').run(relation.id, relation.sourceId, relation.targetId, relation.type, relation.description, relation.weight, relation.createdAt);
  }

  async addRelations(relations: Relation[]): Promise<void> {
    const stmt = this.getDb().prepare('INSERT OR REPLACE INTO relations (id,sourceId,targetId,type,description,weight,createdAt) VALUES(?,?,?,?,?,?,?)');
    this.getDb().transaction((items: Relation[]) => { for (const r of items) stmt.run(r.id, r.sourceId, r.targetId, r.type, r.description, r.weight, r.createdAt); })(relations);
  }

  async getAllSources(): Promise<Source[]> {
    const sql = this.workspaceId
      ? 'SELECT * FROM sources WHERE workspaceId = ? ORDER BY timestamp DESC'
      : 'SELECT * FROM sources ORDER BY timestamp DESC';
    return this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId) as Source[])
      : (this.getDb().prepare(sql).all() as Source[]);
  }

  async getSource(id: string): Promise<Source | undefined> {
    const sql = this.workspaceId
      ? 'SELECT * FROM sources WHERE id = ? AND workspaceId = ?'
      : 'SELECT * FROM sources WHERE id = ?';
    const params = this.workspaceId ? [id, this.workspaceId] : [id];
    return this.getDb().prepare(sql).get(...params) as Source | undefined;
  }

  async addSource(source: Source): Promise<void> {
    this.getDb().prepare('INSERT OR REPLACE INTO sources (id,name,type,content,author,timestamp,eventCount,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?,?,?)').run(source.id, source.name, source.type, source.content, source.author, source.timestamp, source.eventCount, source.createdAt, this.wsId(source));
  }

  async getAllTags(): Promise<Tag[]> {
    const sql = this.workspaceId
      ? 'SELECT * FROM tags WHERE workspaceId = ? ORDER BY count DESC'
      : 'SELECT * FROM tags ORDER BY count DESC';
    return this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId) as Tag[])
      : (this.getDb().prepare(sql).all() as Tag[]);
  }

  async incrementTag(name: string): Promise<void> {
    const wsId = this.workspaceId || 'default';
    const existing = this.getDb().prepare('SELECT * FROM tags WHERE name = ? AND workspaceId = ?').get(name, wsId) as any;
    existing
      ? this.getDb().prepare('UPDATE tags SET count = count + 1 WHERE name = ? AND workspaceId = ?').run(name, wsId)
      : this.getDb().prepare('INSERT INTO tags (id,name,count,workspaceId) VALUES(?,?,1,?)').run(name, name, wsId);
  }

  async addQueryLog(log: QueryLog): Promise<void> {
    this.getDb().prepare('INSERT INTO query_logs (id,query,response,memoryReferences,confidence,createdAt,workspaceId) VALUES(?,?,?,?,?,?,?)').run(log.id, log.query, log.response, JSON.stringify(log.memoryReferences), log.confidence, log.createdAt, this.workspaceId || 'default');
  }

  async getRecentQueries(limit = 10): Promise<QueryLog[]> {
    const sql = this.workspaceId
      ? 'SELECT * FROM query_logs WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT ?'
      : 'SELECT * FROM query_logs ORDER BY createdAt DESC LIMIT ?';
    const rows = this.workspaceId
      ? (this.getDb().prepare(sql).all(this.workspaceId, limit) as any[])
      : (this.getDb().prepare(sql).all(limit) as any[]);
    return rows.map((r) => ({ ...r, memoryReferences: JSON.parse(r.memoryReferences || '[]') }));
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
    if (this.workspaceId) { sql += ' AND workspaceId=?'; params.push(this.workspaceId); }
    if (filters?.type) { sql += ' AND type=?'; params.push(filters.type); }
    if (filters?.source) { sql += ' AND sourceId=?'; params.push(filters.source); }
    sql += ' ORDER BY timestamp DESC';
    if (!query) { sql += ' LIMIT 50'; return (this.getDb().prepare(sql).all(...params) as any[]).map(this.mapEvent); }
    const rows = this.getDb().prepare(sql).all(...params) as any[];
    const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length === 0) return [];
    const scored = rows.map((r: any) => {
      const tags: string[] = JSON.parse(r.tags || '[]');
      const ents: string[] = JSON.parse(r.entities || '[]');
      const title = (r.title || '').toLowerCase();
      const summary = (r.summary || '').toLowerCase();
      const content = (r.content || '').toLowerCase();
      const author = (r.author || '').toLowerCase();
      const allTags = tags.join(' ').toLowerCase();
      const allEnts = ents.join(' ').toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (title.includes(token)) score += 10;
        if (summary.includes(token)) score += 5;
        if (content.includes(token)) score += 3;
        if (allTags.includes(token)) score += 6;
        if (allEnts.includes(token)) score += 4;
        if (author.includes(token)) score += 2;
      }
      return { row: r, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    return scored.map((r) => this.mapEvent(r.row));
  }

  async clear(): Promise<void> {
    this.getDb().exec('DELETE FROM conversation_messages; DELETE FROM query_logs; DELETE FROM relations; DELETE FROM entities; DELETE FROM memory_events; DELETE FROM sources; DELETE FROM tags; DELETE FROM workspaces;');
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.getDb().prepare('SELECT * FROM workspaces ORDER BY createdAt ASC').all() as Workspace[];
  }

  async addWorkspace(workspace: Workspace): Promise<void> {
    this.getDb().prepare('INSERT INTO workspaces (id,name,createdAt,updatedAt) VALUES(?,?,?,?)').run(workspace.id, workspace.name, workspace.createdAt, workspace.updatedAt);
  }

  async updateWorkspace(id: string, name: string): Promise<void> {
    this.getDb().prepare('UPDATE workspaces SET name=?, updatedAt=? WHERE id=?').run(name, new Date().toISOString(), id);
  }

  async deleteWorkspace(id: string): Promise<void> {
    const wsId = id;
    this.getDb().transaction(() => {
      this.getDb().prepare('DELETE FROM memory_events WHERE workspaceId=?').run(wsId);
      this.getDb().prepare('DELETE FROM entities WHERE workspaceId=?').run(wsId);
      this.getDb().prepare('DELETE FROM sources WHERE workspaceId=?').run(wsId);
      this.getDb().prepare('DELETE FROM tags WHERE workspaceId=?').run(wsId);
      this.getDb().prepare('DELETE FROM query_logs WHERE workspaceId=?').run(wsId);
      this.getDb().prepare('DELETE FROM workspaces WHERE id=?').run(wsId);
    })();
  }

  private mapEvent(row: any): MemoryEvent {
    return { id: row.id, type: row.type, sourceId: row.sourceId, sourceType: row.sourceType, title: row.title, summary: row.summary, content: row.content, author: row.author, timestamp: row.timestamp, tags: JSON.parse(row.tags || '[]'), entities: JSON.parse(row.entities || '[]'), importance: row.importance, metadata: row.metadata ? JSON.parse(row.metadata) : undefined, createdAt: row.createdAt };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getDb().prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  }

  async createUser(user: User): Promise<void> {
    this.getDb().prepare('INSERT INTO users (id,username,passwordHash,displayName,createdAt) VALUES(?,?,?,?,?)').run(user.id, user.username, user.passwordHash, user.displayName, user.createdAt);
  }

  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === user.passwordHash ? user : null;
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    return this.getDb().prepare('SELECT * FROM workspaces WHERE userId = ? ORDER BY createdAt ASC').all(userId) as Workspace[];
  }
}
