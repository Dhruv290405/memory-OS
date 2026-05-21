'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Source } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIngest, setShowIngest] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'markdown', content: '', author: '' });

  const fetchSources = () => {
    setLoading(true);
    fetch('/api/sources')
      .then((r) => r.json())
      .then((data) => {
        setSources(data.sources || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content || !form.type) return;

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: '', type: 'markdown', content: '', author: '' });
        setShowIngest(false);
        fetchSources();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sources</h1>
            <p className="text-sm text-white/40 mt-1">Manage ingested knowledge sources</p>
          </div>
          <Button onClick={() => setShowIngest(true)}>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Ingest
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div className="flex items-center justify-center h-64 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-30">⊟</div>
              <p className="text-sm text-white/40">No sources ingested yet.</p>
              <p className="text-xs text-white/20 mt-1">Click &quot;Ingest&quot; to add your first source.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <Card key={source.id} hover>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{source.name}</CardTitle>
                    <Badge variant="outline" label={source.type} small />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{truncate(source.content, 200)}</p>
                  <div className="flex items-center justify-between text-[11px] text-white/30">
                    <span>{source.author}</span>
                    <span>{formatDateTime(source.timestamp)}</span>
                    <span>{source.eventCount} events</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showIngest} onClose={() => setShowIngest(false)} title="Ingest New Source">
          <form onSubmit={handleIngest} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Source Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g., Architecture Decision Record"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Source Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="markdown">Markdown</option>
                <option value="text">Plain Text</option>
                <option value="json">JSON</option>
                <option value="transcript">Transcript</option>
                <option value="commit_log">Commit Log</option>
                <option value="chat_export">Chat Export</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g., Alice Chen"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[150px] font-mono"
                placeholder="Paste or type content here..."
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowIngest(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v10M3 8h10" />
                </svg>
                Ingest
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
