import { v4 as uuid } from 'uuid';
import { MemoryEvent, Entity, Relation, Source, Tag } from '@/types';

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export function getDemoSources(): Source[] {
  return [
    {
      id: 'src-1',
      name: 'Architecture Decision Record - Microservices Migration',
      type: 'markdown',
      content: `# ADR-001: Migrate to Microservices Architecture

## Context
The monolithic application is experiencing scaling bottlenecks. Current deployment pipeline takes 45 minutes. Team has grown to 12 engineers.

## Decision
We will split the monolith into 5 microservices: Auth, Payment, Inventory, Notification, and Gateway.

## Consequences
- Faster independent deployments
- Team ownership per service
- Increased operational complexity
- Need for API gateway and service mesh`,
      author: 'Alice Chen',
      timestamp: daysAgo(120),
      eventCount: 4,
      createdAt: daysAgo(120),
    },
    {
      id: 'src-2',
      name: 'Performance Review Meeting Notes',
      type: 'text',
      content: `Performance Review - Q3 2025
Attendees: Alice, Bob, Charlie, Diana

Issues identified:
- Database query latency increased by 300% after schema change
- gRPC migration is on track for completion by end of quarter
- Frontend bundle size needs optimization
- Memory leak in notification service identified

Decisions:
- Bob will lead the database optimization sprint
- gRPC migration timeline confirmed
- Diana to investigate frontend tree-shaking`,
      author: 'Bob Martinez',
      timestamp: daysAgo(45),
      eventCount: 4,
      createdAt: daysAgo(45),
    },
    {
      id: 'src-3',
      name: 'Database Schema Change Discussion',
      type: 'chat_export',
      content: `Alice: I'm proposing we move from relational to document-based for the events table.
Bob: That could improve write throughput by 60% based on my benchmarks.
Charlie: But we need ACID compliance for payments.
Alice: We can keep PostgreSQL for payments and use MongoDB for event storage.
Diana: CQRS pattern would work well here. Write to event store, read from materialized views.
Bob: Agreed. Let's prototype this in the next sprint.
Alice: Decision recorded. We'll do hybrid persistence with CQRS.`,
      author: 'Alice Chen',
      timestamp: daysAgo(60),
      eventCount: 5,
      createdAt: daysAgo(60),
    },
    {
      id: 'src-4',
      name: 'Commit Log - Sprint 24',
      type: 'commit_log',
      content: `feat: implement gRPC service mesh
feat: add rate limiting middleware
fix: resolve memory leak in notification worker
refactor: extract payment service from monolith
docs: update API documentation for v2
test: add integration tests for auth service
chore: update dependencies`,
      author: 'Charlie Wang',
      timestamp: daysAgo(30),
      eventCount: 3,
      createdAt: daysAgo(30),
    },
    {
      id: 'src-5',
      name: 'Security Audit Findings',
      type: 'markdown',
      content: `# Security Audit - September 2025

## Critical
- JWT token rotation not implemented
- API rate limiting missing on auth endpoints

## High
- Database credentials in environment files
- No encryption at rest for user data

## Medium
- Missing audit logging for admin actions
- Session timeout too permissive (24h)

## Action Items
- Implement token rotation by Oct 15
- Add rate limiting middleware
- Move secrets to vault`,
      author: 'Diana Park',
      timestamp: daysAgo(20),
      eventCount: 3,
      createdAt: daysAgo(20),
    },
    {
      id: 'src-6',
      name: 'Product Roadmap Discussion',
      type: 'transcript',
      content: `Product Team Sync - Q4 Planning
We discussed the priorities for next quarter.
The team agreed that performance improvements are the top priority.
Multi-tenancy support was deprioritized in favor of reliability.
Decision: Focus on latency reduction, observability, and documentation.
The gRPC migration should be completed by end of Q4.
Database optimization is a blocking dependency for the new reporting feature.`,
      author: 'Alice Chen',
      timestamp: daysAgo(15),
      eventCount: 3,
      createdAt: daysAgo(15),
    },
    {
      id: 'src-7',
      name: 'Incident Report - Outage Oct 12',
      type: 'markdown',
      content: `# Incident Report: Service Outage - Oct 12, 2025

## Timeline
- 14:23 UTC - Alert: Payment service latency spike
- 14:25 UTC - Page: On-call engineer responds
- 14:30 UTC - Identified: Database connection pool exhaustion
- 14:45 UTC - Mitigated: Restored connection pool limits
- 15:30 UTC - Root cause confirmed

## Root Cause
The connection pool was configured too aggressively (max 50), causing starvation under load.

## Resolution
- Reduced max connections to 20
- Added connection pooling middleware
- Implemented circuit breaker pattern

## Action Items
- Add connection pool monitoring dashboard
- Implement auto-scaling for database connections
- Run load testing monthly`,
      author: 'Bob Martinez',
      timestamp: daysAgo(10),
      eventCount: 4,
      createdAt: daysAgo(10),
    },
    {
      id: 'src-8',
      name: 'MemoryOS Architecture Documentation',
      type: 'markdown',
      content: `# MemoryOS Architecture

MemoryOS is a local-first AI organizational memory platform built with Next.js 16, TypeScript, and Tailwind CSS.

## Tech Stack
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- State/Visualization: @xyflow/react (ReactFlow), framer-motion, recharts
- Storage: better-sqlite3 (local-first), optional PostgreSQL
- AI: Ollama for local LLM inference and embeddings
- Search: Hybrid keyword + vector search

## Features
- Knowledge Graph: Entity-relationship visualization using ReactFlow with dagre auto-layout
- Ask Memory: Conversational RAG with cited sources
- Insight Dashboard: Aggregated analytics with charts and metrics
- Timeline Replay: Chronological history with type filtering
- Ingestion Pipeline: Parses markdown, JSON, text, chat exports, commit logs`,
      author: 'Development Team',
      timestamp: daysAgo(90),
      eventCount: 4,
      createdAt: daysAgo(90),
    },
    {
      id: 'src-9',
      name: 'Knowledge Graph Feature Specification',
      type: 'markdown',
      content: `# Knowledge Graph Feature

The Knowledge Graph visualizes entities and their relationships as an interactive directed graph.

## Components
- ReactFlow for canvas rendering with zoom, pan, and minimap
- dagre (directed graph layout engine) for automatic node positioning
- Entity type color-coding (people, systems, technologies)
- Relationship arrows with type labels
- MiniMap for navigation

## Data Model
- Nodes represent entities (people, systems, technologies)
- Edges represent relationships (influences, depends_on, implements, mentions)
- Node importance is determined by connection count`,
      author: 'Development Team',
      timestamp: daysAgo(85),
      eventCount: 4,
      createdAt: daysAgo(85),
    },
    {
      id: 'src-10',
      name: 'Insights and Analytics Dashboard Documentation',
      type: 'markdown',
      content: `# Insights Dashboard and Timeline

The Insights Dashboard provides aggregated analytics across all memory events.

## Dashboard Metrics
- Total memory events, entities tracked, relationships, data sources
- Event type distribution with color-coded bars
- Top topics by tag frequency
- High priority events (importance >= 8)
- Most connected entities (by relationship count)
- Event timeline chart (monthly event counts)
- Average importance score and unique authors

## Timeline Replay
- Chronological list of all memory events
- Filter by event type (decision, meeting, discussion, issue, etc.)
- Expandable items showing related entities`,
      author: 'Development Team',
      timestamp: daysAgo(80),
      eventCount: 4,
      createdAt: daysAgo(80),
    },
  ];
}

