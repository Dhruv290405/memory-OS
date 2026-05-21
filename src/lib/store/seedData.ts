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
