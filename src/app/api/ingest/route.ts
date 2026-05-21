import { NextRequest } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getMemoryRepository, getVectorRepository } from '@/lib/store';
import { parseContent } from '@/lib/ingestion/parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, type, name, author, timestamp, workspaceId } = body;

    if (!content || !type || !name) {
      return Response.json(
        { error: 'Missing required fields: content, type, name' },
        { status: 400 }
      );
    }

    const validTypes = ['markdown', 'json', 'text', 'transcript', 'commit_log', 'chat_export'];
    if (!validTypes.includes(type)) {
      return Response.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const mem = await getMemoryRepository();
    if (workspaceId) mem.setWorkspaceContext(workspaceId);
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
      message: `Successfully ingested "${name}" with ${memoryEvents.length} memory events.`,
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return Response.json({ error: 'Failed to process ingestion' }, { status: 500 });
  }
}