export function getDemoMemoryEvents(): MemoryEvent[] {
  return [
    {
      id: 'evt-1',
      type: 'architecture',
      sourceId: 'src-1',
      sourceType: 'markdown',
      title: 'Decision: Migrate to Microservices Architecture',
      summary: 'Split monolith into 5 microservices to address scaling bottlenecks and enable team autonomy.',
      content: 'The monolithic application is experiencing scaling bottlenecks. Current deployment pipeline takes 45 minutes. We will split the monolith into 5 microservices: Auth, Payment, Inventory, Notification, and Gateway. This enables faster independent deployments and team ownership per service but increases operational complexity.',
      author: 'Alice Chen',
      timestamp: daysAgo(120),
      tags: ['architecture', 'microservices', 'scaling', 'infrastructure'],
      entities: ['Alice Chen', 'Auth Service', 'Payment Service', 'Monolith'],
      importance: 9,
      createdAt: daysAgo(120),
    },
    {
      id: 'evt-2',
      type: 'decision',
      sourceId: 'src-1',
      sourceType: 'markdown',
      title: 'Decision: Use API Gateway for Service Mesh',
      summary: 'An API gateway will handle routing, authentication, and rate limiting for all microservices.',
      content: 'To manage the increased operational complexity of microservices, we will implement an API gateway (Kong) that handles routing, authentication, rate limiting, and service discovery. This centralizes cross-cutting concerns.',
      author: 'Alice Chen',
      timestamp: daysAgo(118),
      tags: ['decision', 'api-gateway', 'architecture'],
      entities: ['Alice Chen', 'API Gateway', 'Kong'],
      importance: 8,
      createdAt: daysAgo(118),
    },
    {
      id: 'evt-3',
      type: 'discussion',
      sourceId: 'src-3',
      sourceType: 'chat_export',
      title: 'Discussion: Hybrid Persistence with CQRS',
      summary: 'Team decided to adopt CQRS pattern with PostgreSQL for payments and document store for events.',
      content: 'Alice proposed moving from relational to document-based for events table. Bob benchmarked 60% write throughput improvement. Charlie required ACID for payments. Diana suggested CQRS pattern. Decision: hybrid persistence with CQRS. PostgreSQL for transactional data, MongoDB for event storage.',
      author: 'Alice Chen',
      timestamp: daysAgo(60),
      tags: ['database', 'cqrs', 'architecture', 'persistence'],
      entities: ['Alice Chen', 'Bob Martinez', 'Charlie Wang', 'Diana Park', 'PostgreSQL', 'MongoDB'],
      importance: 8,
      createdAt: daysAgo(60),
    },
    {
      id: 'evt-4',
      type: 'meeting',
      sourceId: 'src-2',
      sourceType: 'text',
      title: 'Meeting: Q3 Performance Review',
      summary: 'Database latency up 300%, gRPC migration on track, memory leak identified in notification service.',
      content: 'Quarterly performance review. Key findings: Database query latency increased by 300% after schema change. gRPC migration is on track. Frontend bundle needs optimization. Memory leak identified in notification service. Bob to lead database optimization sprint.',
      author: 'Bob Martinez',
      timestamp: daysAgo(45),
      tags: ['meeting', 'performance', 'review', 'q3'],
      entities: ['Bob Martinez', 'Alice Chen', 'Charlie Wang', 'Diana Park'],
      importance: 7,
      createdAt: daysAgo(45),
    },
    {
      id: 'evt-5',
      type: 'decision',
      sourceId: 'src-2',
      sourceType: 'text',
      title: 'Decision: Bob Leads Database Optimization Sprint',
      summary: 'Bob Martinez assigned to lead the database optimization sprint to address 300% latency increase.',
      content: 'Bob will lead the database optimization sprint to investigate and resolve the 300% query latency increase caused by a schema change.',
      author: 'Bob Martinez',
      timestamp: daysAgo(45),
      tags: ['decision', 'database', 'optimization', 'leadership'],
      entities: ['Bob Martinez', 'Database'],
      importance: 7,
      createdAt: daysAgo(45),
    },
    {
      id: 'evt-6',
      type: 'decision',
      sourceId: 'src-2',
      sourceType: 'text',
      title: 'Decision: gRPC Migration Timeline Confirmed',
      summary: 'gRPC migration remains on schedule for end-of-quarter completion.',
      content: 'The gRPC migration timeline was confirmed. The team will continue the migration as planned with completion expected by end of quarter.',
      author: 'Bob Martinez',
      timestamp: daysAgo(45),
      tags: ['decision', 'grpc', 'migration', 'timeline'],
      entities: ['gRPC'],
      importance: 6,
      createdAt: daysAgo(45),
    },
    {
      id: 'evt-7',
      type: 'commit',
      sourceId: 'src-4',
      sourceType: 'commit_log',
      title: 'Commit: Implement gRPC Service Mesh',
      summary: 'Implementation of gRPC service mesh for inter-service communication.',
      content: 'Implemented gRPC service mesh for inter-service communication between microservices. This enables type-safe, high-performance RPC calls with built-in load balancing.',
      author: 'Charlie Wang',
      timestamp: daysAgo(30),
      tags: ['commit', 'grpc', 'service-mesh', 'implementation'],
      entities: ['Charlie Wang', 'gRPC'],
      importance: 7,
      createdAt: daysAgo(30),
    },
    {
      id: 'evt-8',
      type: 'commit',
      sourceId: 'src-4',
      sourceType: 'commit_log',
      title: 'Commit: Add Rate Limiting Middleware',
      summary: 'Rate limiting middleware added to API gateway for security compliance.',
      content: 'Added rate limiting middleware to the API gateway to address security audit findings. Limits requests to 1000/hour per API key.',
      author: 'Charlie Wang',
      timestamp: daysAgo(29),
      tags: ['commit', 'security', 'rate-limiting', 'middleware'],
      entities: ['Charlie Wang', 'API Gateway'],
      importance: 6,
      createdAt: daysAgo(29),
    },
    {
      id: 'evt-9',
      type: 'issue',
      sourceId: 'src-5',
      sourceType: 'markdown',
      title: 'Issue: JWT Token Rotation Not Implemented',
      summary: 'Critical security finding: JWT token rotation is missing, requiring immediate remediation.',
      content: 'Security audit found JWT token rotation is not implemented. This is a critical vulnerability that could allow unauthorized access. Must be implemented by Oct 15.',
      author: 'Diana Park',
      timestamp: daysAgo(20),
      tags: ['security', 'jwt', 'critical', 'compliance'],
      entities: ['Diana Park', 'JWT'],
      importance: 9,
      createdAt: daysAgo(20),
    },
    {
      id: 'evt-10',
      type: 'issue',
      sourceId: 'src-5',
      sourceType: 'markdown',
      title: 'Issue: API Rate Limiting Missing',
      summary: 'High severity finding: authentication endpoints lack rate limiting, creating DoS vulnerability.',
      content: 'API rate limiting is missing on auth endpoints. This could allow brute force attacks. Rate limiting middleware was subsequently added.',
      author: 'Diana Park',
      timestamp: daysAgo(20),
      tags: ['security', 'rate-limiting', 'high-severity'],
      entities: ['Diana Park', 'API Gateway'],
      importance: 7,
      createdAt: daysAgo(20),
    },
    {
      id: 'evt-11',
      type: 'outcome',
      sourceId: 'src-6',
      sourceType: 'transcript',
      title: 'Outcome: Q4 Priorities Set - Performance First',
      summary: 'Team agreed to prioritize performance improvements, observability, and documentation over multi-tenancy.',
      content: 'Product team sync decided: Performance improvements are top priority. Multi-tenancy deprioritized for reliability. Focus on latency reduction, observability, and documentation.',
      author: 'Alice Chen',
      timestamp: daysAgo(15),
      tags: ['planning', 'priorities', 'q4', 'product'],
      entities: ['Alice Chen'],
      importance: 7,
      createdAt: daysAgo(15),
    },
    {
      id: 'evt-12',
      type: 'risk',
      sourceId: 'src-6',
      sourceType: 'transcript',
      title: 'Risk: Database Optimization Blocks Reporting Feature',
      summary: 'Database optimization is identified as a blocking dependency for the new reporting feature.',
      content: 'Database optimization is a blocking dependency for the new reporting feature. If not resolved, reporting feature delivery will be delayed.',
      author: 'Alice Chen',
      timestamp: daysAgo(15),
      tags: ['risk', 'database', 'dependency', 'blocking'],
      entities: ['Alice Chen', 'Database'],
      importance: 8,
      createdAt: daysAgo(15),
    },
    {
      id: 'evt-13',
      type: 'issue',
      sourceId: 'src-7',
      sourceType: 'markdown',
      title: 'Incident: Database Connection Pool Exhaustion',
      summary: 'Service outage caused by over-aggressive database connection pool configuration (max 50).',
      content: 'Service outage on Oct 12. Root cause: connection pool configured too aggressively (max 50), causing starvation under load. Resolved by reducing max connections to 20 and adding connection pooling middleware.',
      author: 'Bob Martinez',
      timestamp: daysAgo(10),
      tags: ['incident', 'outage', 'database', 'connection-pool'],
      entities: ['Bob Martinez', 'Database', 'Payment Service'],
      importance: 9,
      createdAt: daysAgo(10),
    },
    {
      id: 'evt-14',
      type: 'outcome',
      sourceId: 'src-7',
      sourceType: 'markdown',
      title: 'Action: Implement Circuit Breaker Pattern',
      summary: 'Circuit breaker pattern to be implemented to prevent cascading failures in microservices.',
      content: 'Post-incident action: Implement circuit breaker pattern to prevent cascading failures. Add connection pool monitoring dashboard. Implement auto-scaling for database connections. Run load testing monthly.',
      author: 'Bob Martinez',
      timestamp: daysAgo(9),
      tags: ['outcome', 'circuit-breaker', 'resilience', 'monitoring'],
      entities: ['Bob Martinez', 'Payment Service'],
      importance: 8,
      createdAt: daysAgo(9),
    },
    {
      id: 'evt-15',
      type: 'discussion',
      sourceId: 'src-3',
      sourceType: 'chat_export',
      title: 'Discussion: Performance Benefits of Document Store',
      summary: 'Bob demonstrated 60% write throughput improvement with document-based storage for events.',
      content: 'Bob presented benchmarks showing 60% write throughput improvement when moving events table to document-based storage. This data supported the CQRS decision.',
      author: 'Bob Martinez',
      timestamp: daysAgo(59),
      tags: ['discussion', 'performance', 'database', 'benchmark'],
      entities: ['Bob Martinez', 'MongoDB', 'PostgreSQL'],
      importance: 6,
      createdAt: daysAgo(59),
    },
    {
      id: 'evt-16',
      type: 'decision',
      sourceId: 'src-5',
      sourceType: 'markdown',
      title: 'Decision: Move Secrets to Vault',
      summary: 'Security team decides to migrate all secrets from environment files to HashiCorp Vault.',
      content: 'Security audit identified database credentials in environment files as a high-severity issue. Decision made to migrate all secrets to HashiCorp Vault with automatic rotation.',
      author: 'Diana Park',
      timestamp: daysAgo(19),
      tags: ['decision', 'security', 'secrets', 'vault'],
      entities: ['Diana Park', 'HashiCorp Vault'],
      importance: 7,
      createdAt: daysAgo(19),
    },
    {
      id: 'evt-17',
      type: 'note',
      sourceId: 'src-1',
      sourceType: 'markdown',
      title: 'Note: Deployment Pipeline Optimization Needed',
      summary: 'Current 45-minute deployment pipeline identified as a bottleneck requiring optimization.',
      content: 'The current deployment pipeline takes 45 minutes, which is a significant bottleneck. Microservices architecture will enable faster, independent deployments for each service.',
      author: 'Alice Chen',
      timestamp: daysAgo(119),
      tags: ['note', 'deployment', 'pipeline', 'optimization'],
      entities: ['Alice Chen'],
      importance: 5,
      createdAt: daysAgo(119),
    },
    {
      id: 'evt-18',
      type: 'discussion',
      sourceId: 'src-1',
      sourceType: 'markdown',
      title: 'Discussion: Team Ownership Model',
      summary: 'Each microservice will have a dedicated team responsible for ownership and maintenance.',
      content: 'With the move to microservices, each service will have a dedicated team: Auth (Alice), Payment (Bob), Inventory (Charlie), Notification (Diana), Gateway (shared). This increases ownership and accountability.',
      author: 'Alice Chen',
      timestamp: daysAgo(117),
      tags: ['discussion', 'team', 'ownership', 'organization'],
      entities: ['Alice Chen', 'Bob Martinez', 'Charlie Wang', 'Diana Park', 'Auth Service', 'Payment Service'],
      importance: 6,
      createdAt: daysAgo(117),
    },
    {
      id: 'evt-19',
      type: 'risk',
      sourceId: 'src-1',
      sourceType: 'markdown',
      title: 'Risk: Increased Operational Complexity',
      summary: 'Microservices migration introduces operational complexity that could slow the team initially.',
      content: 'The shift from monolith to 5 microservices increases operational complexity. Need for service mesh, API gateway, distributed tracing, and container orchestration. Team training required.',
      author: 'Alice Chen',
      timestamp: daysAgo(116),
      tags: ['risk', 'complexity', 'microservices', 'operations'],
      entities: ['Alice Chen'],
      importance: 7,
      createdAt: daysAgo(116),
    },
    {
      id: 'evt-20',
      type: 'meeting',
      sourceId: 'src-6',
      sourceType: 'transcript',
      title: 'Meeting: Q4 Product Planning',
      summary: 'Q4 roadmap finalized with focus on reliability, observability, and completion of gRPC migration.',
      content: 'Q4 product planning session. Priorities ranked: 1. Performance & reliability, 2. Observability, 3. Documentation, 4. Multi-tenancy (deferred). gRPC migration must complete by end of Q4.',
      author: 'Alice Chen',
      timestamp: daysAgo(14),
      tags: ['meeting', 'planning', 'q4', 'roadmap'],
      entities: ['Alice Chen'],
      importance: 6,
      createdAt: daysAgo(14),
    },
    {
      id: 'evt-21',
      type: 'architecture',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Architecture: MemoryOS Platform Overview',
      summary: 'MemoryOS built with Next.js 16, React 19, TypeScript, and Tailwind CSS as a local-first AI organizational memory platform.',
      content: 'MemoryOS is a local-first AI organizational memory platform. The frontend uses Next.js 16 with React 19 and TypeScript. Styling uses Tailwind CSS with a dark theme. Data persistence uses better-sqlite3 locally with optional PostgreSQL. The AI layer uses Ollama for local LLM inference and text embeddings. Search combines keyword matching with vector similarity.',
      author: 'Development Team',
      timestamp: daysAgo(90),
      tags: ['architecture', 'nextjs', 'typescript', 'tailwind', 'memoryos'],
      entities: ['MemoryOS', 'Next.js', 'SQLite', 'Ollama'],
      importance: 9,
      createdAt: daysAgo(90),
    },
    {
      id: 'evt-22',
      type: 'decision',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Decision: Use ReactFlow for Knowledge Graph Visualization',
      summary: 'Chose @xyflow/react (ReactFlow) with dagre auto-layout for the knowledge graph entity-relationship visualization.',
      content: 'The team selected ReactFlow for the interactive knowledge graph visualization because of its support for directed graphs, minimap, zoom/pan controls, and dark mode. The dagre library provides automatic hierarchical layout so nodes are positioned cleanly without manual placement. Nodes are color-coded by entity type and edges show relationship labels.',
      author: 'Development Team',
      timestamp: daysAgo(85),
      tags: ['decision', 'knowledge-graph', 'reactflow', 'visualization', 'dagre'],
      entities: ['MemoryOS', 'Knowledge Graph', 'ReactFlow', 'dagre'],
      importance: 8,
      createdAt: daysAgo(85),
    },
    {
      id: 'evt-23',
      type: 'decision',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Decision: Use SQLite for Local-First Data Persistence',
      summary: 'Chose better-sqlite3 as the default storage backend for zero-setup local persistence.',
      content: 'SQLite via better-sqlite3 was chosen as the default storage backend because it requires no server setup, keeps data in a single file, and supports the full SQL feature set. The repository pattern allows swapping to PostgreSQL for production deployments. Tables include memory_events, entities, relations, sources, tags, query_logs, and conversation_messages.',
      author: 'Development Team',
      timestamp: daysAgo(88),
      tags: ['decision', 'database', 'sqlite', 'persistence', 'storage'],
      entities: ['MemoryOS', 'SQLite'],
      importance: 8,
      createdAt: daysAgo(88),
    },
    {
      id: 'evt-24',
      type: 'outcome',
      sourceId: 'src-9',
      sourceType: 'markdown',
      title: 'Feature: Knowledge Graph with Entity Relationship Visualization',
      summary: 'The Knowledge Graph page displays entities as color-coded nodes with directed relationship edges using ReactFlow and dagre.',
      content: 'The Knowledge Graph feature provides an interactive visualization of all entities and their relationships. It uses ReactFlow for the canvas with zoom, pan, minimap, and controls. dagre computes automatic node positions in a left-to-right hierarchical layout. Each node is color-coded by entity type (person, system, technology) and each edge shows the relationship type with an arrow. The page also lists all entities and relationships below the graph.',
      author: 'Development Team',
      timestamp: daysAgo(82),
      tags: ['feature', 'knowledge-graph', 'reactflow', 'visualization', 'entities'],
      entities: ['MemoryOS', 'Knowledge Graph', 'ReactFlow', 'dagre'],
      importance: 9,
      createdAt: daysAgo(82),
    },
    {
      id: 'evt-25',
      type: 'outcome',
      sourceId: 'src-10',
      sourceType: 'markdown',
      title: 'Feature: Insight Dashboard with Metrics and Analytics',
      summary: 'The Insight Dashboard shows aggregated metrics, event type distribution, top topics, high priority events, and event timeline chart.',
      content: 'The Insights Dashboard provides analytics across all memory events. It displays total counts for events, entities, relations, and sources. Event type distribution is shown as a color-coded bar chart. Top topics are ranked by tag frequency. High priority events (importance >= 8) are listed. Most connected entities are shown with their connection counts. A monthly event timeline chart visualizes activity over time.',
      author: 'Development Team',
      timestamp: daysAgo(78),
      tags: ['feature', 'insights', 'dashboard', 'analytics', 'metrics'],
      entities: ['MemoryOS', 'Insights Dashboard'],
      importance: 8,
      createdAt: daysAgo(78),
    },
    {
      id: 'evt-26',
      type: 'outcome',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Feature: Ask Memory Conversational RAG',
      summary: 'The Ask Memory feature provides conversational Q&A over organizational memory using hybrid search and optional LLM generation.',
      content: 'Ask Memory is a conversational RAG (Retrieval-Augmented Generation) feature. When a user asks a question, it searches memory events using hybrid keyword and vector search, retrieves the top relevant events, constructs them as context, and sends to Ollama (if available) for answer generation. Answers include cited source references with relevance scores and confidence levels. Follow-up suggestions are provided.',
      author: 'Development Team',
      timestamp: daysAgo(75),
      tags: ['feature', 'ask-memory', 'rag', 'search', 'ai', 'qa'],
      entities: ['MemoryOS', 'Ask Memory', 'Ollama', 'RAG Pipeline'],
      importance: 9,
      createdAt: daysAgo(75),
    },
    {
      id: 'evt-27',
      type: 'outcome',
      sourceId: 'src-10',
      sourceType: 'markdown',
      title: 'Feature: Timeline Replay with Type Filtering',
      summary: 'The Timeline page shows all memory events in chronological order with filtering by event type.',
      content: 'The Timeline Replay feature displays memory events sorted by date with expandable details. Users can filter by event type (decision, discussion, meeting, issue, risk, outcome, commit, note, architecture). Each event shows its title, type badge, author, date, and related entities.',
      author: 'Development Team',
      timestamp: daysAgo(72),
      tags: ['feature', 'timeline', 'replay', 'chronological', 'history'],
      entities: ['MemoryOS', 'Timeline Replay'],
      importance: 7,
      createdAt: daysAgo(72),
    },
    {
      id: 'evt-28',
      type: 'architecture',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Architecture: Hybrid Search Pipeline',
      summary: 'MemoryOS uses hybrid search combining keyword-based matching with vector similarity search for memory retrieval.',
      content: 'The search pipeline first runs keyword search across memory events by tokenizing the query and scoring matches in title, summary, content, tags, and entities. If keyword results are insufficient, vector search falls back to embedding similarity using Ollama nomic-embed-text or a deterministic hash-based embedding. Results are merged, deduplicated, and ranked by relevance score.',
      author: 'Development Team',
      timestamp: daysAgo(70),
      tags: ['architecture', 'search', 'hybrid', 'retrieval', 'embedding'],
      entities: ['MemoryOS', 'RAG Pipeline', 'Ollama'],
      importance: 8,
      createdAt: daysAgo(70),
    },
    {
      id: 'evt-29',
      type: 'architecture',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Architecture: Ingestion Pipeline for Multiple Formats',
      summary: 'The ingestion pipeline parses markdown, JSON, text, transcripts, chat exports, and commit logs into structured memory events.',
      content: 'The ingestion pipeline accepts markdown, JSON, plain text, meeting transcripts, chat exports, and commit logs. Documents are parsed into typed memory events with auto-extracted tags, entities, and importance scores. Each source can produce multiple events and is stored with metadata including author and timestamp.',
      author: 'Development Team',
      timestamp: daysAgo(68),
      tags: ['architecture', 'ingestion', 'parsing', 'pipeline'],
      entities: ['MemoryOS', 'Ingestion Pipeline'],
      importance: 7,
      createdAt: daysAgo(68),
    },
    {
      id: 'evt-30',
      type: 'decision',
      sourceId: 'src-8',
      sourceType: 'markdown',
      title: 'Decision: Use Ollama for Local AI Inference',
      summary: 'Chose Ollama for running LLMs and embedding models locally without external API dependencies.',
      content: 'Ollama was selected for local AI inference to keep all data processing private and offline-capable. It provides both text generation (using llama3.2:3b or similar models) and text embeddings (using nomic-embed-text). When Ollama is unavailable, the system falls back to deterministic mock answers for Q&A and hash-based simulated embeddings for vector search.',
      author: 'Development Team',
      timestamp: daysAgo(65),
      tags: ['decision', 'ollama', 'ai', 'llm', 'embeddings', 'privacy'],
      entities: ['MemoryOS', 'Ollama', 'RAG Pipeline'],
      importance: 9,
      createdAt: daysAgo(65),
    },
  ];
}

