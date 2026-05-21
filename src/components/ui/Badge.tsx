'use client';
import { getEventTypeColor } from '@/lib/utils';
import { MemoryEvent } from '@/types';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'event' | 'entity' | 'outline';
  type?: MemoryEvent['type'];
  color?: string;
  small?: boolean;
}

export function Badge({ label, variant = 'default', type, color, small = false }: BadgeProps) {
  const bgColor = color || (type ? getEventTypeColor(type) : '#6366f1');

  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' },
    event: { background: `${bgColor}20`, color: bgColor, border: `1px solid ${bgColor}30` },
    entity: { background: `${bgColor}15`, color: bgColor, border: `1px solid ${bgColor}25` },
    outline: { background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' },
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'}`}
      style={styles[variant]}
    >
      {label}
    </span>
  );
}
