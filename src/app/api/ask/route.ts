import { NextRequest } from 'next/server';
import { askMemory } from '@/lib/ai/rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationId, workspaceId } = body;

    if (!query || typeof query !== 'string') {
      return Response.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      );
    }

    const result = await askMemory({
      query,
      conversationId,
      topK: 8,
      workspaceId,
    });

    return Response.json(result);
  } catch (error) {
    console.error('Ask error:', error);
    return Response.json({ error: 'Failed to process question' }, { status: 500 });
  }
}
