'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/ask', label: 'Ask MemoryOS', icon: '◆' },
  { href: '/graph', label: 'Knowledge Graph', icon: '◉' },
  { href: '/timeline', label: 'Timeline', icon: '⊡' },
  { href: '/insights', label: 'Insights', icon: '⊞' },
  { href: '/sources', label: 'Sources', icon: '⊟' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, renameWorkspace, deleteWorkspace } = useWorkspace();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setTheme((localStorage.getItem('memoryos_theme') as 'dark' | 'light') || 'dark');
    setCompact(localStorage.getItem('memoryos_compact') === 'true');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('memoryos_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    const existing = document.getElementById('light-theme-overrides');
    if (next === 'light') {
      if (!existing) {
        const style = document.createElement('style');
        style.id = 'light-theme-overrides';
        style.textContent = `
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
        document.head.appendChild(style);
      }
    } else if (existing) {
      existing.remove();
    }
  };

  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    localStorage.setItem('memoryos_compact', String(next));
    document.documentElement.setAttribute('data-compact', String(next));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createWorkspace(newName.trim());
    setNewName('');
    setCreating(false);
    setWorkspaceOpen(false);
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameWorkspace(id, renameValue.trim());
    setRenaming(null);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);
    setConfirmDelete(null);
    setWorkspaceOpen(false);
  };

  const initials = activeWorkspace
    ? activeWorkspace.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'WS';

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

      <div className="px-5 py-4 border-t border-white/[0.06] relative">
        <div onClick={() => setWorkspaceOpen(!workspaceOpen)} className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] rounded-lg px-2 -mx-2 py-1.5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-white/70 block truncate">{activeWorkspace?.name || 'No Workspace'}</span>
            <span className="text-[10px] text-white/30">Local Mode</span>
          </div>
          <span className="text-[10px] text-white/30">{workspaceOpen ? '▲' : '▼'}</span>
        </div>
        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-white/[0.1] bg-[#0c0c1a] p-2 shadow-2xl max-h-80 overflow-y-auto"
            >
              <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider px-2 py-1">Workspaces</div>
              <div className="space-y-0.5 mt-1">
                {workspaces.map((ws) => (
                  <div key={ws.id}>
                    {renaming === ws.id ? (
                      <div className="flex items-center gap-1 px-2 py-1">
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(ws.id); if (e.key === 'Escape') setRenaming(null); }}
                          className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-1 text-xs text-white outline-none"
                          autoFocus
                        />
                        <button onClick={() => handleRename(ws.id)} className="text-[10px] text-emerald-400 hover:text-emerald-300">✓</button>
                        <button onClick={() => setRenaming(null)} className="text-[10px] text-white/30 hover:text-white/50">✕</button>
                      </div>
                    ) : confirmDelete === ws.id ? (
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-[11px] text-white/50">Delete?</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(ws.id)} className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-white/30 hover:text-white/50 px-1.5 py-0.5">No</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => { switchWorkspace(ws.id); setWorkspaceOpen(false); }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                          activeWorkspace?.id === ws.id
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${activeWorkspace?.id === ws.id ? 'bg-indigo-400' : 'bg-white/20'}`} />
                        <span className="flex-1 truncate">{ws.name}</span>
                        {activeWorkspace?.id === ws.id && <span className="text-[10px] text-indigo-400">active</span>}
                        <button onClick={(e) => { e.stopPropagation(); setRenaming(ws.id); setRenameValue(ws.name); }} className="text-[10px] text-white/20 hover:text-white/50">✎</button>
                        {workspaces.length > 1 && (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(ws.id); }} className="text-[10px] text-white/20 hover:text-red-400">✕</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {creating ? (
                <div className="flex items-center gap-1 mt-2 px-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                    placeholder="Workspace name..."
                    className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-1 text-xs text-white outline-none"
                    autoFocus
                  />
                  <button onClick={handleCreate} className="text-[10px] text-emerald-400 hover:text-emerald-300">✓</button>
                  <button onClick={() => { setCreating(false); setNewName(''); }} className="text-[10px] text-white/30 hover:text-white/50">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full mt-2 text-[11px] text-white/30 hover:text-white/60 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
                >
                  + New Workspace
                </button>
              )}

              <div className="border-t border-white/[0.06] mt-2 pt-2 space-y-0.5">
                <button
                  onClick={() => setShowPrefs(!showPrefs)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[10px]">⚙</span>
                  <span>Preferences</span>
                  <span className="ml-auto text-[10px] text-white/20">{showPrefs ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showPrefs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-0.5 pt-1 pb-1">
                        <button
                          onClick={toggleTheme}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="text-[10px]">{theme === 'dark' ? '☀' : '☾'}</span>
                          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button
                          onClick={toggleCompact}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="text-[10px]">{compact ? '⊞' : '⊟'}</span>
                          <span>{compact ? 'Normal View' : 'Compact View'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={async () => {
                    setWorkspaceOpen(false);
                    const ws = localStorage.getItem('memoryos_active_workspace');
                    const res = await fetch(`/api/export${ws ? `?workspaceId=${ws}` : ''}`);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `memoryos-export-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[10px]">↓</span>
                  <span>Export Data</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
