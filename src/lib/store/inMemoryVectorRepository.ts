import { MemoryEvent } from '@/types';
import { IVectorRepository } from './interfaces';

interface VectorEntry {
  id: string;
  vector: number[];
  metadata: { eventId: string };
}

export class InMemoryVectorRepository implements IVectorRepository {
  private entries: VectorEntry[] = [];
  private dimension = 384;

  async initialize(): Promise<void> {}

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  async embed(text: string): Promise<number[]> {
    try {
      const res = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text,
        }),
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
    for (let i = 0; i < this.dimension; i++) {
      vec.push(rng() * 2 - 1);
    }
    const mag = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
    return vec.map((v) => v / mag);
  }

  async indexEvent(event: MemoryEvent, content: string): Promise<void> {
    const vector = await this.embed(content);
    this.entries.push({
      id: `vec-${event.id}`,
      vector,
      metadata: { eventId: event.id },
    });
  }

  async search(query: string, topK = 10): Promise<Array<{ eventId: string; score: number }>> {
    const queryVec = await this.embed(query);
    const scored = this.entries.map((entry) => ({
      eventId: entry.metadata.eventId,
      score: this.cosineSimilarity(queryVec, entry.vector),
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  clear(): void {
    this.entries = [];
  }
}
