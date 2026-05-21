import { getMemoryRepository, getVectorRepository, seedStore } from '@/lib/store';
import { v4 as uuid } from 'uuid';
import { Workspace } from '@/types';

let initialized = false;

async function ensureDefaultWorkspace(mem: any): Promise<string> {
  const existing = await mem.getWorkspaces();
  if (existing.length > 0) {
    const wsId = existing[0].id;
    mem.setWorkspaceContext(undefined);
    const events = await mem.getAllMemoryEvents();
    const needsMigration = events.length > 0 && events[0].workspaceId !== wsId;
    if (needsMigration) {
      for (const e of events) await mem.addMemoryEvent({ ...e, workspaceId: wsId });
    }
    mem.setWorkspaceContext(undefined);
    const entities = await mem.getAllEntities();
    if (entities.length > 0 && (entities[0] as any).workspaceId !== wsId) {
      for (const e of entities) await mem.addEntity({ ...e, workspaceId: wsId });
    }
    mem.setWorkspaceContext(undefined);
    const sources = await mem.getAllSources();
    if (sources.length > 0 && (sources[0] as any).workspaceId !== wsId) {
      for (const s of sources) await mem.addSource({ ...s, workspaceId: wsId });
    }
    mem.setWorkspaceContext(wsId);
    return wsId;
  }

  const now = new Date().toISOString();
  const workspace: Workspace = { id: `ws-${uuid().slice(0, 8)}`, name: 'Demo Workspace', createdAt: now, updatedAt: now };
  await mem.addWorkspace(workspace);
  return workspace.id;
}

export async function initializeMemoryOS(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const mem = await getMemoryRepository();
  const vec = await getVectorRepository();

  const wsId = await ensureDefaultWorkspace(mem);

  const entities = 'getAllEntities' in mem ? await mem.getAllEntities() : [];
  const hasMemoryOS = entities.some((e: any) => e.name === 'MemoryOS');

  if (!hasMemoryOS) {
    if (entities.length > 0) await mem.clear();
    if ('clear' in vec) await vec.clear();

    await ensureDefaultWorkspace(mem);
    mem.setWorkspaceContext(wsId);

    seedStore(mem);
    const seeded = await mem.getAllMemoryEvents();
    for (const event of seeded) {
      await vec.indexEvent(event, event.title + ' ' + event.summary + ' ' + event.content);
    }
  } else {
    mem.setWorkspaceContext(wsId);
  }
}
