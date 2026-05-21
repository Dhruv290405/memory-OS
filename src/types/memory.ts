export type MemoryEventType =
  | 'decision'
  | 'discussion'
  | 'meeting'
  | 'commit'
  | 'note'
  | 'transcript'
  | 'issue'
  | 'risk'
  | 'outcome'
  | 'architecture'
  | 'requirement';

export type EntityType =
  | 'person'
  | 'project'
  | 'technology'
  | 'decision'
  | 'issue'
  | 'outcome'
  | 'team'
  | 'system';

export type RelationType =
  | 'influences'
  | 'depends_on'
  | 'leads_to'
  | 'mentions'
  | 'participates_in'
  | 'implements'
  | 'contradicts'
  | 'resolves';

export type SourceType = 'markdown' | 'json' | 'text' | 'transcript' | 'commit_log' | 'chat_export';

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  sourceId: string;
  sourceType: SourceType;
  title: string;
  summary: string;
  content: string;
  author: string;
  timestamp: string;
  tags: string[];
  entities: string[];
  importance: number;
  embedding?: number[];
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  description: string;
  weight: number;
  createdAt: string;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  content: string;
  author: string;
  timestamp: string;
  eventCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface QueryLog {
  id: string;
  query: string;
  response: string;
  memoryReferences: string[];
  confidence: number;
  createdAt: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
