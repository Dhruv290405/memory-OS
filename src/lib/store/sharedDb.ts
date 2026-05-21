import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (db) return db;
  const resolvedPath = dbPath || process.env.MEMORYOS_DB_PATH || path.join(os.tmpdir(), 'memoryos', 'memoryos.db');
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(resolvedPath);
  db.pragma('journal_mode = TRUNCATE');
  db.pragma('foreign_keys = ON');
  return db;
}

export function closeDatabase(): void {
  if (db) { db.close(); db = null; }
}
