'use client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { MemoryEvent } from '@/types';

interface InsightCardProps {
  event: MemoryEvent;
  index?: number;
}

export function InsightCard({ event, index = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
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
    </motion.div>
  );
}
