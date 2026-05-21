const OLLAMA_BASE = 'http://localhost:11434';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaClient {
  private model: string;
  private available = false;

  constructor(model = 'llama3.2:1b') {
    this.model = model;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        this.available = data.models?.some((m: { name: string }) =>
          m.name.startsWith(this.model)
        ) ?? false;
        return this.available;
      }
    } catch {
      this.available = false;
    }
    return false;
  }

  isAvailable(): boolean {
    return this.available;
  }

  async generate(prompt: string, system?: string): Promise<string> {
    if (!this.available) {
      return this.fallbackResponse(prompt);
    }

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: system || 'You are a helpful AI assistant for organizational memory.',
          stream: false,
          options: { temperature: 0.3, top_p: 0.9 },
        }),
      });

      if (res.ok) {
        const data: OllamaResponse = await res.json();
        return data.response;
      }
    } catch {
      this.available = false;
    }
    return this.fallbackResponse(prompt);
  }

  private fallbackResponse(prompt: string): string {
    return this.generateMockAnswer(prompt);
  }

  private generateMockAnswer(prompt: string): string {
    const events = this.parseMemoryEvents(prompt);

    if (events.length === 0) {
      return 'I found no relevant memory events matching your query. Try rephrasing your question or broadening the search terms.';
    }

    const answer = this.buildAnswerFromEvents(events, prompt);
    return `Based on the retrieved memory events, here is what I found:\n\n${answer}`;
  }

  private parseMemoryEvents(prompt: string): Array<{
    index: number;
    title: string;
    type: string;
    author: string;
    date: string;
    summary: string;
    content: string;
    tags: string[];
    entities: string[];
    importance: number;
  }> {
    const blockPattern = /\[(\d+)\]\s*Title:\s*([^\n]*)\s*Type:\s*([^\n]*)\s*Author:\s*([^\n]*)\s*Date:\s*([^\n]*)\s*Summary:\s*([^\n]*?)(?=\s*Content:|$)/g;
    const contentPattern = /Content:\s*([^\n]*?)(?=\s*Tags:|$)/;
    const tagPattern = /Tags:\s*([^\n]*)/;
    const entityPattern = /Entities:\s*([^\n]*)/;
    const importancePattern = /Importance:\s*(\d+)/;

    const events: Array<{
      index: number; title: string; type: string; author: string; date: string;
      summary: string; content: string; tags: string[]; entities: string[]; importance: number;
    }> = [];

    let match: RegExpExecArray | null;
    while ((match = blockPattern.exec(prompt)) !== null) {
      const block = match[0];
      const contentMatch = block.match(contentPattern);
      const tagMatch = block.match(tagPattern);
      const entityMatch = block.match(entityPattern);
      const importanceMatch = block.match(importancePattern);

      events.push({
        index: parseInt(match[1]),
        title: match[2].trim(),
        type: match[3].trim(),
        author: match[4].trim(),
        date: match[5].trim(),
        summary: match[6].trim(),
        content: contentMatch ? contentMatch[1].trim() : '',
        tags: tagMatch ? tagMatch[1].split(',').map((t) => t.trim()) : [],
        entities: entityMatch ? entityMatch[1].split(',').map((e) => e.trim()) : [],
        importance: importanceMatch ? parseInt(importanceMatch[1]) : 0,
      });
    }

    return events;
  }

  private buildAnswerFromEvents(
    events: Array<{ index: number; title: string; summary: string; content: string; importance: number; type: string; author: string; tags: string[]; entities: string[]; date: string }>,
    prompt: string
  ): string {
    const questionMatch = prompt.match(/USER QUESTION:\s*(.+?)(?:\n|$)/);
    const question = questionMatch ? questionMatch[1].trim() : '';
    const qLower = question.toLowerCase();

    const qWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scored = events.map((e) => {
      let score = e.importance;
      const text = (e.title + ' ' + e.summary + ' ' + e.content + ' ' + e.tags.join(' ') + ' ' + e.entities.join(' ')).toLowerCase();
      for (const w of qWords) {
        const count = (text.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        score += count;
      }
      return { ...e, score };
    });
    scored.sort((a, b) => b.score - a.score);

    const top = scored[0];
    const others = scored.slice(1, 4);

    const lines: string[] = [];

    const isWhat = /^(what|how)\b/i.test(question);
    const isWhy = /^why\b/i.test(question);
    const isWho = /^who\b/i.test(question);
    const isWhen = /^when\b/i.test(question);

    if (top) {
      if (isWho) {
        lines.push(`${top.author} is associated with "${top.title}".`);
        const involved = [...new Set(scored.filter((e) => e.author).map((e) => e.author))];
        if (involved.length > 1) lines.push(`Others involved: ${involved.filter((a) => a !== top.author).join(', ')}`);
      } else {
        lines.push(top.summary);
      }
      lines.push(`(Source [${top.index}]: ${top.title})`);
    }

    if (others.length > 0) {
      lines.push('');
      lines.push(`Related:`);
      for (const e of others) {
        lines.push(`  [${e.index}] ${e.title}`);
      }
    }

    const allEntities = [...new Set(scored.flatMap((e) => e.entities))];
    if (allEntities.length > 0) {
      lines.push('');
      lines.push(`Key entities: ${allEntities.join(', ')}`);
    }

    return lines.join('\n');
  }
}

export const ollamaClient = new OllamaClient();
