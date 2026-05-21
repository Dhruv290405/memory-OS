'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { Badge } from '@/components/ui/Badge';
import { getEventTypeColor } from '@/lib/utils';
import { SpendChart } from '@/components/dashboard/SpendChart';
import { getWorkspaceId } from '@/lib/workspace/WorkspaceContext';

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspaceId();
    fetch(`/api/insights${ws ? `?workspaceId=${ws}` : ''}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 h-24 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
        </div>
      </AppShell>
    );
  }

  const metrics = data ? [
    { label: 'Total Events', value: data.metrics.totalEvents, icon: '◈' },
    { label: 'Entities', value: data.metrics.totalEntities, icon: '◉' },
    { label: 'Relationships', value: data.metrics.totalRelations, icon: '⊡' },
    { label: 'Avg Importance', value: data.metrics.avgImportance, icon: '◆' },
    { label: 'Unique Authors', value: data.metrics.uniqueAuthors, icon: '⊞' },
    { label: 'Data Sources', value: data.metrics.totalSources, icon: '⊟' },
  ] : [];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Insights</h1>
          <p className="text-sm text-white/40 mt-1">Aggregated analytics across your organizational memory</p>
        </div>

        <MetricsGrid metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Event Type Distribution</h3>
            <div className="space-y-3">
              {data?.typeDistribution?.map((t: any) => (
                <div key={t.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      <span className="text-xs text-white/60 capitalize">{t.type}</span>
                    </div>
                    <span className="text-xs text-white/40">{t.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(t.count / Math.max(...data.typeDistribution.map((x: any) => x.count))) * 100}%`,
                        background: t.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Most Connected Entities</h3>
            <div className="space-y-3">
              {data?.mostConnectedEntities?.map((e: any) => (
                <div key={e.name} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400/50" />
                    <span className="text-sm text-white/70">{e.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{e.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">{e.connectionCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Unresolved Issues & Risks</h3>
            {data?.unresolvedIssues?.length > 0 ? (
              <div className="space-y-2">
                {data.unresolvedIssues.map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="event" type={issue.type} label={issue.type} small />
                      <span className="text-xs text-white/60 truncate">{issue.title}</span>
                    </div>
                    <span className="text-[10px] text-white/30 ml-2">P{issue.importance}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30">No unresolved issues or risks.</p>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Top Topics</h3>
            <div className="flex flex-wrap gap-2">
              {data?.topTopics?.map((topic: any) => (
                <Badge key={topic.name} label={`${topic.name} (${topic.count})`} />
              ))}
            </div>
          </div>
        </div>

        {data?.eventTimeline && data.eventTimeline.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Memory Events Over Time</h3>
            <SpendChart data={data.eventTimeline} />
          </div>
        )}

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Knowledge Base Health</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/[0.03]">
              <div className="text-2xl font-bold text-emerald-400">{data?.metrics.totalEvents > 0 ? 'Active' : 'Empty'}</div>
              <div className="text-xs text-white/40 mt-1">Memory Status</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03]">
              <div className="text-2xl font-bold text-indigo-400">{data?.metrics.totalRelations > 0 ? 'Connected' : 'Isolated'}</div>
              <div className="text-xs text-white/40 mt-1">Graph Connectivity</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03]">
              <div className="text-2xl font-bold text-amber-400">{data?.typeDistribution?.length || 0}</div>
              <div className="text-xs text-white/40 mt-1">Event Types</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03]">
              <div className="text-2xl font-bold text-cyan-400">{data?.metrics.uniqueAuthors || 0}</div>
              <div className="text-xs text-white/40 mt-1">Contributors</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
