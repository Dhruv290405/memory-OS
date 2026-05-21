'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

export default function SettingsPage() {
  const { workspaces, activeWorkspace, renameWorkspace } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const ws = activeWorkspace?.id ? `?workspaceId=${activeWorkspace.id}` : '';
      const res = await fetch(`/api/export${ws}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memoryos-export-${activeWorkspace?.name || 'all'}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportResult('Export downloaded successfully');
    } catch {
      setExportResult('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-white/40 mt-1">Manage your MemoryOS configuration</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Workspaces</h2>
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <div key={ws.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <span className="text-sm text-white/80">{ws.name}</span>
                  {ws.id === activeWorkspace?.id && (
                    <span className="ml-2 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">active</span>
                  )}
                </div>
                <span className="text-[11px] text-white/30">Created {new Date(ws.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Data Management</h2>
          <p className="text-xs text-white/40 mb-4">
            Export your workspace data as JSON for backup or migration.
            {activeWorkspace && <span> Currently exporting: <strong className="text-white/60">{activeWorkspace.name}</strong></span>}
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
          {exportResult && (
            <p className="text-xs text-emerald-400 mt-3">{exportResult}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">About</h2>
          <div className="space-y-2 text-xs text-white/40">
            <p>MemoryOS v0.1.0</p>
            <p>Local-first organizational memory platform</p>
            <p>Backend: SQLite (local database)</p>
            <p>AI: Ollama (optional, falls back to local context matching)</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
