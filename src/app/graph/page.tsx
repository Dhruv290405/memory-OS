'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { GraphData } from '@/types';
import { getWorkspaceId } from '@/lib/workspace/WorkspaceContext';

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspaceId();
    fetch(`/api/graph${ws ? `?workspaceId=${ws}` : ''}`)
      .then((r) => r.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Graph</h1>
          <p className="text-sm text-white/40 mt-1">Explore entities, relationships, and dependencies across your organizational memory</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-[500px] flex items-center justify-center">
            <div className="animate-pulse text-white/30 text-sm">Loading graph data...</div>
          </div>
        ) : (
          <KnowledgeGraph data={graphData || { nodes: [], edges: [] }} />
        )}

        {graphData && graphData.nodes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Entities ({graphData.nodes.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {graphData.nodes.map((node) => (
                  <div key={node.id} className="flex items-center gap-2 text-xs text-white/50">
                    <span className="w-2 h-2 rounded-full bg-indigo-400/30" />
                    {node.label}
                    <span className="text-white/20 ml-auto">{node.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Relationships ({graphData.edges.length})</h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {graphData.edges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-xs text-white/40">
                    <span className="text-white/20">{edge.label}</span>
                    <span className="text-white/30">—</span>
                    <span className="truncate">{edge.source} → {edge.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
