import { MemoryEvent, Entity, Relation, Source, Tag, QueryLog, ConversationMessage, Workspace, User } from '@/types/memory';

export interface IMemoryRepository {
  initialize(): Promise<void>;

  getAllMemoryEvents(): MemoryEvent[] | Promise<MemoryEvent[]>;
  getMemoryEvent(id: string): MemoryEvent | undefined | Promise<MemoryEvent | undefined>;
  addMemoryEvent(event: MemoryEvent): void | Promise<void>;
  addMemoryEvents(events: MemoryEvent[]): void | Promise<void>;

  getAllEntities(): Entity[] | Promise<Entity[]>;
  getEntity(id: string): Entity | undefined | Promise<Entity | undefined>;
  addEntity(entity: Entity): void | Promise<void>;
  addEntities(entities: Entity[]): void | Promise<void>;

  getAllRelations(): Relation[] | Promise<Relation[]>;
  addRelation(relation: Relation): void | Promise<void>;
  addRelations(relations: Relation[]): void | Promise<void>;

  getAllSources(): Source[] | Promise<Source[]>;
  getSource(id: string): Source | undefined | Promise<Source | undefined>;
  addSource(source: Source): void | Promise<void>;

  getAllTags(): Tag[] | Promise<Tag[]>;
  incrementTag(name: string): void | Promise<void>;

  addQueryLog(log: QueryLog): void | Promise<void>;
  getRecentQueries(limit?: number): QueryLog[] | Promise<QueryLog[]>;

  getConversation(id: string): ConversationMessage[] | undefined | Promise<ConversationMessage[] | undefined>;
  addConversationMessage(id: string, message: ConversationMessage): void | Promise<void>;

  searchEvents(query: string, filters?: { type?: string; source?: string; tag?: string }): MemoryEvent[] | Promise<MemoryEvent[]>;

  clear(): void | Promise<void>;

  setWorkspaceContext(workspaceId?: string): void;

  getWorkspaces(): Workspace[] | Promise<Workspace[]>;
  addWorkspace(workspace: Workspace): void | Promise<void>;
  updateWorkspace(id: string, name: string): void | Promise<void>;
  deleteWorkspace(id: string): void | Promise<void>;

  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: User): Promise<void>;
  validatePassword(username: string, password: string): Promise<User | null>;
  getWorkspacesByUser(userId: string): Promise<Workspace[]>;
}

export interface IVectorRepository {
  initialize(): Promise<void>;
  embed(text: string): Promise<number[]>;
  indexEvent(event: MemoryEvent, content: string): Promise<void>;
  search(query: string, topK?: number): Promise<Array<{ eventId: string; score: number }>>;
  clear(): void | Promise<void>;
}

export type BackendType = 'in-memory' | 'postgres' | 'sqlite';

export interface StorageConfig {
  backend: BackendType;
  sqlitePath?: string;
}
