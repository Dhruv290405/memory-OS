import { getMemoryRepository, getVectorRepository, seedStore } from '@/lib/store';

let initialized = false;

export async function initializeMemoryOS(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const mem = await getMemoryRepository();
  const vec = await getVectorRepository();

  const events = 'getAllMemoryEvents' in mem
    ? await mem.getAllMemoryEvents()
    : [];

  if (events.length === 0) {
    seedStore(mem);
    const seeded = await mem.getAllMemoryEvents();
    for (const event of seeded) {
      await vec.indexEvent(event, event.title + ' ' + event.summary + ' ' + event.content);
    }
  }
}
