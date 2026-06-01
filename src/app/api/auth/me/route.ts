import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/sessions';
import { getMemoryRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }
    const token = auth.slice(7);
    const session = getSession(token);
    if (!session) {
      return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    const mem = await getMemoryRepository();
    const user = await mem.getUserByUsername(session.username);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return Response.json({ user: { id: user.id, username: user.username, displayName: user.displayName } });
  } catch (error) {
    console.error('Me error:', error);
    return Response.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
