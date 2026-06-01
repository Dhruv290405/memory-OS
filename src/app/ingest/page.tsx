'use client';
import { useState, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getWorkspaceId } from '@/lib/workspace/WorkspaceContext';

interface PreviewEvent {
  title: string;
  type: string;
  author: string;
  importance: number;
  tags: string[];
  summary: string;
  content: string;
  entities: string[];
  timestamp: string;
}

export default function IngestPage() {
  const [fileEvents, setFileEvents] = useState<PreviewEvent[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [pasteEvents, setPasteEvents] = useState<PreviewEvent[]>([]);
  const [workspaceId, setWorkspaceId] = useState(getWorkspaceId() || '');
  const [ingesting, setIngesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((files: FileList | null) => {
    if (!files) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const items = Array.isArray(data) ? data : [data];
          const parsed: PreviewEvent[] = items.map((item: any) => ({
            title: item.title || item.name || 'Untitled',
            type: item.type || 'note',
            author: item.author || 'Unknown',
            importance: item.importance ?? 5,
            tags: item.tags || [],
            summary: item.summary || item.description || '',
            content: item.content || item.body || item.text || JSON.stringify(item),
            entities: item.entities || [],
            timestamp: item.timestamp || new Date().toISOString(),
          }));
          setFileEvents((prev) => [...prev, ...parsed]);
        } catch {
          setResult({ ok: false, message: `Failed to parse "${file.name}" — invalid JSON` });
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handlePasteParse = () => {
    if (!pasteText.trim()) return;
    try {
      const data = JSON.parse(pasteText);
      const items = Array.isArray(data) ? data : [data];
      const parsed: PreviewEvent[] = items.map((item: any) => ({
        title: item.title || item.name || 'Untitled',
        type: item.type || 'note',
        author: item.author || 'Unknown',
        importance: item.importance ?? 5,
        tags: item.tags || [],
        summary: item.summary || item.description || '',
        content: item.content || item.body || item.text || JSON.stringify(item),
        entities: item.entities || [],
        timestamp: item.timestamp || new Date().toISOString(),
      }));
      setPasteEvents(parsed);
      setResult({ ok: true, message: `Parsed ${parsed.length} event(s) from pasted text` });
    } catch {
      setResult({ ok: false, message: 'Invalid JSON in pasted text' });
    }
  };

  const allEvents = [...fileEvents, ...pasteEvents];

  const handleIngest = async () => {
    if (allEvents.length === 0) return;
    setIngesting(true);
    setResult(null);
    try {
      const res = await fetch('/api/ingest/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: allEvents,
          workspaceId: workspaceId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Successfully ingested ${data.created} event(s)!` });
        setFileEvents([]);
        setPasteEvents([]);
        setPasteText('');
      } else {
        setResult({ ok: false, message: data.error || 'Ingestion failed' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error during ingestion' });
    } finally {
      setIngesting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ingest Events</h1>
          <p className="text-sm text-white/40 mt-1">Upload JSON files or paste structured data</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Workspace</h2>
          <input
            type="text"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="Workspace ID (optional)"
            className="w-full max-w-md bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileDrop(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/5'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-3xl mb-3 opacity-30">⊞</div>
            <p className="text-sm text-white/50 mb-1">Drop JSON files here</p>
            <p className="text-xs text-white/20">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              onChange={(e) => handleFileDrop(e.target.files)}
              className="hidden"
            />
            {fileEvents.length > 0 && (
              <p className="text-xs text-emerald-400 mt-3">{fileEvents.length} event(s) loaded from files</p>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Paste JSON</h2>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'[\n  {\n    "title": "My Event",\n    "type": "decision",\n    "summary": "...",\n    "content": "...",\n    "author": "Alice",\n    "tags": ["tag1"],\n    "entities": ["entity1"],\n    "importance": 5\n  }\n]'}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[160px] font-mono"
              rows={6}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handlePasteParse} disabled={!pasteText.trim()}>
                Parse
              </Button>
            </div>
            {pasteEvents.length > 0 && (
              <p className="text-xs text-emerald-400 mt-2">{pasteEvents.length} event(s) parsed from paste</p>
            )}
          </div>
        </div>

        {allEvents.length > 0 && (
          <>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  Preview ({allEvents.length} event{allEvents.length !== 1 ? 's' : ''})
                </h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setFileEvents([]); setPasteEvents([]); }}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleIngest} disabled={ingesting}>
                    {ingesting ? 'Ingesting...' : 'Confirm Ingest'}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-[11px] text-white/30 font-medium uppercase tracking-wider">Title</th>
                      <th className="text-left px-5 py-3 text-[11px] text-white/30 font-medium uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3 text-[11px] text-white/30 font-medium uppercase tracking-wider">Author</th>
                      <th className="text-left px-5 py-3 text-[11px] text-white/30 font-medium uppercase tracking-wider">Importance</th>
                      <th className="text-left px-5 py-3 text-[11px] text-white/30 font-medium uppercase tracking-wider">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEvents.map((evt, i) => (
                      <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-white/80 text-xs max-w-[200px] truncate">{evt.title}</td>
                        <td className="px-5 py-3">
                          <Badge variant="event" type={evt.type as any} label={evt.type} small />
                        </td>
                        <td className="px-5 py-3 text-white/50 text-xs">{evt.author}</td>
                        <td className="px-5 py-3 text-white/50 text-xs">P{evt.importance}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {evt.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} label={tag} small />
                            ))}
                            {evt.tags.length > 4 && (
                              <span className="text-[10px] text-white/30">+{evt.tags.length - 4}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleIngest} disabled={ingesting} size="lg">
                {ingesting ? 'Ingesting...' : `Confirm Ingest ${allEvents.length} Event${allEvents.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              result.ok
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                : 'border-red-500/20 bg-red-500/5 text-red-300'
            }`}
          >
            {result.message}
          </div>
        )}
      </div>
    </AppShell>
  );
}