export function getDemoEntities(): Entity[] {
  return [
    { id: 'ent-1', name: 'Alice Chen', type: 'person', description: 'Lead Architect / Engineering Manager', createdAt: daysAgo(120) },
    { id: 'ent-2', name: 'Bob Martinez', type: 'person', description: 'Senior Backend Engineer', createdAt: daysAgo(120) },
    { id: 'ent-3', name: 'Charlie Wang', type: 'person', description: 'Full Stack Engineer', createdAt: daysAgo(120) },
    { id: 'ent-4', name: 'Diana Park', type: 'person', description: 'Security Engineer', createdAt: daysAgo(120) },
    { id: 'ent-5', name: 'Monolith', type: 'system', description: 'Legacy monolithic application', createdAt: daysAgo(120) },
    { id: 'ent-6', name: 'Auth Service', type: 'system', description: 'Authentication and authorization microservice', createdAt: daysAgo(118) },
    { id: 'ent-7', name: 'Payment Service', type: 'system', description: 'Payment processing microservice', createdAt: daysAgo(118) },
    { id: 'ent-8', name: 'API Gateway', type: 'system', description: 'Kong API Gateway for routing and rate limiting', createdAt: daysAgo(118) },
    { id: 'ent-9', name: 'PostgreSQL', type: 'technology', description: 'Primary relational database', createdAt: daysAgo(60) },
    { id: 'ent-10', name: 'MongoDB', type: 'technology', description: 'Document store for event storage', createdAt: daysAgo(60) },
    { id: 'ent-11', name: 'gRPC', type: 'technology', description: 'High-performance RPC framework', createdAt: daysAgo(45) },
    { id: 'ent-12', name: 'Database', type: 'system', description: 'General database infrastructure', createdAt: daysAgo(45) },
    { id: 'ent-13', name: 'JWT', type: 'technology', description: 'JSON Web Token authentication', createdAt: daysAgo(20) },
    { id: 'ent-14', name: 'HashiCorp Vault', type: 'technology', description: 'Secrets management system', createdAt: daysAgo(19) },
    { id: 'ent-15', name: 'Kong', type: 'technology', description: 'API Gateway platform', createdAt: daysAgo(118) },
    { id: 'ent-16', name: 'MemoryOS', type: 'system', description: 'AI organizational memory platform', createdAt: daysAgo(90) },
    { id: 'ent-17', name: 'Knowledge Graph', type: 'feature', description: 'Interactive entity-relationship visualization', createdAt: daysAgo(85) },
    { id: 'ent-18', name: 'Insights Dashboard', type: 'feature', description: 'Analytics dashboard with metrics and charts', createdAt: daysAgo(80) },
    { id: 'ent-19', name: 'Timeline Replay', type: 'feature', description: 'Chronological event history with type filtering', createdAt: daysAgo(75) },
    { id: 'ent-20', name: 'Ask Memory', type: 'feature', description: 'Conversational RAG Q&A over organizational memory', createdAt: daysAgo(75) },
    { id: 'ent-21', name: 'Ingestion Pipeline', type: 'system', description: 'Parses documents into structured memory events', createdAt: daysAgo(70) },
    { id: 'ent-22', name: 'RAG Pipeline', type: 'system', description: 'Retrieval-augmented generation for question answering', createdAt: daysAgo(75) },
    { id: 'ent-23', name: 'Next.js', type: 'technology', description: 'React framework for the frontend application', createdAt: daysAgo(90) },
    { id: 'ent-24', name: 'ReactFlow', type: 'technology', description: 'Interactive graph visualization library', createdAt: daysAgo(85) },
    { id: 'ent-25', name: 'dagre', type: 'technology', description: 'Directed graph layout engine for node positioning', createdAt: daysAgo(85) },
  ];
}

