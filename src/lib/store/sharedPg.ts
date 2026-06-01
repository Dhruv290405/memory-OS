import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/memoryos';
  pool = new Pool({ connectionString, max: 10 });
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) { await pool.end(); pool = null; }
}
