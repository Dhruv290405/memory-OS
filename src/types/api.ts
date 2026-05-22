export interface IngestRequest {
  content: string;
  type: string;
  name: string;
  author?: string;
  timestamp?: string;
}

export interface IngestResponse {
  sourceId: string;
  eventsCreated: number;
  message: string;
}

export interface SearchRequest {
  q: string;
  type?: string;
  source?: string;
  tag?: string;
  limit?: number;
}

export interface SearchResult {
  memoryEvent: import('./memory').MemoryEvent;
  score: number;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface AskRequest {
  query: string;
  conversationId?: string;
}

export interface AskResponse {
  answer: string;
  references: Array<{
    id: string;
    title: string;
    summary: string;
    score: number;
  }>;
  confidence: number;
  followUpSuggestions: string[];
  conversationId: string;
  aiAvailable?: boolean;
}

export interface InsightMetric {
  label: string;
  value: number | string;
  change?: string;
  icon?: string;
}

export interface TopicCluster {
  topic: string;
  count: number;
  keywords: string[];
  importance: number;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  type: string;
  author: string;
  importance: number;
  relatedEntities: string[];
}
