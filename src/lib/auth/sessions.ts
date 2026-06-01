import { getDatabase } from '@/lib/store/sharedDb';
import Database from 'better-sqlite3';

function ensureTable(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    username TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
}

export function createSession(token: string, userId: string, username: string): void {
  const db = getDatabase();
  ensureTable(db);
  db.prepare('INSERT OR REPLACE INTO sessions (token, userId, username, createdAt) VALUES (?,?,?,?)').run(token, userId, username, new Date().toISOString());
}

export function getSession(token: string): { userId: string; username: string; createdAt: string } | undefined {
  const db = getDatabase();
  ensureTable(db);
  return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as any;
}

export function deleteSession(token: string): void {
  const db = getDatabase();
  ensureTable(db);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function clearSessions(): void {
  const db = getDatabase();
  ensureTable(db);
  db.exec('DELETE FROM sessions');
}
