'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/search/SearchBar';
import { MemoryEvent, TimelineItem } from '@/types';
import { SpendChart } from '@/components/dashboard/SpendChart';
import { getWorkspaceId } from '@/lib/workspace/WorkspaceContext';

export default function Dashboard() {
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspaceId();
    const p = (url: string) => ws ? `${url}${url.includes('?') ? '&' : '?'}workspaceId=${ws}` : url;
    Promise.all([
      fetch(p('/api/memory-events?limit=8')).then((r) => r.json()),
      fetch(p('/api/insights')).then((r) => r.json()),
    ]).then(([eventsData, insightsData]) => {
      setEvents(eventsData.events || []);
      setMetrics(insightsData);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (q: string) => {
    window.location.href = `/ask?q=${encodeURIComponent(q)}`;
  };

  const timeline = metrics?.eventTimeline || [];
  const thisMonth = timeline.length > 0 ? timeline[timeline.length - 1].count : 0;
  const prevMonth = timeline.length > 1 ? timeline[timeline.length - 2].count : 0;
  const eventChange = thisMonth - prevMonth;
  const changeStr = eventChange >= 0 ? `+${eventChange} this month` : `${eventChange} this month`;

  const insightMetrics = metrics
    ? [
        { label: 'Memory Events', value: metrics.metrics.totalEvents, change: changeStr, icon: '◈', href: '/timeline' },
        { label: 'Entities Tracked', value: metrics.metrics.totalEntities, change: `${metrics.metrics.uniqueAuthors} unique authors`, icon: '◉', href: '/graph' },
        { label: 'Relationships', value: metrics.metrics.totalRelations, change: `avg importance ${metrics.metrics.avgImportance}`, icon: '⊡', href: '/graph' },
        { label: 'Data Sources', value: metrics.metrics.totalSources, icon: '⊟', href: '/sources' },
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Memory Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Your organizational memory overview</p>
        </div>

        <SearchBar onSearch={handleSearch} placeholder="Search memory events..." />

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 h-24 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 h-64 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <MetricsGrid metrics={insightMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Recent Memory Events</h2>
                <div className="space-y-2">
                  {events.map((event, i) => (
                    <InsightCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Top Topics</h2>
                  <div className="flex flex-wrap gap-2">
                    {metrics?.topTopics?.map((topic: any) => (
                      <div key={topic.name} onClick={() => window.location.href = `/ask?q=${encodeURIComponent(topic.name)}`}>
                        <Badge label={`${topic.name} (${topic.count})`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">High Priority</h2>
                  <div className="space-y-2">
                    {metrics?.highPriorityEvents?.slice(0, 4).map((evt: any) => (
                      <div key={evt.id} onClick={() => window.location.href = `/ask?q=${encodeURIComponent(evt.title)}`} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="event" type={evt.type} label={evt.type} small />
                          <span className="text-[10px] text-white/30">P{evt.importance}</span>
                        </div>
                        <p className="text-xs text-white/70 truncate">{evt.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Type Distribution</h2>
                  <div className="space-y-2">
                    {metrics?.typeDistribution?.slice(0, 5).map((t: any) => (
                      <div key={t.type} onClick={() => window.location.href = `/ask?q=${encodeURIComponent(t.type)}`} className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.03] px-2 py-0.5 rounded-lg transition-colors">
                        <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                        <span className="text-xs text-white/50 flex-1">{t.type}</span>
                        <span className="text-xs text-white/30">{t.count}</span>
                        <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(t.count / Math.max(...metrics.typeDistribution.map((x: any) => x.count))) * 100}%`,
                              background: t.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Connected Entities</h2>
                  <div className="space-y-2">
                    {metrics?.mostConnectedEntities?.map((e: any) => (
                      <div key={e.name} onClick={() => window.location.href = `/ask?q=${encodeURIComponent(e.name)}`} className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-white/[0.03] px-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
                          <span className="text-xs text-white/60">{e.name}</span>
                        </div>
                        <span className="text-[10px] text-white/30">{e.connectionCount} edges</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {metrics?.eventTimeline && metrics.eventTimeline.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Event Timeline</h2>
                <SpendChart data={metrics.eventTimeline} />
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
