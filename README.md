# MemoryOS

**Local-first AI organizational memory platform**

MemoryOS ingests knowledge from files, chats, meetings, and commits; normalizes them into structured "memory events"; and provides semantic search, knowledge graphs, timeline replay, and an AI chat that answers questions with cited sources — all powered by local AI (Ollama).

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

The app seeds itself with realistic demo data on first load.

## Features

- **Data Ingestion** — Parse Markdown, JSON, text, transcripts, commit logs, chat exports
- **Memory Events** — Structured knowledge objects with types, entities, importance scores
- **Semantic Search** — Hybrid keyword + vector search
- **Knowledge Graph** — Interactive React Flow visualization of entities and relationships
- **Timeline Replay** — Chronological history with filtering
- **Insights Dashboard** — Topics, metrics, decision density, memory coverage
- **Ask MemoryOS** — Conversational RAG with cited sources via local LLM

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| Graph | @xyflow/react (React Flow) |
| Charts | Recharts |
| AI | Ollama (local LLM) |
| Embeddings | Ollama nomic-embed-text / simulated fallback |
| Backend | Next.js API Routes (App Router) |
| Data | In-memory store (pluggable: PostgreSQL/pgvector) |

## Architecture

```
Frontend → API Routes → Ingestion Pipeline → Vector Store → Retrieval → Local LLM → Cited Answers
```

See [docs/architecture.md](docs/architecture.md) for detailed architecture.

## Ollama Integration (Optional)

MemoryOS works fully without Ollama. For enhanced AI:

```bash
# Install Ollama: https://ollama.com
ollama pull llama3.2:3b
ollama pull nomic-embed-text
# Restart the app
```

## Project Structure

```
src/
├── app/           # Pages + API routes
│   ├── api/        # REST endpoints
│   ├── ask/        # Chat interface
│   ├── graph/      # Knowledge graph
│   ├── timeline/   # Timeline replay
│   ├── insights/   # Analytics
│   └── sources/    # Source management
├── components/    # React components
│   ├── ui/         # Primitives (Card, Badge, Button)
│   ├── layout/     # App shell, sidebar
│   ├── graph/      # KnowledgeGraph component
│   ├── timeline/   # TimelineReplay component
│   ├── chat/       # AskMemoryChat component
│   └── dashboard/  # MetricsGrid, InsightCard, SpendChart
├── lib/           # Core logic
│   ├── store/      # In-memory store + seed data
│   ├── ai/         # Ollama client + RAG pipeline
│   ├── ingestion/  # Parser, chunker, normalizer
│   └── search/     # Hybrid search
└── types/         # TypeScript definitions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ingest | Ingest new source content |
| GET | /api/memory-events | List memory events |
| GET | /api/search?q= | Semantic search |
| POST | /api/ask | Ask MemoryOS with RAG |
| GET | /api/graph | Knowledge graph data |
| GET | /api/timeline | Timeline events |
| GET | /api/insights | Aggregated analytics |
| GET | /api/sources | List sources |

## Demo Walkthrough

1. **Dashboard** — Overview metrics, recent events, type distribution, connected entities
2. **Ask MemoryOS** — Ask questions like "Why did we move to gRPC?" with cited sources
3. **Knowledge Graph** — Interactive entity-relationship visualization
4. **Timeline** — Chronological event replay with type filtering
5. **Insights** — Aggregated analytics, topics, unresolved issues
6. **Sources** — View and ingest new content

## Interview Talking Points

See [docs/interview-guide.md](docs/interview-guide.md) for detailed talking points covering:
- Problem statement and solution
- Why local AI over cloud APIs
- Architecture strengths and tradeoffs
- Production scaling strategy
- Future improvements

## License

MIT
