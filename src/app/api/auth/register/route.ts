import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { getMemoryRepository } from '@/lib/store';
import { createSession } from '@/lib/auth/sessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, displayName } = body;
    if (!username || !password || !displayName) {
      return Response.json({ error: 'username, password, and displayName are required' }, { status: 400 });
    }
    const mem = await getMemoryRepository();
    const existing = await mem.getUserByUsername(username);
    if (existing) {
      return Response.json({ error: 'Username already taken' }, { status: 409 });
    }
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const id = uuid();
    const now = new Date().toISOString();
    const user = { id, username, passwordHash, displayName, createdAt: now };
    await mem.createUser(user);
    const token = uuid();
    createSession(token, user.id, user.username);
    return Response.json({ user: { id: user.id, username: user.username, displayName: user.displayName }, token }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
