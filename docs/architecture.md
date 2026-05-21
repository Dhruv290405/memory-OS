# MemoryOS Architecture

## System Overview

MemoryOS is a local-first AI organizational memory platform. It ingests heterogeneous knowledge sources, normalizes them into structured memory events, stores them in a searchable in-memory knowledge layer with vector embeddings, and provides semantic search, knowledge graphs, timeline replay, and an AI chat interface powered by local LLM inference via Ollama.

## Architecture Diagram

```
Frontend (Next.js + Tailwind + Framer Motion)
    │
    ▼
API Routes (Next.js App Router - Server Components)
    │
    ├──► Ingestion Pipeline
    │       ├── Parser (Markdown, JSON, Text, Commits, Chats, Transcripts)
    │       ├── Chunker (Content segmentation)
    │       ├── Normalizer (Memory event extraction)
    │       └── Entity/Tag Extractor (NLP-lite rule-based)
    │
    ├──► Vector Store (In-memory with Ollama embedding support)
    │       ├── Local simulated embeddings (fallback)
    │       └── Ollama nomic-embed-text (when available)
    │
    ├──► Retrieval Layer
    │       ├── Keyword search (metadata + full-text)
    │       ├── Vector similarity search
    │       └── Hybrid ranking
    │
    ├──► AI Reasoning (Ollama)
    │       ├── Context construction
    │       ├── Local LLM prompt (llama3.2 or similar)
    │       └── Cited answer generation
    │
    └──► In-Memory Data Store
            ├── Memory Events
            ├── Entities
            ├── Relations
            ├── Sources
            └── Query Logs
```

## Key Design Decisions

### 1. Local-First AI
- **Ollama** for local LLM inference (privacy, no API costs, offline-capable)
- **Local embeddings** via Ollama or simulated (deterministic hash-based)
- No external AI API dependencies

### 2. In-Memory Store
- Zero-configuration startup — no PostgreSQL/ChromaDB setup required
- Demonstrates the complete data model and API contract
- Easy to swap for persistent storage (pgvector, ChromaDB)
- Seed data provides immediate demo richness

### 3. Hybrid Search
- Combines keyword metadata filtering with vector similarity
- Ranks by title/author/tag matches plus semantic relevance
- Graceful fallback when Ollama embeddings unavailable

### 4. Clean Architecture
- Separation of concerns: store, ingestion, search, AI
- Modular type definitions shared across frontend and backend
- API-driven design with clear contracts
- Components organized by domain (dashboard, graph, timeline, chat)

## Data Flow

1. **Ingestion**: Raw content → Parser → Structured events → Store + Vector index
2. **Search**: Query → Keyword filter → Vector similarity → Ranked results
3. **Ask Memory**: Question → Retrieve context → Build prompt → LLM → Cited answer
4. **Graph**: Entities + Relations → Graph data → React Flow visualization
5. **Timeline**: Memory events → Chronological sort → Timeline render

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| In-memory store | Fast startup, no DB setup; data lost on restart (acceptable for demo) |
| Simulated embeddings | Works offline; less accurate than real embeddings |
| Rule-based entity extraction | Simpler than NLP models; misses nuanced entities |
| Monorepo Next.js | Simple deployment; not ideal for separate scaling of services |
