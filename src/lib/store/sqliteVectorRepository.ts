import { MemoryEvent } from '@/types';
import { IVectorRepository } from './interfaces';
import { getDatabase } from './sharedDb';

export class SqliteVectorRepository implements IVectorRepository {
  private dbPath: string | undefined;
  private dimension = 384;

  constructor(dbPath?: string) {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    getDatabase(this.dbPath).exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY, eventId TEXT NOT NULL, vector TEXT NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_embeddings_eventId ON embeddings(eventId);
    `);
  }

  async embed(text: string): Promise<number[]> {
    try {
      const res = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.embedding) return data.embedding;
      }
    } catch {}
    return this.simulateEmbedding(text);
  }

  private simulateEmbedding(text: string): number[] {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    const rng = (() => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    })();
    const vec: number[] = [];
    for (let i = 0; i < this.dimension; i++) vec.push(rng() * 2 - 1);
    const mag = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
    return vec.map((v) => v / mag);
  }

  async indexEvent(event: MemoryEvent, content: string): Promise<void> {
    const vector = await this.embed(content);
    const existing = getDatabase(this.dbPath).prepare('SELECT id FROM embeddings WHERE eventId=?').get(event.id);
    if (existing) return;
    getDatabase(this.dbPath).prepare('INSERT INTO embeddings (id,eventId,vector,createdAt) VALUES(?,?,?,?)').run(`emb-${event.id}`, event.id, JSON.stringify(vector), new Date().toISOString());
  }

  async search(query: string, topK = 10): Promise<Array<{ eventId: string; score: number }>> {
    const queryVec = await this.embed(query);
    const rows = getDatabase(this.dbPath).prepare('SELECT eventId, vector FROM embeddings').all() as any[];
    return rows.map((r) => ({ eventId: r.eventId, score: this.cosineSimilarity(queryVec, JSON.parse(r.vector)) })).sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i]; }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  async clear(): Promise<void> {
    getDatabase(this.dbPath).exec('DELETE FROM embeddings');
  }
}
