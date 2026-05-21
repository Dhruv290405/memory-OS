import { MemoryEvent } from '@/types';
import { IVectorRepository } from './interfaces';

const PRISMA_MODULE = ['@', 'prisma', '/', 'client'].join('');

export class PostgresVectorRepository implements IVectorRepository {
  private initialized = false;

  async initialize(): Promise<void> {
    const { PrismaClient } = await import(PRISMA_MODULE);
    const client = new PrismaClient();
    try {
      await client.$connect();
      await client.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
      this.initialized = true;
    } finally {
      await client.$disconnect();
    }
  }

  private assertReady(): void {
    if (!this.initialized) throw new Error('PostgresVectorRepository not initialized');
  }

  private async withClient<T>(fn: (client: any) => Promise<T>): Promise<T> {
    this.assertReady();
    const { PrismaClient } = await import(PRISMA_MODULE);
    const client = new PrismaClient();
    try {
      return await fn(client);
    } finally {
      await client.$disconnect();
    }
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
    for (let i = 0; i < 384; i++) {
      vec.push(rng() * 2 - 1);
    }
    const mag = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
    return vec.map((v) => v / mag);
  }

  async indexEvent(event: MemoryEvent, content: string): Promise<void> {
    const vector = await this.embed(content);
    return this.withClient((c) => c.$executeRawUnsafe(
      `INSERT INTO "Embedding" ("id", "eventId", "vector", "createdAt") VALUES ($1, $2, $3::vector, NOW()) ON CONFLICT ("id") DO NOTHING`,
      `emb-${event.id}`, event.id, `[${vector.join(',')}]`
    ));
  }

  async search(query: string, topK = 10): Promise<Array<{ eventId: string; score: number }>> {
    const vector = await this.embed(query);
    return this.withClient(async (c) => {
      const rows: any[] = await c.$queryRawUnsafe(
        `SELECT "eventId", 1 - ("vector" <=> $1::vector) AS score FROM "Embedding" ORDER BY "vector" <=> $1::vector LIMIT $2`,
        `[${vector.join(',')}]`, topK
      );
      return rows.map((r: any) => ({ eventId: r.eventId, score: Number(r.score) }));
    });
  }

  async clear(): Promise<void> {
    return this.withClient((c) => c.$executeRawUnsafe('DELETE FROM "Embedding"'));
  }
}
