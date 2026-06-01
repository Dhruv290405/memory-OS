import { NextRequest } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getMemoryRepository } from '@/lib/store';
import { createSession } from '@/lib/auth/sessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return Response.json({ error: 'username and password are required' }, { status: 400 });
    }
    const mem = await getMemoryRepository();
    const user = await mem.validatePassword(username, password);
    if (!user) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const token = uuid();
    createSession(token, user.id, user.username);
    return Response.json({ user: { id: user.id, username: user.username, displayName: user.displayName }, token });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
