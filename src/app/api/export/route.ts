import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mem = await getMemoryRepository();
    mem.setWorkspaceContext(searchParams.get('workspaceId') || undefined);

    const [events, entities, relations, sources, tags] = await Promise.all([
      mem.getAllMemoryEvents(),
      mem.getAllEntities(),
      mem.getAllRelations(),
      mem.getAllSources(),
      mem.getAllTags(),
    ]);

    const data = { exportedAt: new Date().toISOString(), events, entities, relations, sources, tags };
    const json = JSON.stringify(data, null, 2);

    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="memoryos-export.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Export failed' }, { status: 500 });
  }
}
