import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export async function GET() {
  try {
    const mem = await getMemoryRepository();
    const workspaces = await mem.getWorkspaces();
    return Response.json({ workspaces });
  } catch (error) {
    console.error('Workspaces error:', error);
    return Response.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json({ error: 'Workspace name is required' }, { status: 400 });
    }
    const mem = await getMemoryRepository();
    const now = new Date().toISOString();
    const workspace = { id: uuid(), name: name.trim(), createdAt: now, updatedAt: now };
    await mem.addWorkspace(workspace);
    return Response.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Create workspace error:', error);
    return Response.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
