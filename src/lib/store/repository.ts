import { IMemoryRepository, IVectorRepository, BackendType, StorageConfig } from './interfaces';
import { InMemoryRepository } from './inMemoryRepository';
import { InMemoryVectorRepository } from './inMemoryVectorRepository';

let memoryRepo: IMemoryRepository | null = null;
let vectorRepo: IVectorRepository | null = null;
let config: StorageConfig = { backend: 'sqlite', sqlitePath: process.env.MEMORYOS_DB_PATH || undefined };
let initialized = false;

export function setBackend(type: BackendType, sqlitePath?: string): void {
  if (initialized) {
    throw new Error('Cannot switch backend after initialization. Set backend before any repository access.');
  }
  config = { backend: type, sqlitePath };
}

export function getBackend(): BackendType {
  return config.backend;
}

async function loadPostgresRepositories(): Promise<{
  memory: IMemoryRepository;
  vector: IVectorRepository;
}> {
  const { PostgresRepository } = await import('./pgRepository');
  const { PostgresVectorRepository } = await import('./pgVectorRepository');
  return {
    memory: new PostgresRepository(),
    vector: new PostgresVectorRepository(),
  };
}

async function loadSqliteRepositories(dbPath?: string): Promise<{
  memory: IMemoryRepository;
  vector: IVectorRepository;
}> {
  const { SqliteRepository } = await import('./sqliteRepository');
  const { SqliteVectorRepository } = await import('./sqliteVectorRepository');
  return {
    memory: new SqliteRepository(dbPath),
    vector: new SqliteVectorRepository(dbPath),
  };
}

export async function getMemoryRepository(): Promise<IMemoryRepository> {
  if (!memoryRepo) {
    if (config.backend === 'postgres') {
      const repos = await loadPostgresRepositories();
      memoryRepo = repos.memory;
    } else if (config.backend === 'sqlite') {
      const repos = await loadSqliteRepositories(config.sqlitePath);
      memoryRepo = repos.memory;
    } else {
      memoryRepo = new InMemoryRepository();
    }
    await memoryRepo.initialize();
    initialized = true;
  }
  return memoryRepo;
}

export async function getVectorRepository(): Promise<IVectorRepository> {
  if (!vectorRepo) {
    if (config.backend === 'postgres') {
      const repos = await loadPostgresRepositories();
      vectorRepo = repos.vector;
    } else if (config.backend === 'sqlite') {
      const repos = await loadSqliteRepositories(config.sqlitePath);
      vectorRepo = repos.vector;
    } else {
      vectorRepo = new InMemoryVectorRepository();
    }
    await vectorRepo.initialize();
    initialized = true;
  }
  return vectorRepo;
}

export async function initializeRepositories(): Promise<void> {
  const mem = await getMemoryRepository();
  const vec = await getVectorRepository();
}

export function setTestRepositories(memory: IMemoryRepository, vector: IVectorRepository): void {
  memoryRepo = memory;
  vectorRepo = vector;
  initialized = true;
}