export function getDemoRelations(): Relation[] {
  return [
    { id: 'rel-1', sourceId: 'ent-1', targetId: 'ent-5', type: 'influences', description: 'Alice Chen proposed migrating away from monolith', weight: 9, createdAt: daysAgo(120) },
    { id: 'rel-2', sourceId: 'ent-6', targetId: 'ent-5', type: 'depends_on', description: 'Auth Service replaces monolith auth module', weight: 8, createdAt: daysAgo(118) },
    { id: 'rel-3', sourceId: 'ent-11', targetId: 'ent-8', type: 'depends_on', description: 'gRPC runs through API Gateway', weight: 7, createdAt: daysAgo(45) },
    { id: 'rel-4', sourceId: 'ent-10', targetId: 'ent-9', type: 'mentions', description: 'MongoDB complements PostgreSQL in CQRS pattern', weight: 6, createdAt: daysAgo(60) },
    { id: 'rel-5', sourceId: 'ent-7', targetId: 'ent-12', type: 'depends_on', description: 'Payment Service depends on database', weight: 9, createdAt: daysAgo(10) },
    { id: 'rel-6', sourceId: 'ent-13', targetId: 'ent-6', type: 'implements', description: 'JWT used for Auth Service authentication', weight: 8, createdAt: daysAgo(20) },
    { id: 'rel-7', sourceId: 'ent-14', targetId: 'ent-12', type: 'mentions', description: 'HashiCorp Vault stores database credentials', weight: 6, createdAt: daysAgo(19) },
    { id: 'rel-8', sourceId: 'ent-2', targetId: 'ent-12', type: 'influences', description: 'Bob Martinez leads database optimization', weight: 7, createdAt: daysAgo(45) },
    { id: 'rel-9', sourceId: 'ent-3', targetId: 'ent-11', type: 'implements', description: 'Charlie Wang implemented gRPC service mesh', weight: 7, createdAt: daysAgo(30) },
    { id: 'rel-10', sourceId: 'ent-4', targetId: 'ent-13', type: 'influences', description: 'Diana Park identified JWT vulnerability', weight: 8, createdAt: daysAgo(20) },
    { id: 'rel-11', sourceId: 'ent-8', targetId: 'ent-6', type: 'depends_on', description: 'API Gateway routes to Auth Service', weight: 7, createdAt: daysAgo(118) },
    { id: 'rel-12', sourceId: 'ent-8', targetId: 'ent-7', type: 'depends_on', description: 'API Gateway routes to Payment Service', weight: 7, createdAt: daysAgo(118) },
    { id: 'rel-13', sourceId: 'ent-9', targetId: 'ent-7', type: 'depends_on', description: 'PostgreSQL supports Payment Service', weight: 9, createdAt: daysAgo(60) },
    { id: 'rel-14', sourceId: 'ent-1', targetId: 'ent-2', type: 'mentions', description: 'Alice assigned database sprint to Bob', weight: 6, createdAt: daysAgo(45) },
    { id: 'rel-15', sourceId: 'ent-15', targetId: 'ent-8', type: 'implements', description: 'Kong powers the API Gateway', weight: 8, createdAt: daysAgo(118) },
    { id: 'rel-16', sourceId: 'ent-16', targetId: 'ent-17', type: 'implements', description: 'MemoryOS has a Knowledge Graph feature', weight: 9, createdAt: daysAgo(85) },
    { id: 'rel-17', sourceId: 'ent-16', targetId: 'ent-18', type: 'implements', description: 'MemoryOS has an Insights Dashboard', weight: 8, createdAt: daysAgo(80) },
    { id: 'rel-18', sourceId: 'ent-16', targetId: 'ent-19', type: 'implements', description: 'MemoryOS has a Timeline Replay feature', weight: 7, createdAt: daysAgo(75) },
    { id: 'rel-19', sourceId: 'ent-16', targetId: 'ent-20', type: 'implements', description: 'MemoryOS has an Ask Memory feature', weight: 9, createdAt: daysAgo(75) },
    { id: 'rel-20', sourceId: 'ent-16', targetId: 'ent-21', type: 'implements', description: 'MemoryOS has an Ingestion Pipeline', weight: 8, createdAt: daysAgo(70) },
    { id: 'rel-21', sourceId: 'ent-17', targetId: 'ent-24', type: 'depends_on', description: 'Knowledge Graph uses ReactFlow for rendering', weight: 9, createdAt: daysAgo(85) },
    { id: 'rel-22', sourceId: 'ent-17', targetId: 'ent-25', type: 'depends_on', description: 'Knowledge Graph uses dagre for layout', weight: 8, createdAt: daysAgo(85) },
    { id: 'rel-23', sourceId: 'ent-20', targetId: 'ent-22', type: 'depends_on', description: 'Ask Memory uses the RAG Pipeline', weight: 9, createdAt: daysAgo(75) },
    { id: 'rel-24', sourceId: 'ent-16', targetId: 'ent-23', type: 'depends_on', description: 'MemoryOS is built on Next.js', weight: 9, createdAt: daysAgo(90) },
    { id: 'rel-25', sourceId: 'ent-16', targetId: 'ent-8', type: 'influences', description: 'MemoryOS exposes an API', weight: 6, createdAt: daysAgo(88) },
  ];
}

