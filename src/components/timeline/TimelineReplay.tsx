'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { TimelineItem } from '@/types';
import { getEventTypeColor, formatDate } from '@/lib/utils';

interface TimelineReplayProps {
  items: TimelineItem[];
}

export function TimelineReplay({ items }: TimelineReplayProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">⊡</div>
          <p className="text-sm text-white/40">No timeline events yet.</p>
          <p className="text-xs text-white/20 mt-1">Ingest data to populate the timeline.</p>
        </div>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative">
      <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent" />

      <AnimatePresence>
        {sorted.map((item, i) => {
          const isExpanded = expanded === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="relative pl-16 pb-6 last:pb-0"
            >
              <div
                className="absolute left-[22px] top-1.5 w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: getEventTypeColor(item.type as any),
                  background: isExpanded ? getEventTypeColor(item.type as any) : 'transparent',
                }}
              />

              <div
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                  </div>
                  <Badge variant="event" type={item.type as any} label={item.type} small />
                </div>

                <p className="text-xs text-white/50 line-clamp-2 mb-2">{item.summary}</p>

                <div className="flex items-center gap-3 text-[11px] text-white/30">
                  <span>{formatDate(item.date)}</span>
                  <span>·</span>
                  <span>{item.author}</span>
                  <span>·</span>
                  <span className="text-white/20">Importance: {item.importance}/10</span>
                </div>

                {isExpanded && item.relatedEntities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/[0.06]"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {item.relatedEntities.map((e) => (
                        <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40">
                          {e}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
