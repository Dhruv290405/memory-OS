import { NextRequest } from 'next/server';
import { getMemoryRepository } from '@/lib/store';
import { getEventTypeColor } from '@/lib/utils';

export async function GET() {
  try {
    const mem = await getMemoryRepository();
    const events = await mem.getAllMemoryEvents();
    const entities = await mem.getAllEntities();
    const tags = await mem.getAllTags();
    const relations = await mem.getAllRelations();
    const sources = await mem.getAllSources();

    const typeCounts: Record<string, number> = {};
    for (const e of events) {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    }

    const typeDistribution = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count, color: getEventTypeColor(type) }))
      .sort((a, b) => b.count - a.count);

    const topTopics = tags.slice(0, 8);

    const mostConnectedEntities = entities
      .map((e: any) => ({
        name: e.name,
        type: e.type,
        connectionCount: relations.filter(
          (r: any) => r.sourceId === e.id || r.targetId === e.id
        ).length,
      }))
      .sort((a: any, b: any) => b.connectionCount - a.connectionCount)
      .slice(0, 6);

    const unresolvedIssues = events
      .filter((e) => e.type === 'issue' || e.type === 'risk')
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        importance: e.importance,
        date: e.timestamp,
      }));

    const highPriorityEvents = events
      .filter((e) => e.importance >= 8)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        importance: e.importance,
        date: e.timestamp,
      }));

    const months: Record<string, number> = {};
    for (const e of events) {
      const month = e.timestamp.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    }
    const eventTimeline = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const avgImportance = events.length > 0
      ? (events.reduce((s, e) => s + e.importance, 0) / events.length).toFixed(1)
      : '0';

    const uniqueAuthors = new Set(events.map((e) => e.author)).size;

    return Response.json({
      metrics: {
        totalEvents: events.length,
        totalEntities: entities.length,
        totalRelations: relations.length,
        totalSources: sources.length,
        uniqueAuthors,
        avgImportance: parseFloat(avgImportance),
      },
      typeDistribution,
      topTopics,
      mostConnectedEntities,
      unresolvedIssues,
      highPriorityEvents,
      eventTimeline,
    });
  } catch (error) {
    console.error('Insights error:', error);
    return Response.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
