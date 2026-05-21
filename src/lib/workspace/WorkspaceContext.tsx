'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Workspace } from '@/types';

function getWsId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('memoryos_active_workspace') || undefined;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  switchWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  loading: true,
  switchWorkspace: () => {},
  createWorkspace: async () => {},
  renameWorkspace: async () => {},
  deleteWorkspace: async () => {},
});

export function getWorkspaceId(): string | undefined {
  return getWsId();
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    try {
      const res = await fetch('/api/workspaces');
      const data = await res.json();
      if (data.workspaces) {
        setWorkspaces(data.workspaces);
        const stored = getWsId();
        const active = data.workspaces.find((w: Workspace) => w.id === stored) || data.workspaces[0] || null;
        setActiveWorkspace(active);
        if (active) localStorage.setItem('memoryos_active_workspace', active.id);
      }
    } catch (e) {
      console.error('Failed to load workspaces:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshWorkspaces(); }, [refreshWorkspaces]);

  const switchWorkspace = (id: string) => {
    localStorage.setItem('memoryos_active_workspace', id);
    window.location.reload();
  };

  const createWorkspace = async (name: string) => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.workspace) {
      localStorage.setItem('memoryos_active_workspace', data.workspace.id);
      window.location.reload();
    }
  };

  const renameWorkspace = async (id: string, name: string) => {
    await fetch(`/api/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    window.location.reload();
  };

  const deleteWorkspace = async (id: string) => {
    await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces, activeWorkspace, loading,
      switchWorkspace, createWorkspace, renameWorkspace, deleteWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
