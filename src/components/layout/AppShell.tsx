'use client';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { WorkspaceProvider } from '@/lib/workspace/WorkspaceContext';

const LIGHT_CSS = `
body, .min-h-screen { background: #f3f4f6 !important; color: #111827 !important; }
aside, aside * { background: #ffffff !important; border-color: rgba(0,0,0,0.08) !important; }
aside .text-white, aside [class*="text-white"] { color: #374151 !important; }
aside [class*="text-white/"] { color: rgba(55,65,81,0.7) !important; }
main [class*="rounded-"] { background: #ffffff !important; border-color: rgba(0,0,0,0.08) !important; }
main [class*="bg-white"] { background: rgba(0,0,0,0.02) !important; }
main [class*="border-white"] { border-color: rgba(0,0,0,0.08) !important; }
main h1, main h2, main h3, main p, main [class*="text-white/"]:not(a span) { color: #111827 !important; }
main [class*="text-white/"] { color: rgba(0,0,0,0.6) !important; }
main [class*="text-indigo-300"] { color: #4f46e5 !important; }
main [class*="bg-indigo-500/10"] { background: rgba(99,102,241,0.08) !important; }
main input { background: rgba(0,0,0,0.05) !important; color: #111827 !important; border-color: rgba(0,0,0,0.12) !important; }
::selection { background: rgba(99,102,241,0.15) !important; }
`;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    const theme = localStorage.getItem('memoryos_theme') || 'dark';
    const compact = localStorage.getItem('memoryos_compact') === 'true';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-compact', String(compact));

    if (theme === 'light') {
      const style = document.createElement('style');
      style.id = 'light-theme-overrides';
      style.textContent = LIGHT_CSS;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById('light-theme-overrides');
      if (el) el.remove();
    };
  }, []);

  return (
    <WorkspaceProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="pl-56 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </WorkspaceProvider>
  );
}
