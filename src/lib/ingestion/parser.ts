import { v4 as uuid } from 'uuid';
import { SourceType, MemoryEvent, Source } from '@/types';

export interface ParseResult {
  source: Source;
  events: RawEvent[];
}

export interface RawEvent {
  type: MemoryEvent['type'];
  title: string;
  summary: string;
  content: string;
  author: string;
  timestamp: string;
  tags: string[];
  entities: string[];
  importance: number;
}

export function parseContent(
  content: string,
  type: SourceType,
  name: string,
  author = 'Unknown',
  timestamp = new Date().toISOString()
): ParseResult {
  const source: Source = {
    id: `src-${uuid().slice(0, 8)}`,
    name,
    type,
    content,
    author,
    timestamp,
    eventCount: 0,
    createdAt: new Date().toISOString(),
  };

  let events: RawEvent[] = [];

  switch (type) {
    case 'markdown':
      events = parseMarkdown(content, source, author, timestamp);
      break;
    case 'json':
      events = parseJSON(content, source, author, timestamp);
      break;
    case 'text':
    case 'transcript':
    case 'chat_export':
      events = parseText(content, source, author, timestamp, type);
      break;
    case 'commit_log':
      events = parseCommitLog(content, source, author, timestamp);
      break;
    default:
      events = parseText(content, source, author, timestamp, 'text');
  }

  source.eventCount = events.length;
  return { source, events };
}

function parseMarkdown(
  content: string,
  source: Source,
  author: string,
  timestamp: string
): RawEvent[] {
  const events: RawEvent[] = [];
  const sections = content.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const title = lines[0]?.replace(/^#+\s*/, '').trim() || source.name;
    const body = lines.slice(1).join('\n').trim();

    if (title && body) {
      const tags = extractTags(title + ' ' + body);
      const entities = extractEntities(body);
      events.push({
        type: inferType(title, body),
        title,
        summary: body.split('\n')[0]?.replace(/^[-*]\s*/, '').trim() || title,
        content: body,
        author,
        timestamp,
        tags,
        entities,
        importance: computeImportance(title, body),
      });
    }
  }

  if (events.length === 0) {
    events.push(createDefaultEvent(content, source, author, timestamp));
  }

  return events;
}

function parseJSON(
  content: string,
  source: Source,
  author: string,
  timestamp: string
): RawEvent[] {
  try {
    const data = JSON.parse(content);
    const items = Array.isArray(data) ? data : [data];
    return items.map((item: any) => ({
      type: item.type || inferType(item.title || '', item.body || ''),
      title: item.title || item.name || 'Untitled',
      summary: item.summary || item.description || String(item).slice(0, 200),
      content: item.body || item.content || item.text || JSON.stringify(item),
      author: item.author || author,
      timestamp: item.timestamp || timestamp,
      tags: item.tags || [],
      entities: item.entities || [],
      importance: item.importance ?? 5,
    }));
  } catch {
    return [createDefaultEvent(content, source, author, timestamp)];
  }
}

function parseText(
  content: string,
  source: Source,
  author: string,
  timestamp: string,
  type: SourceType
): RawEvent[] {
  const events: RawEvent[] = [];
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean);
    const firstLine = lines[0] || '';
    const body = lines.slice(1).join('\n').trim() || firstLine;

    const tags = extractTags(firstLine + ' ' + body);
    const entities = extractEntities(body);

    events.push({
      type: type === 'transcript' ? 'transcript' :
            type === 'chat_export' ? 'discussion' :
            inferType(firstLine, body),
      title: firstLine.length < 100 ? firstLine : firstLine.slice(0, 97) + '...',
      summary: body.slice(0, 200),
      content: block.trim(),
      author,
      timestamp,
      tags,
      entities,
      importance: computeImportance(firstLine, body),
    });
  }

  if (events.length === 0) {
    events.push(createDefaultEvent(content, source, author, timestamp));
  }

  return events;
}

