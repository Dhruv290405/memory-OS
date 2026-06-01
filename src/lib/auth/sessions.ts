const sessions = new Map<string, { userId: string; username: string; createdAt: string }>();

export function createSession(userId: string, username: string, token: string): void {
  sessions.set(token, { userId, username, createdAt: new Date().toISOString() });
}

export function getSession(token: string): { userId: string; username: string; createdAt: string } | undefined {
  return sessions.get(token);
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export function clearSessions(): void {
  sessions.clear();
}
