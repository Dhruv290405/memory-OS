import { MemoryEvent } from '@/types';
import { getMemoryRepository, getVectorRepository } from '@/lib/store';

export interface SearchOptions {
  q: string;
  type?: string;
  source?: string;
  tag?: string;
  limit?: number;
  workspaceId?: string;
}

export interface SearchResultItem {
  memoryEvent: MemoryEvent;
  score: number;
  snippet: string;
}

export async function hybridSearch(options: SearchOptions): Promise<SearchResultItem[]> {
  const { q, type, source, tag, limit = 10, workspaceId } = options;
  const mem = await getMemoryRepository();
  if (workspaceId) mem.setWorkspaceContext(workspaceId);
  const vec = await getVectorRepository();

  let results = await mem.searchEvents(q, { type, source, tag });

  if (results.length === 0 && q) {
    const vectorResults = await vec.search(q, limit * 2);
    const vectorEventIds = new Set(vectorResults.map((r) => r.eventId));
    const vectorEventMap = new Map(vectorResults.map((r) => [r.eventId, r.score]));

    const allEvents = await mem.getAllMemoryEvents();
    results = allEvents.filter((e) => vectorEventIds.has(e.id));

    return results
      .map((event) => ({
        memoryEvent: event,
        score: vectorEventMap.get(event.id) || 0,
        snippet: event.summary.slice(0, 200),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  return results.map((event) => ({
    memoryEvent: event,
    score: 1,
    snippet: generateSnippet(event, q),
  })).slice(0, limit);
}

function generateSnippet(event: MemoryEvent, query: string): string {
  if (!query) return event.summary.slice(0, 200);

  const lower = event.content.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);

  if (idx >= 0) {
    const start = Math.max(0, idx - 60);
    const end = Math.min(event.content.length, idx + qLower.length + 120);
    let snippet = event.content.slice(start, end).trim();
    if (start > 0) snippet = '...' + snippet;
    if (end < event.content.length) snippet = snippet + '...';
    return snippet;
  }

  return event.summary.slice(0, 200);
}
