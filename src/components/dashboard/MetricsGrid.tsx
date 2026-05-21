'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  href?: string;
}

interface MetricsGridProps {
  metrics: Metric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => {
        const content = (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm ${metric.href ? 'cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-0.5 transition-all' : ''}`}
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
        );

        return metric.href ? (
          <Link key={metric.label} href={metric.href}>{content}</Link>
        ) : (
          <div key={metric.label}>{content}</div>
        );
      })}
    </div>
  );
}
