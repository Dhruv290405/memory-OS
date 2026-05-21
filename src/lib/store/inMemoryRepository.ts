import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage } from '@/types';
import { IMemoryRepository } from './interfaces';

export class InMemoryRepository implements IMemoryRepository {
  private memoryEvents: Map<string, MemoryEvent> = new Map();
  private entities: Map<string, Entity> = new Map();
  private relations: Map<string, Relation> = new Map();
  private sources: Map<string, Source> = new Map();
  private tags: Map<string, Tag> = new Map();
  private queryLogs: Map<string, QueryLog> = new Map();
  private conversations: Map<string, ConversationMessage[]> = new Map();

  async initialize(): Promise<void> {}

  getAllMemoryEvents(): MemoryEvent[] {
    return Array.from(this.memoryEvents.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getMemoryEvent(id: string): MemoryEvent | undefined {
    return this.memoryEvents.get(id);
  }

  addMemoryEvent(event: MemoryEvent): void {
    this.memoryEvents.set(event.id, event);
  }

  addMemoryEvents(events: MemoryEvent[]): void {
    events.forEach((e) => this.memoryEvents.set(e.id, e));
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  addEntities(entities: Entity[]): void {
    entities.forEach((e) => this.entities.set(e.id, e));
  }

  getAllRelations(): Relation[] {
    return Array.from(this.relations.values());
  }

  addRelation(relation: Relation): void {
    this.relations.set(relation.id, relation);
  }

  addRelations(relations: Relation[]): void {
    relations.forEach((r) => this.relations.set(r.id, r));
  }

  getAllSources(): Source[] {
    return Array.from(this.sources.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getSource(id: string): Source | undefined {
    return this.sources.get(id);
  }

  addSource(source: Source): void {
    this.sources.set(source.id, source);
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values()).sort((a, b) => b.count - a.count);
  }

  incrementTag(name: string): void {
    const existing = this.tags.get(name);
    if (existing) {
      existing.count += 1;
      this.tags.set(name, existing);
    } else {
      this.tags.set(name, { id: name, name, count: 1 });
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

    return results
      .map((event) => ({
        event,
        score:
          (event.title.toLowerCase().includes(q) ? 10 : 0) +
          (event.summary.toLowerCase().includes(q) ? 5 : 0) +
          (event.content.toLowerCase().includes(q) ? 3 : 0) +
          (event.tags.some((t) => t.toLowerCase().includes(q)) ? 4 : 0) +
          (event.entities.some((e) => e.toLowerCase().includes(q)) ? 4 : 0) +
          (event.author.toLowerCase().includes(q) ? 2 : 0),
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
  }
}
