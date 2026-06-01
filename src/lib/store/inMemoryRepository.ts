import crypto from 'crypto';
import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage, Workspace, User } from '@/types';
import { IMemoryRepository } from './interfaces';

export class InMemoryRepository implements IMemoryRepository {
  private memoryEvents: Map<string, MemoryEvent> = new Map();
  private entities: Map<string, Entity> = new Map();
  private relations: Map<string, Relation> = new Map();
  private sources: Map<string, Source> = new Map();
  private tags: Map<string, Tag> = new Map();
  private queryLogs: Map<string, QueryLog> = new Map();
  private conversations: Map<string, ConversationMessage[]> = new Map();
  private workspaces: Map<string, Workspace> = new Map();
  private users: Map<string, User> = new Map();
  private workspaceId: string | undefined;

  async initialize(): Promise<void> {}

  setWorkspaceContext(workspaceId?: string): void {
    this.workspaceId = workspaceId;
  }

  getAllMemoryEvents(): MemoryEvent[] {
    let entries = Array.from(this.memoryEvents.values());
    if (this.workspaceId) entries = entries.filter((e) => e.workspaceId === this.workspaceId);
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getMemoryEvent(id: string): MemoryEvent | undefined {
    const e = this.memoryEvents.get(id);
    if (e && this.workspaceId && e.workspaceId !== this.workspaceId) return undefined;
    return e;
  }

  addMemoryEvent(event: MemoryEvent): void {
    this.memoryEvents.set(event.id, { ...event, workspaceId: event.workspaceId || this.workspaceId || 'default' });
  }

  addMemoryEvents(events: MemoryEvent[]): void {
    const wsId = this.workspaceId || 'default';
    events.forEach((e) => this.memoryEvents.set(e.id, { ...e, workspaceId: e.workspaceId || wsId }));
  }

  getAllEntities(): Entity[] {
    let entries = Array.from(this.entities.values());
    if (this.workspaceId) entries = entries.filter((e: any) => e.workspaceId === this.workspaceId);
    return entries;
  }

  getEntity(id: string): Entity | undefined {
    const e = this.entities.get(id);
    if (e && this.workspaceId && (e as any).workspaceId !== this.workspaceId) return undefined;
    return e;
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, { ...entity, workspaceId: (entity as any).workspaceId || this.workspaceId || 'default' });
  }

  addEntities(entities: Entity[]): void {
    const wsId = this.workspaceId || 'default';
    entities.forEach((e) => this.entities.set(e.id, { ...e, workspaceId: (e as any).workspaceId || wsId }));
  }

  getAllRelations(): Relation[] {
    let entries = Array.from(this.relations.values());
    if (this.workspaceId) {
      const entityIds = new Set(
        Array.from(this.entities.values())
          .filter((e: any) => e.workspaceId === this.workspaceId)
          .map((e) => e.id)
      );
      entries = entries.filter((r) => entityIds.has(r.sourceId) && entityIds.has(r.targetId));
    }
    return entries;
  }

  addRelation(relation: Relation): void {
    this.relations.set(relation.id, relation);
  }

  addRelations(relations: Relation[]): void {
    relations.forEach((r) => this.relations.set(r.id, r));
  }

  getAllSources(): Source[] {
    let entries = Array.from(this.sources.values());
    if (this.workspaceId) entries = entries.filter((s: any) => s.workspaceId === this.workspaceId);
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getSource(id: string): Source | undefined {
    const s = this.sources.get(id);
    if (s && this.workspaceId && (s as any).workspaceId !== this.workspaceId) return undefined;
    return s;
  }

  addSource(source: Source): void {
    this.sources.set(source.id, { ...source, workspaceId: (source as any).workspaceId || this.workspaceId || 'default' });
  }

  getAllTags(): Tag[] {
    let entries = Array.from(this.tags.values());
    if (this.workspaceId) entries = entries.filter((t: any) => t.workspaceId === this.workspaceId);
    return entries.sort((a, b) => b.count - a.count);
  }

  incrementTag(name: string): void {
    const key = `${this.workspaceId || 'default'}:${name}`;
    const existing = this.tags.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      const tag: Tag & { workspaceId: string } = { id: key, name, count: 1, workspaceId: this.workspaceId || 'default' };
      this.tags.set(key, tag);
    }
  }

  addQueryLog(log: QueryLog): void {
    this.queryLogs.set(log.id, log);
  }

  getRecentQueries(limit = 10): QueryLog[] {
    return Array.from(this.queryLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getConversation(id: string): ConversationMessage[] | undefined {
    return this.conversations.get(id);
  }

  addConversationMessage(id: string, message: ConversationMessage): void {
    const existing = this.conversations.get(id) || [];
    existing.push(message);
    this.conversations.set(id, existing);
  }

  searchEvents(query: string, filters?: { type?: string; source?: string; tag?: string }): MemoryEvent[] {
    const q = query.toLowerCase();
    let results = this.getAllMemoryEvents();

    if (filters?.type) {
      results = results.filter((e) => e.type === filters.type);
    }
    if (filters?.source) {
      results = results.filter((e) => e.sourceId === filters.source);
    }
    if (filters?.tag) {
      results = results.filter((e) => e.tags.includes(filters.tag!));
    }

    if (!query) return results.slice(0, 50);

    const tokens = q.split(/\s+/).filter((t) => t.length > 2);

    if (tokens.length === 0) return [];

    return results
      .map((event) => ({
        event,
        score: tokens.reduce((acc, token) => acc +
          (event.title.toLowerCase().includes(token) ? 2 : 0) +
          (event.summary.toLowerCase().includes(token) ? 1 : 0) +
          (event.content.toLowerCase().includes(token) ? 1 : 0) +
          (event.tags.some((t) => t.toLowerCase().includes(token)) ? 2 : 0) +
          (event.entities.some((e) => e.toLowerCase().includes(token)) ? 2 : 0) +
          (event.author.toLowerCase().includes(token) ? 1 : 0), 0),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map((r) => r.event);
  }

  clear(): void {
    this.memoryEvents.clear();
    this.entities.clear();
    this.relations.clear();
    this.sources.clear();
    this.tags.clear();
    this.queryLogs.clear();
    this.conversations.clear();
    this.workspaces.clear();
  }

  getWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  addWorkspace(workspace: Workspace): void {
    this.workspaces.set(workspace.id, workspace);
  }

  updateWorkspace(id: string, name: string): void {
    const ws = this.workspaces.get(id);
    if (ws) {
      ws.name = name;
      ws.updatedAt = new Date().toISOString();
      this.workspaces.set(id, ws);
    }
  }

  deleteWorkspace(id: string): void {
    this.workspaces.delete(id);
    for (const [key, e] of this.memoryEvents) { if ((e as any).workspaceId === id) this.memoryEvents.delete(key); }
    for (const [key, e] of this.entities) { if ((e as any).workspaceId === id) this.entities.delete(key); }
    for (const [key, s] of this.sources) { if ((s as any).workspaceId === id) this.sources.delete(key); }
    for (const [key] of this.tags) { if (key.startsWith(`${id}:`)) this.tags.delete(key); }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === user.passwordHash ? user : null;
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    return Array.from(this.workspaces.values()).filter((w) => w.userId === userId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
}
