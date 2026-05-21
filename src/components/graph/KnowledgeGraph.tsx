'use client';
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { GraphData } from '@/types';
import { getEntityTypeColor } from '@/lib/utils';

interface KnowledgeGraphProps {
  data: GraphData;
}

export function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      data.nodes.map((node) => ({
        id: node.id,
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: node.label,
        },
        style: {
          background: `${getEntityTypeColor(node.type)}20`,
          border: `1px solid ${getEntityTypeColor(node.type)}40`,
          color: '#fff',
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 500,
          minWidth: 100,
          textAlign: 'center' as const,
        },
      })),
    [data.nodes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        style: { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1.5 },
        labelStyle: { fill: 'rgba(255,255,255,0.4)', fontSize: 10 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.2)' },
      })),
    [data.edges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((instance: any) => {
    setTimeout(() => {
      instance.fitView({ padding: 0.3, duration: 800 });
    }, 200);
  }, []);

  if (data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">◉</div>
          <p className="text-sm text-white/40">No entities in the knowledge graph yet.</p>
          <p className="text-xs text-white/20 mt-1">Ingest data to build connections.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/[0.06] overflow-hidden"
      style={{ height: 500 }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <Controls className="[&>button]:bg-white/[0.08] [&>button]:border-white/[0.1] [&>button]:text-white/60" />
        <MiniMap
          nodeColor={(node: any) => `${getEntityTypeColor((node.data as any)?.type || 'person')}40`}
          maskColor="rgba(0,0,0,0.6)"
          style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.06)' }}
        />
      </ReactFlow>
    </motion.div>
  );
}
