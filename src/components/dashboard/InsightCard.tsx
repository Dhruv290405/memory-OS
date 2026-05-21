'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { MemoryEvent } from '@/types';

interface InsightCardProps {
  event: MemoryEvent;
  index?: number;
}

export function InsightCard({ event, index = 0 }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
          </div>
          <Badge variant="event" type={event.type} label={event.type} small />
        </div>
        <p className="text-xs text-white/50 line-clamp-2 mb-3 leading-relaxed">{event.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <span>{event.author}</span>
            <span>·</span>
            <span>{formatDate(event.timestamp)}</span>
          </div>
          <div className="flex items-center gap-1">
            {event.entities.slice(0, 2).map((e) => (
              <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40">{e}</span>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06]"
          >
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[11px] text-white/30 mb-1">Full Content</p>
                <p className="text-xs text-white/60 leading-relaxed">{event.content}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06]">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/30">
                <span>Importance: {event.importance}/10</span>
                {event.entities.length > 0 && <span>Entities: {event.entities.join(', ')}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
