import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mem = await getMemoryRepository();
    mem.setWorkspaceContext(searchParams.get('workspaceId') || undefined);
    const entities = await mem.getAllEntities();
    const relations = await mem.getAllRelations();

    const nodes = entities.map((e: any) => ({
      id: e.id,
      label: e.name,
      type: e.type,
      importance: relations.filter((r: any) => r.sourceId === e.id || r.targetId === e.id).length,
    }));

    const edges = relations.map((r: any) => ({
      id: r.id,
      source: r.sourceId,
      target: r.targetId,
      label: r.type,
      weight: r.weight,
    }));

    return Response.json({ nodes, edges });
  } catch (error) {
    console.error('Graph error:', error);
    return Response.json({ error: 'Failed to fetch graph data' }, { status: 500 });
  }
}