export function getDemoTags(): Tag[] {
  return [
    { id: 'architecture', name: 'architecture', count: 4 },
    { id: 'decision', name: 'decision', count: 5 },
    { id: 'database', name: 'database', count: 6 },
    { id: 'security', name: 'security', count: 4 },
    { id: 'grpc', name: 'grpc', count: 3 },
    { id: 'performance', name: 'performance', count: 4 },
    { id: 'microservices', name: 'microservices', count: 3 },
    { id: 'planning', name: 'planning', count: 3 },
    { id: 'incident', name: 'incident', count: 1 },
    { id: 'risk', name: 'risk', count: 2 },
    { id: 'meeting', name: 'meeting', count: 3 },
    { id: 'discussion', name: 'discussion', count: 3 },
    { id: 'cqrs', name: 'cqrs', count: 1 },
    { id: 'commit', name: 'commit', count: 2 },
    { id: 'outcome', name: 'outcome', count: 2 },
    { id: 'note', name: 'note', count: 1 },
    { id: 'memoryos', name: 'memoryos', count: 10 },
    { id: 'knowledge-graph', name: 'knowledge-graph', count: 3 },
    { id: 'reactflow', name: 'reactflow', count: 3 },
    { id: 'rag', name: 'rag', count: 2 },
    { id: 'ollama', name: 'ollama', count: 3 },
    { id: 'feature', name: 'feature', count: 4 },
    { id: 'analytics', name: 'analytics', count: 1 },
    { id: 'ingestion', name: 'ingestion', count: 2 },
    { id: 'visualization', name: 'visualization', count: 2 },
    { id: 'ai', name: 'ai', count: 2 },
  ];
}

import { IMemoryRepository } from './interfaces';

export async function seedStore(memoryRepo: IMemoryRepository): Promise<void> {
  const sources = getDemoSources();
  const events = getDemoMemoryEvents();
  const entities = getDemoEntities();
  const relations = getDemoRelations();

  for (const s of sources) await memoryRepo.addSource(s);
  for (const e of events) {
    await memoryRepo.addMemoryEvent(e);
    for (const t of e.tags) await memoryRepo.incrementTag(t);
  }
  for (const e of entities) await memoryRepo.addEntity(e);
  for (const r of relations) await memoryRepo.addRelation(r);
}
