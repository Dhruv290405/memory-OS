import { NextRequest } from 'next/server';
import { getMemoryRepository, getVectorRepository } from '@/lib/store';
import { parseContent } from '@/lib/ingestion/parser';
import { v4 as uuid } from 'uuid';

export async function GET() {
  try {
    const mem = await getMemoryRepository();
    const sources = await mem.getAllSources();
    return Response.json({ sources, total: sources.length });
  } catch (error) {
    console.error('Sources error:', error);
    return Response.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, type, name, author, timestamp } = body;

    if (!content || !type || !name) {
      return Response.json(
        { error: 'Missing required fields: content, type, name' },
        { status: 400 }
      );
    }

    const mem = await getMemoryRepository();
    const vec = await getVectorRepository();
    const { source, events } = parseContent(content, type, name, author, timestamp);

    await mem.addSource(source);

    const memoryEvents = events.map((raw) => ({
      id: `evt-${uuid().slice(0, 8)}`,
      ...raw,
      sourceId: source.id,
      sourceType: type,
      createdAt: new Date().toISOString(),
    }));

    await mem.addMemoryEvents(memoryEvents);

    for (const event of memoryEvents) {
      await vec.indexEvent(event, event.title + ' ' + event.summary + ' ' + event.content);
      for (const t of event.tags) await mem.incrementTag(t);
    }

    return Response.json({
      sourceId: source.id,
      eventsCreated: memoryEvents.length,
      message: `Source "${name}" added with ${memoryEvents.length} events.`,
    });
  } catch (error) {
    console.error('Source creation error:', error);
    return Response.json({ error: 'Failed to create source' }, { status: 500 });
  }
}
