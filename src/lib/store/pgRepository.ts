import crypto from 'crypto';
import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage, Workspace, User } from '@/types';
import { IMemoryRepository } from './interfaces';
import { getPool } from './sharedPg';

export class PostgresRepository implements IMemoryRepository {
  private initialized = false;
  private workspaceId: string | undefined;

  setWorkspaceContext(workspaceId?: string): void {
    this.workspaceId = workspaceId;
  }

  async initialize(): Promise<void> {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, "userId" TEXT DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS memory_events (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, "sourceId" TEXT NOT NULL, "sourceType" TEXT NOT NULL,
        title TEXT NOT NULL, summary TEXT NOT NULL, content TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Unknown', timestamp TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]', entities TEXT NOT NULL DEFAULT '[]',
        importance INTEGER NOT NULL DEFAULT 5, metadata TEXT, createdAt TEXT NOT NULL,
        "workspaceId" TEXT DEFAULT 'default'
      );
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        description TEXT DEFAULT '', metadata TEXT, createdAt TEXT NOT NULL,
        "workspaceId" TEXT DEFAULT 'default'
      );
      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY, "sourceId" TEXT NOT NULL, "targetId" TEXT NOT NULL,
        type TEXT NOT NULL, description TEXT DEFAULT '',
        weight INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, content TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Unknown', timestamp TEXT NOT NULL,
        "eventCount" INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL,
        "workspaceId" TEXT DEFAULT 'default'
      );
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1,
        "workspaceId" TEXT DEFAULT 'default'
      );
      CREATE TABLE IF NOT EXISTS query_logs (
        id TEXT PRIMARY KEY, query TEXT NOT NULL, response TEXT NOT NULL,
        "memoryReferences" TEXT NOT NULL DEFAULT '[]', confidence REAL NOT NULL DEFAULT 0, createdAt TEXT NOT NULL,
        "workspaceId" TEXT DEFAULT 'default'
      );
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id TEXT PRIMARY KEY, "conversationId" TEXT NOT NULL, role TEXT NOT NULL,
        content TEXT NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, "passwordHash" TEXT NOT NULL,
        "displayName" TEXT NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pg_mem_events_type ON memory_events(type);
      CREATE INDEX IF NOT EXISTS idx_pg_mem_events_source ON memory_events("sourceId");
      CREATE INDEX IF NOT EXISTS idx_pg_mem_events_ts ON memory_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_pg_entities_name ON entities(name);
      CREATE INDEX IF NOT EXISTS idx_pg_rels_source ON relations("sourceId");
      CREATE INDEX IF NOT EXISTS idx_pg_rels_target ON relations("targetId");
      CREATE INDEX IF NOT EXISTS idx_pg_conv_id ON conversation_messages("conversationId");
      CREATE UNIQUE INDEX IF NOT EXISTS idx_pg_tags_name_ws ON tags(name, "workspaceId");
    `);
    this.initialized = true;
  }

  private assertReady(): void {
    if (!this.initialized) throw new Error('PostgresRepository not initialized');
  }

  private wsId(entity?: { workspaceId?: string }): string {
    return entity?.workspaceId || this.workspaceId || 'default';
  }

  private wsFilter(alias: string): { clause: string; params: string[] } {
    if (this.workspaceId) return { clause: `"${alias}"."workspaceId" = $1`, params: [this.workspaceId] };
    return { clause: '', params: [] };
  }

  private mapEvent(row: any): MemoryEvent {
    return {
      id: row.id, type: row.type, sourceId: row.sourceId, sourceType: row.sourceType,
      title: row.title, summary: row.summary, content: row.content, author: row.author,
      timestamp: row.timestamp,
      tags: JSON.parse(row.tags || '[]'), entities: JSON.parse(row.entities || '[]'),
      importance: row.importance, metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
    };
  }

  async getAllMemoryEvents(): Promise<MemoryEvent[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('m');
    const sql = ws.clause
      ? `SELECT * FROM memory_events m WHERE ${ws.clause} ORDER BY m.timestamp DESC`
      : 'SELECT * FROM memory_events ORDER BY timestamp DESC';
    const { rows } = await pool.query(sql, ws.params);
    return rows.map(this.mapEvent);
  }

  async getMemoryEvent(id: string): Promise<MemoryEvent | undefined> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('m');
    const sql = ws.clause
      ? `SELECT * FROM memory_events m WHERE m.id = $${ws.params.length + 1} AND ${ws.clause}`
      : 'SELECT * FROM memory_events WHERE id = $1';
    const params = [...ws.params, id];
    const { rows } = await pool.query(sql, params);
    return rows[0] ? this.mapEvent(rows[0]) : undefined;
  }

  async addMemoryEvent(event: MemoryEvent): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      `INSERT INTO memory_events (id,type,"sourceId","sourceType",title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt,"workspaceId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         type=EXCLUDED.type,"sourceId"=EXCLUDED."sourceId","sourceType"=EXCLUDED."sourceType",
         title=EXCLUDED.title,summary=EXCLUDED.summary,content=EXCLUDED.content,
         author=EXCLUDED.author,timestamp=EXCLUDED.timestamp,tags=EXCLUDED.tags,
         entities=EXCLUDED.entities,importance=EXCLUDED.importance,metadata=EXCLUDED.metadata,
         createdAt=EXCLUDED.createdAt,"workspaceId"=EXCLUDED."workspaceId"`,
      [event.id, event.type, event.sourceId, event.sourceType, event.title, event.summary,
       event.content, event.author, event.timestamp, JSON.stringify(event.tags),
       JSON.stringify(event.entities), event.importance,
       event.metadata ? JSON.stringify(event.metadata) : null, event.createdAt, this.wsId(event)]
    );
  }

  async addMemoryEvents(events: MemoryEvent[]): Promise<void> {
    this.assertReady();
    const pool = getPool();
    for (const e of events) {
      await pool.query(
        `INSERT INTO memory_events (id,type,"sourceId","sourceType",title,summary,content,author,timestamp,tags,entities,importance,metadata,createdAt,"workspaceId")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET
           type=EXCLUDED.type,"sourceId"=EXCLUDED."sourceId","sourceType"=EXCLUDED."sourceType",
           title=EXCLUDED.title,summary=EXCLUDED.summary,content=EXCLUDED.content,
           author=EXCLUDED.author,timestamp=EXCLUDED.timestamp,tags=EXCLUDED.tags,
           entities=EXCLUDED.entities,importance=EXCLUDED.importance,metadata=EXCLUDED.metadata,
           createdAt=EXCLUDED.createdAt,"workspaceId"=EXCLUDED."workspaceId"`,
        [e.id, e.type, e.sourceId, e.sourceType, e.title, e.summary, e.content, e.author,
         e.timestamp, JSON.stringify(e.tags), JSON.stringify(e.entities), e.importance,
         e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt, this.wsId(e)]
      );
    }
  }

  async getAllEntities(): Promise<Entity[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('e');
    const sql = ws.clause
      ? `SELECT * FROM entities e WHERE ${ws.clause}`
      : 'SELECT * FROM entities';
    const { rows } = await pool.query(sql, ws.params);
    return rows;
  }

  async getEntity(id: string): Promise<Entity | undefined> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('e');
    const sql = ws.clause
      ? `SELECT * FROM entities e WHERE e.id = $${ws.params.length + 1} AND ${ws.clause}`
      : 'SELECT * FROM entities WHERE id = $1';
    const { rows } = await pool.query(sql, [...ws.params, id]);
    return rows[0] || undefined;
  }

  async addEntity(entity: Entity): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      `INSERT INTO entities (id,name,type,description,metadata,createdAt,"workspaceId")
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,type=EXCLUDED.type,description=EXCLUDED.description,
         metadata=EXCLUDED.metadata,createdAt=EXCLUDED.createdAt,"workspaceId"=EXCLUDED."workspaceId"`,
      [entity.id, entity.name, entity.type, entity.description,
       entity.metadata ? JSON.stringify(entity.metadata) : null, entity.createdAt, this.wsId(entity)]
    );
  }

  async addEntities(entities: Entity[]): Promise<void> {
    this.assertReady();
    const pool = getPool();
    for (const e of entities) {
      await pool.query(
        `INSERT INTO entities (id,name,type,description,metadata,createdAt,"workspaceId")
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name,type=EXCLUDED.type,description=EXCLUDED.description,
           metadata=EXCLUDED.metadata,createdAt=EXCLUDED.createdAt,"workspaceId"=EXCLUDED."workspaceId"`,
        [e.id, e.name, e.type, e.description,
         e.metadata ? JSON.stringify(e.metadata) : null, e.createdAt, this.wsId(e)]
      );
    }
  }

  async getAllRelations(): Promise<Relation[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('e1');
    const sql = ws.clause
      ? `SELECT r.* FROM relations r JOIN entities e1 ON r."sourceId"=e1.id JOIN entities e2 ON r."targetId"=e2.id WHERE ${ws.clause} AND e2."workspaceId"=$${ws.params.length + 1}`
      : 'SELECT * FROM relations';
    const params = ws.clause ? [...ws.params, this.workspaceId] : [];
    const { rows } = await pool.query(sql, params);
    return rows;
  }

  async addRelation(relation: Relation): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      `INSERT INTO relations (id,"sourceId","targetId",type,description,weight,createdAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         "sourceId"=EXCLUDED."sourceId","targetId"=EXCLUDED."targetId",type=EXCLUDED.type,
         description=EXCLUDED.description,weight=EXCLUDED.weight,createdAt=EXCLUDED.createdAt`,
      [relation.id, relation.sourceId, relation.targetId, relation.type, relation.description, relation.weight, relation.createdAt]
    );
  }

  async addRelations(relations: Relation[]): Promise<void> {
    this.assertReady();
    const pool = getPool();
    for (const r of relations) {
      await pool.query(
        `INSERT INTO relations (id,"sourceId","targetId",type,description,weight,createdAt)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           "sourceId"=EXCLUDED."sourceId","targetId"=EXCLUDED."targetId",type=EXCLUDED.type,
           description=EXCLUDED.description,weight=EXCLUDED.weight,createdAt=EXCLUDED.createdAt`,
        [r.id, r.sourceId, r.targetId, r.type, r.description, r.weight, r.createdAt]
      );
    }
  }

  async getAllSources(): Promise<Source[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('s');
    const sql = ws.clause
      ? `SELECT * FROM sources s WHERE ${ws.clause} ORDER BY s.timestamp DESC`
      : 'SELECT * FROM sources ORDER BY timestamp DESC';
    const { rows } = await pool.query(sql, ws.params);
    return rows;
  }

  async getSource(id: string): Promise<Source | undefined> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('s');
    const sql = ws.clause
      ? `SELECT * FROM sources s WHERE s.id = $${ws.params.length + 1} AND ${ws.clause}`
      : 'SELECT * FROM sources WHERE id = $1';
    const { rows } = await pool.query(sql, [...ws.params, id]);
    return rows[0] || undefined;
  }

  async addSource(source: Source): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      `INSERT INTO sources (id,name,type,content,author,timestamp,"eventCount",createdAt,"workspaceId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,type=EXCLUDED.type,content=EXCLUDED.content,
         author=EXCLUDED.author,timestamp=EXCLUDED.timestamp,"eventCount"=EXCLUDED."eventCount",
         createdAt=EXCLUDED.createdAt,"workspaceId"=EXCLUDED."workspaceId"`,
      [source.id, source.name, source.type, source.content, source.author,
       source.timestamp, source.eventCount, source.createdAt, this.wsId(source)]
    );
  }

  async getAllTags(): Promise<Tag[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('t');
    const sql = ws.clause
      ? `SELECT * FROM tags t WHERE ${ws.clause} ORDER BY t.count DESC`
      : 'SELECT * FROM tags ORDER BY count DESC';
    const { rows } = await pool.query(sql, ws.params);
    return rows;
  }

  async incrementTag(name: string): Promise<void> {
    this.assertReady();
    const pool = getPool();
    const wsId = this.workspaceId || 'default';
    await pool.query(
      `INSERT INTO tags (id,name,count,"workspaceId") VALUES ($1,$2,1,$3)
       ON CONFLICT (name, "workspaceId") DO UPDATE SET count = tags.count + 1`,
      [name, name, wsId]
    );
  }

  async addQueryLog(log: QueryLog): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      `INSERT INTO query_logs (id,query,response,"memoryReferences",confidence,createdAt,"workspaceId")
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [log.id, log.query, log.response, JSON.stringify(log.memoryReferences), log.confidence, log.createdAt, this.workspaceId || 'default']
    );
  }

  async getRecentQueries(limit = 10): Promise<QueryLog[]> {
    this.assertReady();
    const pool = getPool();
    const ws = this.wsFilter('q');
    const sql = ws.clause
      ? `SELECT * FROM query_logs q WHERE ${ws.clause} ORDER BY q."createdAt" DESC LIMIT $${ws.params.length + 1}`
      : 'SELECT * FROM query_logs ORDER BY "createdAt" DESC LIMIT $1';
    const { rows } = await pool.query(sql, [...ws.params, limit]);
    return rows.map((r: any) => ({ ...r, memoryReferences: JSON.parse(r.memoryReferences || '[]') }));
  }

  async getConversation(id: string): Promise<ConversationMessage[] | undefined> {
    this.assertReady();
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT role,content FROM conversation_messages WHERE "conversationId"=$1 ORDER BY createdAt ASC',
      [id]
    );
    return rows.length > 0 ? rows : undefined;
  }

  async addConversationMessage(id: string, message: ConversationMessage): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      'INSERT INTO conversation_messages (id,"conversationId",role,content,createdAt) VALUES ($1,$2,$3,$4,$5)',
      [`${id}-${Date.now()}`, id, message.role, message.content, new Date().toISOString()]
    );
  }

  async searchEvents(query: string, filters?: { type?: string; source?: string; tag?: string }): Promise<MemoryEvent[]> {
    this.assertReady();
    const pool = getPool();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (this.workspaceId) { conditions.push(`"workspaceId" = $${idx++}`); params.push(this.workspaceId); }
    if (filters?.type) { conditions.push(`type = $${idx++}`); params.push(filters.type); }
    if (filters?.source) { conditions.push(`"sourceId" = $${idx++}`); params.push(filters.source); }
    if (filters?.tag) { conditions.push(`tags::text LIKE $${idx++}`); params.push(`%"${filters.tag}"%`); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM memory_events ${where} ORDER BY timestamp DESC`;

    if (!query) {
      const limited = `${sql} LIMIT 50`;
      const { rows } = await pool.query(limited, params);
      return rows.map(this.mapEvent);
    }

    const { rows } = await pool.query(sql, params);
    const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length === 0) return [];

    const scored: Array<{ row: any; score: number }> = rows.map((r: any) => {
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
      .filter((r: { score: number }) => r.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 50);
    return scored.map((r: { row: any }) => this.mapEvent(r.row));
  }

  async clear(): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query('DELETE FROM conversation_messages');
    await pool.query('DELETE FROM query_logs');
    await pool.query('DELETE FROM relations');
    await pool.query('DELETE FROM entities');
    await pool.query('DELETE FROM memory_events');
    await pool.query('DELETE FROM sources');
    await pool.query('DELETE FROM tags');
    await pool.query('DELETE FROM workspaces');
  }

  async getWorkspaces(): Promise<Workspace[]> {
    this.assertReady();
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM workspaces ORDER BY "createdAt" ASC');
    return rows;
  }

  async addWorkspace(workspace: Workspace): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      'INSERT INTO workspaces (id,name,"createdAt","updatedAt") VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING',
      [workspace.id, workspace.name, workspace.createdAt, workspace.updatedAt]
    );
  }

  async updateWorkspace(id: string, name: string): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      'UPDATE workspaces SET name=$1, "updatedAt"=$2 WHERE id=$3',
      [name, new Date().toISOString(), id]
    );
  }

  async deleteWorkspace(id: string): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query('DELETE FROM memory_events WHERE "workspaceId"=$1', [id]);
    await pool.query('DELETE FROM entities WHERE "workspaceId"=$1', [id]);
    await pool.query('DELETE FROM sources WHERE "workspaceId"=$1', [id]);
    await pool.query('DELETE FROM tags WHERE "workspaceId"=$1', [id]);
    await pool.query('DELETE FROM query_logs WHERE "workspaceId"=$1', [id]);
    await pool.query('DELETE FROM workspaces WHERE id=$1', [id]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    this.assertReady();
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] || undefined;
  }

  async createUser(user: User): Promise<void> {
    this.assertReady();
    const pool = getPool();
    await pool.query(
      'INSERT INTO users (id,username,"passwordHash","displayName","createdAt") VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',
      [user.id, user.username, user.passwordHash, user.displayName, user.createdAt]
    );
  }

  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === user.passwordHash ? user : null;
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    this.assertReady();
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM workspaces WHERE "userId" = $1 ORDER BY "createdAt" ASC', [userId]);
    return rows;
  }
}
