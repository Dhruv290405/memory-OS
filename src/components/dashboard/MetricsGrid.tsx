'use client';
import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
}

interface MetricsGridProps {
  metrics: Metric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-white/40 text-xs font-medium">{metric.label}</span>
            <span className="text-base">{metric.icon}</span>
          </div>
          <div className="text-2xl font-bold text-white">{metric.value}</div>
          {metric.change && (
            <span className="text-[11px] text-emerald-400 mt-1 block">{metric.change}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
