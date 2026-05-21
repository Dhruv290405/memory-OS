import { NextRequest } from 'next/server';
import { hybridSearch } from '@/lib/search/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || undefined;
    const source = searchParams.get('source') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const results = await hybridSearch({ q, type, source, tag, limit, workspaceId });

    return Response.json({ results, total: results.length, query: q });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