function parseCommitLog(
  content: string,
  source: Source,
  author: string,
  timestamp: string
): RawEvent[] {
  const events: RawEvent[] = [];
  const lines = content.split('\n').filter(Boolean);

  for (const line of lines) {
    const clean = line.replace(/^[-*]\s*/, '').trim();
    if (!clean) continue;

    const typeMatch = clean.match(/^(feat|fix|refactor|docs|test|chore|style|perf|ci|build)(\(.+?\))?:\s*(.+)/);
    if (typeMatch) {
      const [, , , desc] = typeMatch;
      const tags = extractTags(clean);
      const entities = extractEntities(clean);
      events.push({
        type: 'commit',
        title: desc || clean,
        summary: clean,
        content: clean,
        author,
        timestamp,
        tags,
        entities,
        importance: 5,
      });
    } else {
      events.push({
        type: 'commit',
        title: clean,
        summary: clean,
        content: clean,
        author,
        timestamp,
        tags: ['commit'],
        entities: [],
        importance: 3,
      });
    }
  }

  if (events.length === 0) {
    events.push(createDefaultEvent(content, source, author, timestamp));
  }

  return events;
}

function createDefaultEvent(
  content: string,
  source: Source,
  author: string,
  timestamp: string
): RawEvent {
  return {
    type: 'note',
    title: source.name,
    summary: content.slice(0, 200),
    content,
    author,
    timestamp,
    tags: extractTags(content),
    entities: extractEntities(content),
    importance: 3,
  };
}

function inferType(title: string, body: string): MemoryEvent['type'] {
  const combined = (title + ' ' + body).toLowerCase();
  if (/decision|decided|we will|agreed/.test(combined)) return 'decision';
  if (/incident|outage|downtime|p1|critical/.test(combined)) return 'issue';
  if (/risk|blocking|concern|could delay/.test(combined)) return 'risk';
  if (/discussion|discussed|talked|chat|agreed/.test(combined)) return 'discussion';
  if (/meeting|sync|standup|review|retro/.test(combined)) return 'meeting';
  if (/architecture|architect|design|pattern|service|migrate/.test(combined)) return 'architecture';
  if (/commit|feat|fix|refactor|chore/.test(combined)) return 'commit';
  if (/transcript|recorded|said|spoke/.test(combined)) return 'transcript';
  if (/outcome|result|action|resolved|completed/.test(combined)) return 'outcome';
  return 'note';
}

function extractTags(text: string): string[] {
  const tagKeywords: Record<string, RegExp[]> = {
    architecture: [/microservice/, /monolith/, /service/, /gateway/, /mesh/],
    security: [/security/, /vulnerability/, /jwt/, /token/, /audit/, /encrypt/],
    database: [/database/, /postgres/, /mongo/, /sql/, /query/, /schema/, /persistence/],
    performance: [/perform/, /latency/, /throughput/, /slow/, /bottleneck/, /optimize/],
    decision: [/decision/, /decided/, /agreed/, /approve/],
    incident: [/incident/, /outage/, /down/, /crash/, /fail/],
    grpc: [/grpc/, /rpc/, /protobuf/],
    planning: [/plan/, /roadmap/, /sprint/, /q[1-4]/, /milestone/],
    deployment: [/deploy/, /pipeline/, /ci/, /cd/, /release/],
    team: [/team/, /ownership/, /lead/, /assign/],
  };

  const tags: string[] = [];
  for (const [tag, patterns] of Object.entries(tagKeywords)) {
    if (patterns.some((p) => p.test(text.toLowerCase()))) {
      tags.push(tag);
    }
  }
  return tags.slice(0, 5);
}

function extractEntities(text: string): string[] {
  const namePattern = /[A-Z][a-z]+ [A-Z][a-z]+/g;
  const techPattern = /[A-Z][A-Za-z0-9]+(?: [A-Z][a-z]+)?/g;

  const names = text.match(namePattern) || [];
  const techs = (text.match(techPattern) || []).filter(
    (t) => /^[A-Z]/.test(t) && t.length > 2 && !['The', 'This', 'That', 'What', 'When', 'Where'].includes(t)
  );

  return [...new Set([...names, ...techs])].slice(0, 5);
}

function computeImportance(title: string, body: string): number {
  const combined = (title + ' ' + body).toLowerCase();
  let score = 5;

  if (/critical|p0|severe|major/.test(combined)) score += 3;
  if (/important|high priority|urgent/.test(combined)) score += 2;
  if (/decision|architecture|migration/.test(combined)) score += 2;
  if (/risk|blocking|depends/.test(combined)) score += 2;
  if (/incident|outage|breach/.test(combined)) score += 3;
  if (/minor|low|trivial|cosmetic/.test(combined)) score -= 2;

  return Math.max(1, Math.min(10, score));
}
