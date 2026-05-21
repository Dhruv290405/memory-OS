import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const mem = await getMemoryRepository();
    mem.setWorkspaceContext(searchParams.get('workspaceId') || undefined);
    let events = await mem.getAllMemoryEvents();

    if (type) events = events.filter((e: any) => e.type === type);

    const timelineItems = events.slice(0, limit).map((e: any) => ({
      id: e.id,
      date: e.timestamp,
      title: e.title,
      summary: e.summary,
      type: e.type,
      author: e.author,
      importance: e.importance,
      relatedEntities: e.entities,
    }));

    return Response.json({ items: timelineItems, total: timelineItems.length });
  } catch (error) {
    console.error('Timeline error:', error);
    return Response.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
