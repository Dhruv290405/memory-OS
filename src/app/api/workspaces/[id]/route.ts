import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json({ error: 'Workspace name is required' }, { status: 400 });
    }
    const mem = await getMemoryRepository();
    await mem.updateWorkspace(id, name.trim());
    return Response.json({ success: true });
  } catch (error) {
    console.error('Rename workspace error:', error);
    return Response.json({ error: 'Failed to rename workspace' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mem = await getMemoryRepository();
    await mem.deleteWorkspace(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete workspace error:', error);
    return Response.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}
