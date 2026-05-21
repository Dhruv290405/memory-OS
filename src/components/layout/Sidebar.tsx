'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/ask', label: 'Ask MemoryOS', icon: '◆' },
  { href: '/graph', label: 'Knowledge Graph', icon: '◉' },
  { href: '/timeline', label: 'Timeline', icon: '⊡' },
  { href: '/insights', label: 'Insights', icon: '⊞' },
  { href: '/sources', label: 'Sources', icon: '⊟' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-white/[0.06] bg-[#080812] z-40 flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
          <div>
            <span className="text-white font-semibold text-sm">MemoryOS</span>
            <span className="block text-[10px] text-white/30 font-mono">v0.1.0</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
            AT
          </div>
          <div>
            <span className="text-xs text-white/70 block">Demo Workspace</span>
            <span className="text-[10px] text-white/30">Local Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
