import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage } from '@/types';
import { IMemoryRepository } from './interfaces';

const PRISMA_MODULE = ['@', 'prisma', '/', 'client'].join('');

export class PostgresRepository implements IMemoryRepository {
  private initialized = false;

  async initialize(): Promise<void> {
    const { PrismaClient } = await import(PRISMA_MODULE);
    const client = new PrismaClient();
    await client.$connect();
    await client.$disconnect();
    this.initialized = true;
  }

  private assertReady(): void {
    if (!this.initialized) throw new Error('PostgresRepository not initialized');
  }

  private async withClient<T>(fn: (client: any) => Promise<T>): Promise<T> {
    this.assertReady();
    const { PrismaClient } = await import(PRISMA_MODULE);
    const client = new PrismaClient();
    try { return await fn(client); } finally { await client.$disconnect(); }
  }

  private mapEvent(row: any): MemoryEvent {
    return { ...row, timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp, createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt };
  }

  private inputEvent(e: MemoryEvent): any {
    return { ...e, timestamp: new Date(e.timestamp), createdAt: new Date(e.createdAt) };
  }

  async getAllMemoryEvents(): Promise<MemoryEvent[]> {
    return this.withClient((c) => c.memoryEvent.findMany({ orderBy: { timestamp: 'desc' } }).then((r: any[]) => r.map(this.mapEvent.bind(this))));
  }

  async getMemoryEvent(id: string): Promise<MemoryEvent | undefined> {
    return this.withClient(async (c) => { const r = await c.memoryEvent.findUnique({ where: { id } }); return r ? this.mapEvent(r) : undefined; });
  }

  async addMemoryEvent(event: MemoryEvent): Promise<void> {
    return this.withClient((c) => c.memoryEvent.create({ data: this.inputEvent(event) }));
  }

  async addMemoryEvents(events: MemoryEvent[]): Promise<void> {
    return this.withClient((c) => c.memoryEvent.createMany({ data: events.map((e) => this.inputEvent(e)), skipDuplicates: true }));
  }

  async getAllEntities(): Promise<Entity[]> {
    return this.withClient((c) => c.entity.findMany());
  }

  async getEntity(id: string): Promise<Entity | undefined> {
    return this.withClient(async (c) => { const r = await c.entity.findUnique({ where: { id } }); return r || undefined; });
  }

  async addEntity(entity: Entity): Promise<void> {
    return this.withClient((c) => c.entity.create({ data: entity }));
  }

  async addEntities(entities: Entity[]): Promise<void> {
    return this.withClient((c) => c.entity.createMany({ data: entities, skipDuplicates: true }));
  }

  async getAllRelations(): Promise<Relation[]> {
    return this.withClient((c) => c.relation.findMany());
  }

  async addRelation(relation: Relation): Promise<void> {
    return this.withClient((c) => c.relation.create({ data: relation }));
  }

  async addRelations(relations: Relation[]): Promise<void> {
    return this.withClient((c) => c.relation.createMany({ data: relations, skipDuplicates: true }));
  }

  async getAllSources(): Promise<Source[]> {
    return this.withClient(async (c) => { const rows = await c.source.findMany({ orderBy: { timestamp: 'desc' } }); return rows.map((r: any) => ({ ...r, timestamp: r.timestamp.toISOString(), createdAt: r.createdAt.toISOString() })); });
  }

  async getSource(id: string): Promise<Source | undefined> {
    return this.withClient(async (c) => { const r = await c.source.findUnique({ where: { id } }); if (!r) return undefined; return { ...r, timestamp: r.timestamp.toISOString(), createdAt: r.createdAt.toISOString() }; });
  }

  async addSource(source: Source): Promise<void> {
    return this.withClient((c) => c.source.create({ data: { ...source, timestamp: new Date(source.timestamp), createdAt: new Date(source.createdAt) } }));
  }

  async getAllTags(): Promise<Tag[]> {
    return this.withClient((c) => c.tag.findMany({ orderBy: { count: 'desc' } }));
  }

  async incrementTag(name: string): Promise<void> {
    return this.withClient((c) => c.tag.upsert({ where: { name }, update: { count: { increment: 1 } }, create: { id: name, name, count: 1 } }));
  }

  async addQueryLog(log: QueryLog): Promise<void> {
    return this.withClient((c) => c.queryLog.create({ data: log }));
  }

  async getRecentQueries(limit = 10): Promise<QueryLog[]> {
    return this.withClient((c) => c.queryLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit }));
  }

  async getConversation(id: string): Promise<ConversationMessage[] | undefined> {
    return this.withClient(async (c) => { const rows = await c.conversationMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } }); return rows.length > 0 ? rows.map((r: any) => ({ role: r.role, content: r.content })) : undefined; });
  }

  async addConversationMessage(id: string, message: ConversationMessage): Promise<void> {
    return this.withClient((c) => c.conversationMessage.create({ data: { id: `${id}-${Date.now()}`, conversationId: id, role: message.role, content: message.content, createdAt: new Date() } }));
  }

  async searchEvents(query: string, filters?: { type?: string; source?: string; tag?: string }): Promise<MemoryEvent[]> {
    return this.withClient(async (c) => {
      const where: any = {};
      if (filters?.type) where.type = filters.type;
      if (filters?.source) where.sourceId = filters.source;
      if (filters?.tag) where.tags = { has: filters.tag };
      if (!query) { const rows = await c.memoryEvent.findMany({ where, orderBy: { timestamp: 'desc' }, take: 50 }); return rows.map(this.mapEvent.bind(this)); }
      const rows = await c.memoryEvent.findMany({ where, orderBy: { timestamp: 'desc' } });
      const q = query.toLowerCase();
      return rows.filter((r: any) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q) || r.content.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || (r.tags || []).some((t: string) => t.toLowerCase().includes(q))).slice(0, 50).map(this.mapEvent.bind(this));
    });
  }

  async clear(): Promise<void> {
    return this.withClient(async (c) => { await c.conversationMessage.deleteMany(); await c.queryLog.deleteMany(); await c.relation.deleteMany(); await c.entity.deleteMany(); await c.memoryEvent.deleteMany(); await c.source.deleteMany(); await c.tag.deleteMany(); });
  }
}
