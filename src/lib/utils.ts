import { MemoryEvent } from '@/types';

export function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    decision: '#8b5cf6',
    discussion: '#3b82f6',
    meeting: '#06b6d4',
    commit: '#10b981',
    note: '#f59e0b',
    transcript: '#ec4899',
    issue: '#ef4444',
    risk: '#f97316',
    outcome: '#14b8a6',
    architecture: '#6366f1',
    requirement: '#84cc16',
  };
  return colors[type] || '#6b7280';
}

export function getEntityTypeColor(type: string): string {
  const colors: Record<string, string> = {
    person: '#8b5cf6',
    project: '#3b82f6',
    technology: '#10b981',
    decision: '#f59e0b',
    issue: '#ef4444',
    outcome: '#14b8a6',
    team: '#ec4899',
    system: '#6366f1',
    feature: '#06b6d4',
  };
  return colors[type] || '#6b7280';
}

export function getRelationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    influences: '#8b5cf6',
    depends_on: '#ef4444',
    leads_to: '#10b981',
    mentions: '#3b82f6',
    participates_in: '#ec4899',
    implements: '#f59e0b',
    contradicts: '#f97316',
    resolves: '#14b8a6',
  };
  return colors[type] || '#6b7280';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
