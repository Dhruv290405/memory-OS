const OLLAMA_BASE = 'http://localhost:11434';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface MockAnswerResult {
  answer: string;
  confidence: number;
  followUps: string[];
}

interface MemoryEvent {
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
}

interface ScoredEvent extends MemoryEvent {
  score: number;
  scoreBreakdown: {
    wordOverlap: number;
    entityOverlap: number;
    typeMatch: number;
    recency: number;
    tagOverlap: number;
  };
}

type QuestionType = 'what' | 'why' | 'who' | 'when' | 'where' | 'how' | 'how-many' | 'list' | 'compare' | 'summarize' | 'status' | 'unknown';

interface QuestionInfo {
  type: QuestionType;
  entities: string[];
  keywords: string[];
  original: string;
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
    const result = this.generateMockStructured(prompt);
    return result.answer;
  }

  generateMockStructured(prompt: string): MockAnswerResult {
    const events = this.parseMemoryEvents(prompt);
    if (events.length === 0) {
      return {
        answer: 'I found no relevant memory events matching your query. Try rephrasing your question or broadening the search terms.',
        confidence: 0,
        followUps: ['What topics are available in memory?', 'How do I create a new memory event?', 'Can you show me recent updates?'],
      };
    }
    const questionInfo = this.classifyQuestion(prompt);
    const scored = this.scoreEvents(events, questionInfo);
    const topEvents = this.selectTopEvents(scored);
    const answer = this.buildAnswerByType(questionInfo.type, topEvents, questionInfo);
    const confidence = this.calculateConfidence(topEvents, scored, questionInfo);
    const followUps = this.generateFollowUps(topEvents, questionInfo, scored);
    return {
      answer: `Based on the retrieved memory events, here is what I found:\n\n${answer}`,
      confidence,
      followUps,
    };
  }

  private classifyQuestion(prompt: string): QuestionInfo {
    const questionMatch = prompt.match(/USER QUESTION:\s*(.+?)(?:\n|$)/);
    const question = questionMatch ? questionMatch[1].trim() : '';
    const qLower = question.toLowerCase().trim();
    let type: QuestionType = 'unknown';
    if (/^what\b/.test(qLower)) type = 'what';
    else if (/^why\b/.test(qLower)) type = 'why';
    else if (/^who\b/.test(qLower)) type = 'who';
    else if (/^when\b/.test(qLower)) type = 'when';
    else if (/^where\b/.test(qLower)) type = 'where';
    else if (/^how many\b/.test(qLower) || /^how much\b/.test(qLower)) type = 'how-many';
    else if (/^how\b/.test(qLower)) type = 'how';
    else if (/^list\b/.test(qLower)) type = 'list';
    else if (/^compare\b/.test(qLower)) type = 'compare';
    else if (/^summarize\b/.test(qLower) || /^summarise\b/.test(qLower)) type = 'summarize';
    else if (/^status\b/.test(qLower) || /what.*status/.test(qLower) || /^current/.test(qLower)) type = 'status';
    const entities = this.extractEntitiesFromText(question);
    const stopWords = new Set(['the','is','at','which','on','in','for','and','or','was','are','were','has','have','had','been','does','did','can','could','will','would','shall','should','may','might','about','with','from','what','why','who','when','where','how','list','compare','summarize','status','all','any','some','please','me','that','this','these','those','a','an','to','of','it','be','not']);
    const keywords = qLower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    return { type, entities, keywords, original: question };
  }

  private extractEntitiesFromText(text: string): string[] {
    const entities: string[] = [];
    const capWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capWords) entities.push(...capWords.map(e => e.trim()));
    const acronyms = text.match(/\b[A-Z]{2,}\b/g);
    if (acronyms) entities.push(...acronyms);
    return [...new Set(entities)];
  }

  private scoreEvents(events: MemoryEvent[], qi: QuestionInfo): ScoredEvent[] {
    const { keywords, entities: qEntities, type: qType } = qi;
    return events.map(e => {
      const text = (e.title + ' ' + e.summary + ' ' + e.content + ' ' + e.tags.join(' ') + ' ' + e.entities.join(' ')).toLowerCase();
      let wordMatches = 0;
      for (const w of keywords) {
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const count = (text.match(new RegExp(escaped, 'g')) || []).length;
        wordMatches += count;
      }
      const wordOverlap = keywords.length > 0 ? Math.min(1, wordMatches / (keywords.length * 2)) : 0;
      const entityOverlap = qEntities.length > 0
        ? qEntities.filter(eq => e.entities.some(ee => eq.toLowerCase() === ee.toLowerCase())).length / qEntities.length
        : 0;
      const typeMatch = this.doesTypeMatch(qType, e.type) ? 1 : 0;
      const recency = this.calculateRecency(e.date);
      const tagOverlap = e.tags.length > 0 && keywords.length > 0
        ? keywords.filter(w => e.tags.some(t => t.toLowerCase().includes(w))).length / Math.max(keywords.length, 1)
        : 0;
      const score = 0.25 * wordOverlap + 0.25 * entityOverlap + 0.15 * typeMatch + 0.15 * recency + 0.20 * tagOverlap;
      return { ...e, score, scoreBreakdown: { wordOverlap, entityOverlap, typeMatch, recency, tagOverlap } };
    });
  }

  private doesTypeMatch(qType: QuestionType, eventType: string): boolean {
    const et = eventType.toLowerCase();
    switch (qType) {
      case 'why': return ['decision','discussion','retro','postmortem','review'].some(t => et.includes(t));
      case 'who': return ['meeting','discussion','decision','standup'].some(t => et.includes(t));
      case 'how': return ['process','how-to','tutorial','guide','decision','implementation'].some(t => et.includes(t));
      case 'how-many': return ['metric','report','analytics','count','stat'].some(t => et.includes(t));
      case 'status': return ['update','report','progress','standup','status'].some(t => et.includes(t));
      default: return true;
    }
  }

  private calculateRecency(dateStr: string): number {
    if (!dateStr) return 0;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return 0;
    const now = Date.now();
    const diffDays = (now - parsed.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 0;
    if (diffDays <= 7) return 1;
    if (diffDays <= 30) return 0.8;
    if (diffDays <= 90) return 0.5;
    if (diffDays <= 365) return 0.3;
    return 0.1;
  }

  private selectTopEvents(scored: ScoredEvent[]): ScoredEvent[] {
    const sorted = [...scored].sort((a, b) => b.score - a.score);
    if (sorted.length === 0) return [];
    const topScore = sorted[0].score;
    if (topScore <= 0) return [sorted[0]];
    const threshold = Math.max(topScore * 0.8, 0.01);
    return sorted.filter(e => e.score >= threshold).slice(0, 5);
  }

  private buildAnswerByType(type: QuestionType, topEvents: ScoredEvent[], qi: QuestionInfo): string {
    if (topEvents.length === 0) return 'No relevant events found.';
    const lines: string[] = [];
    const single = topEvents.length === 1;
    switch (type) {
      case 'why': {
        if (single) {
          const e = topEvents[0];
          lines.push(`Reason: ${e.summary}`);
          lines.push(`Context: ${e.content || 'No additional context available.'}`);
          if (e.author) lines.push(`This was documented by ${e.author}.`);
        } else {
          lines.push('Based on multiple events, here are the reasons found:');
          for (const e of topEvents) {
            lines.push(`  \u2022 ${e.summary} ${e.author ? `(${e.author})` : ''}`);
            lines.push(`    (Source [${e.index}])`);
          }
        }
        break;
      }
      case 'who': {
        const people = [...new Set(topEvents.map(e => e.author).filter(Boolean))];
        if (people.length > 0) lines.push(`People involved: ${people.join(', ')}`);
        for (const e of topEvents) {
          lines.push(`  \u2022 ${e.author || 'Unknown'} \u2014 ${e.title}`);
          lines.push(`    ${e.summary}`);
          lines.push(`    (Source [${e.index}])`);
        }
        break;
      }
      case 'when': {
        const dated = topEvents.filter(e => e.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (dated.length > 0) {
          lines.push('Timeline:');
          for (const e of dated) {
            lines.push(`  \u2022 ${e.date} \u2014 ${e.title}: ${e.summary}`);
            lines.push(`    (Source [${e.index}])`);
          }
        } else {
          lines.push(topEvents[0].summary);
        }
        break;
      }
      case 'where': {
        for (const e of topEvents) {
          lines.push(`  \u2022 ${e.title}`);
          lines.push(`    ${e.summary}`);
          lines.push(`    (Source [${e.index}])`);
        }
        break;
      }
      case 'how': {
        if (single) {
          const e = topEvents[0];
          lines.push(e.summary);
          if (e.content) {
            lines.push('Steps:');
            const steps = e.content.split(/\.\s+/).filter(s => s.trim());
            for (let i = 0; i < Math.min(steps.length, 8); i++) {
              lines.push(`  ${i + 1}. ${steps[i].replace(/^\d+[\.\)]\s*/, '')}${steps[i].endsWith('.') ? '' : '.'}`);
            }
          }
          lines.push(`(Source [${e.index}])`);
        } else {
          lines.push('Multiple processes were found:');
          for (const e of topEvents) {
            lines.push(`  \u2022 ${e.title}: ${e.summary}`);
            lines.push(`    (Source [${e.index}])`);
          }
        }
        break;
      }
      case 'how-many': {
        const count = topEvents.reduce((sum, e) => {
          const nums = e.content.match(/\d+/g);
          return sum + (nums ? nums.length : 0);
        }, 0);
        lines.push(`Found ${topEvents.length} relevant event(s).`);
        if (count > 0) lines.push(`Mentions ${count} numeric values across the results.`);
        for (const e of topEvents) {
          lines.push(`  \u2022 ${e.title}: ${e.summary}`);
          lines.push(`    (Source [${e.index}])`);
        }
        break;
      }
      case 'list': {
        lines.push('Here are the relevant events:');
        for (const e of topEvents) {
          lines.push(`  \u2022 ${e.title}${e.author ? ` (by ${e.author})` : ''}`);
          lines.push(`    ${e.summary}`);
          lines.push(`    (Source [${e.index}])`);
        }
        break;
      }
      case 'compare': {
        if (topEvents.length >= 2) {
          const e1 = topEvents[0], e2 = topEvents[1];
          lines.push('Comparison:');
          lines.push(`  ${e1.title} vs ${e2.title}`);
          lines.push(`  Summary: ${e1.summary} | ${e2.summary}`);
          lines.push(`  Date: ${e1.date || 'N/A'} | ${e2.date || 'N/A'}`);
          lines.push(`  Author: ${e1.author || 'Unknown'} | ${e2.author || 'Unknown'}`);
          lines.push(`  Tags: ${e1.tags.join(', ') || 'None'} | ${e2.tags.join(', ') || 'None'}`);
        } else if (topEvents.length === 1) {
          lines.push(`Only one event found matching your query: ${topEvents[0].title}`);
          lines.push(topEvents[0].summary);
        } else {
          lines.push('Not enough events found to make a comparison.');
        }
        break;
      }
      case 'summarize': {
        lines.push(`Overview based on ${topEvents.length} event(s):`);
        for (const e of topEvents) {
          lines.push(`  \u2022 ${e.title}`);
          lines.push(`    ${e.summary}`);
          lines.push(`    (Source [${e.index}])`);
        }
        if (topEvents.length > 1) {
          const allTags = [...new Set(topEvents.flatMap(e => e.tags))];
          if (allTags.length > 0) lines.push(`Common tags: ${allTags.join(', ')}`);
        }
        break;
      }
      case 'status': {
        const latest = [...topEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        lines.push(`Current Status: ${latest.title}`);
        lines.push(latest.summary);
        if (topEvents.length > 1) {
          lines.push('Recent history:');
          for (const e of topEvents.slice(0, 3)) {
            lines.push(`  \u2022 ${e.date || 'Unknown'} \u2014 ${e.title}`);
          }
        }
        break;
      }
      default: {
        if (single) {
          const e = topEvents[0];
          lines.push(e.summary);
          if (e.content) lines.push(e.content.slice(0, 300));
          lines.push(`(Source [${e.index}]: ${e.title})`);
        } else {
          lines.push(`I found ${topEvents.length} relevant event(s):`);
          for (const e of topEvents) {
            lines.push(`  \u2022 ${e.title}`);
            lines.push(`    ${e.summary}`);
            if (e.author) lines.push(`    Author: ${e.author}`);
            lines.push(`    (Source [${e.index}])`);
          }
        }
      }
    }
    const allEntities = [...new Set(topEvents.flatMap(e => e.entities))];
    if (allEntities.length > 0) {
      lines.push('');
      lines.push(`Key entities: ${allEntities.join(', ')}`);
    }
    return lines.join('\n');
  }

  private calculateConfidence(topEvents: ScoredEvent[], allScored: ScoredEvent[], qi: QuestionInfo): number {
    if (topEvents.length === 0) return 0;
    const topScore = topEvents[0].score;
    let confidence = topScore * 0.7;
    if (topEvents.length > 1) confidence += 0.1;
    if (topEvents[0].scoreBreakdown.typeMatch > 0) confidence += 0.1;
    if (topEvents[0].scoreBreakdown.entityOverlap > 0.5) confidence += 0.1;
    if (topScore < 0.2) confidence *= 0.5;
    return Math.min(1, Math.max(0, confidence));
  }

  private generateFollowUps(topEvents: ScoredEvent[], qi: QuestionInfo, allScored: ScoredEvent[]): string[] {
    const followUps: string[] = [];
    const { entities } = qi;
    const topEntities = [...new Set(topEvents.flatMap(e => e.entities))].slice(0, 3);
    for (const entity of topEntities) {
      if (!entities.some(e => e.toLowerCase() === entity.toLowerCase())) {
        followUps.push(`What else do we know about ${entity}?`);
      }
    }
    const remainingTypes = [...new Set(allScored.filter(e => !topEvents.includes(e)).map(e => e.type))].slice(0, 2);
    for (const t of remainingTypes) {
      followUps.push(`Are there any ${t} events related to this?`);
    }
    const authors = [...new Set(topEvents.map(e => e.author).filter(Boolean))].slice(0, 2);
    for (const author of authors) {
      followUps.push(`What other work has ${author} been involved in?`);
    }
    if (followUps.length < 2) {
      followUps.push('What decisions led to this outcome?');
      followUps.push('How does this relate to ongoing projects?');
    }
    return followUps.slice(0, 3);
  }

  private parseMemoryEvents(prompt: string): MemoryEvent[] {
    const blockPattern = /\[(\d+)\]\s*Title:\s*([^\n]*)\s*Type:\s*([^\n]*)\s*Author:\s*([^\n]*)\s*Date:\s*([^\n]*)\s*Summary:\s*([^\n]*?)(?=\s*Content:|$)/g;
    const contentPattern = /Content:\s*([^\n]*?)(?=\s*Tags:|$)/;
    const tagPattern = /Tags:\s*([^\n]*)/;
    const entityPattern = /Entities:\s*([^\n]*)/;
    const importancePattern = /Importance:\s*(\d+)/;
    const events: MemoryEvent[] = [];
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
}

export const ollamaClient = new OllamaClient();
