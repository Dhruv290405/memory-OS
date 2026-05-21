import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const source = searchParams.get('source');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const mem = await getMemoryRepository();
    mem.setWorkspaceContext(searchParams.get('workspaceId') || undefined);
    let events = await mem.getAllMemoryEvents();

    if (type) events = events.filter((e) => e.type === type);
    if (source) events = events.filter((e) => e.sourceId === source);
    if (tag) events = events.filter((e) => e.tags.includes(tag));
    events = events.slice(0, limit);

    return Response.json({ events, total: events.length });
  } catch (error) {
    console.error('Memory events error:', error);
    return Response.json({ error: 'Failed to fetch memory events' }, { status: 500 });
  }
}
