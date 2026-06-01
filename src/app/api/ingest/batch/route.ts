import { NextRequest } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getMemoryRepository, getVectorRepository } from '@/lib/store';
import { RawEvent } from '@/lib/ingestion/parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, workspaceId } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return Response.json(
        { error: 'Missing required field: events must be a non-empty array' },
        { status: 400 }
      );
    }

    const mem = await getMemoryRepository();
    if (workspaceId) mem.setWorkspaceContext(workspaceId);
    const vec = await getVectorRepository();

    const batchSourceId = `src-batch-${uuid().slice(0, 8)}`;
    const now = new Date().toISOString();

    const memoryEvents = events.map((raw: RawEvent) => ({
      id: `evt-${uuid().slice(0, 8)}`,
      type: raw.type || 'note',
      sourceId: batchSourceId,
      sourceType: 'json' as const,
      title: raw.title || 'Untitled',
      summary: raw.summary || '',
      content: raw.content || '',
      author: raw.author || 'Unknown',
      timestamp: raw.timestamp || now,
      tags: raw.tags || [],
      entities: raw.entities || [],
      importance: raw.importance ?? 5,
      createdAt: now,
      workspaceId: workspaceId || undefined,
    }));

    await mem.addMemoryEvents(memoryEvents);

    for (const event of memoryEvents) {
      await vec.indexEvent(event, event.title + ' ' + event.summary + ' ' + event.content);
      for (const t of event.tags) await mem.incrementTag(t);
    }

    return Response.json({ created: memoryEvents.length });
  } catch (error) {
    console.error('Batch ingest error:', error);
    return Response.json({ error: 'Failed to process batch ingestion' }, { status: 500 });
  }
}
