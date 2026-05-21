'use client';
import { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TimelineReplay } from '@/components/timeline/TimelineReplay';
import { TimelineItem } from '@/types';
import { getEventTypeColor } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { getWorkspaceId } from '@/lib/workspace/WorkspaceContext';

type EventType = TimelineItem['type'];

const TYPES: EventType[] = ['decision', 'discussion', 'meeting', 'commit', 'issue', 'risk', 'outcome', 'architecture'];

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspaceId();
    const base = filter !== 'all' ? `/api/timeline?type=${filter}` : '/api/timeline';
    const url = ws ? `${base}${base.includes('?') ? '&' : '?'}workspaceId=${ws}` : base;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, [filter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Timeline</h1>
            <p className="text-sm text-white/40 mt-1">Chronological replay of organizational events</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[11px] rounded-full transition-all ${
                filter === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}
            >
              All
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2.5 py-1 text-[11px] rounded-full transition-all ${
                  filter === t
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60'
                }`}
                style={filter === t ? { background: `${getEventTypeColor(t as any)}20`, color: getEventTypeColor(t as any) } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <TimelineReplay items={items} />
        )}
      </div>
    </AppShell>
  );
}
