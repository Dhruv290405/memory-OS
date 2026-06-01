import { v4 as uuid } from 'uuid';
import { getMemoryRepository, getVectorRepository } from '@/lib/store';
import { ollamaClient } from './ollama';

export interface RAGResult {
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
  aiAvailable: boolean;
}

export interface RAGOptions {
  query: string;
  conversationId?: string;
  topK?: number;
  workspaceId?: string;
}

const FOLLOW_UP_TEMPLATES = [
  'What decisions led to this outcome?',
  'Who was involved in this discussion?',
  'What were the risks identified?',
  'How does this relate to ongoing projects?',
  'What alternatives were considered?',
];

export async function askMemory(options: RAGOptions): Promise<RAGResult> {
  const convId = options.conversationId || `conv-${uuid().slice(0, 8)}`;
  const { query, topK = 8, workspaceId } = options;
  const mem = await getMemoryRepository();
  if (workspaceId) mem.setWorkspaceContext(workspaceId);
  const vec = await getVectorRepository();

  const keywordResults = await mem.searchEvents(query);
  const slicedKeywords = keywordResults.slice(0, topK);

  const vectorResults = await vec.search(query, topK);
  const vectorEventIds = new Set(vectorResults.map((r) => r.eventId));

  const allEvents = new Map<string, { event: any; score: number }>();

  for (const event of slicedKeywords) {
    allEvents.set(event.id, { event, score: 1 });
  }

  for (const vr of vectorResults) {
    const event = await mem.getMemoryEvent(vr.eventId);
    if (event) {
      const existing = allEvents.get(event.id);
      if (existing) {
        existing.score = Math.max(existing.score, vr.score);
      } else {
        allEvents.set(event.id, { event, score: vr.score });
      }
    }
  }

  const sortedEvents = Array.from(allEvents.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const contextStr = sortedEvents
    .map(
      (e, i) =>
        `[${i + 1}] Title: ${e.event.title}
Type: ${e.event.type}
Author: ${e.event.author}
Date: ${new Date(e.event.timestamp).toLocaleDateString()}
Summary: ${e.event.summary}
Content: ${e.event.content.slice(0, 500)}
Tags: ${e.event.tags.join(', ')}
Entities: ${e.event.entities.join(', ')}
Importance: ${e.event.importance}/10
---`
    )
    .join('\n\n');

  const systemPrompt = `You are MemoryOS, an AI organizational memory assistant. Your role is to answer questions based on retrieved memory events.

RULES:
1. Only answer based on the provided memory context. Do not make up information.
2. When referencing a memory event, cite it by number like [1], [2], etc.
3. If the context does not contain enough information, say so clearly.
4. Be specific and concise.
5. Use technical language appropriate for software engineering context.`;

  const userPrompt = `CONTEXT: The following memory events are relevant to the user's question:

${contextStr}

${sortedEvents.length === 0 ? 'No relevant memory events were found in the knowledge base.' : ''}

USER QUESTION: ${query}

Answer the question based on the memory events above. Cite sources as [1], [2], etc. If you cannot answer from the context, say so.`;

  await mem.addConversationMessage(convId, { role: 'user', content: query });

  await ollamaClient.checkAvailability();

  let answer: string;
  let confidence: number;
  let followUpSuggestions: string[];

  if (ollamaClient.isAvailable()) {
    answer = await ollamaClient.generate(userPrompt, systemPrompt);
    confidence = sortedEvents.length > 0
      ? Math.min(0.95, 0.5 + sortedEvents.length * 0.05 + sortedEvents[0].score * 0.2)
      : 0.1;
    followUpSuggestions = FOLLOW_UP_TEMPLATES.filter(() => Math.random() > 0.3).slice(0, 3);
  } else {
    const mockResult = ollamaClient.generateMockStructured(userPrompt);
    answer = mockResult.answer;
    confidence = mockResult.confidence;
    followUpSuggestions = mockResult.followUps;
  }

  await mem.addConversationMessage(convId, { role: 'assistant', content: answer });

  const references = sortedEvents.map((e) => ({
    id: e.event.id,
    title: e.event.title,
    summary: e.event.summary.slice(0, 150),
    score: Math.round(e.score * 100) / 100,
  }));

  await mem.addQueryLog({
    id: uuid(),
    query,
    response: answer,
    memoryReferences: references.map((r) => r.id),
    confidence,
    createdAt: new Date().toISOString(),
  });

  return {
    answer,
    references,
    confidence,
    followUpSuggestions,
    conversationId: convId,
    aiAvailable: ollamaClient.isAvailable(),
  };
}
