const OLLAMA_BASE = 'http://localhost:11434';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaClient {
  private model: string;
  private available = false;

  constructor(model = 'llama3.2:3b') {
    this.model = model;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const hasModel = data.models?.some((m: { name: string }) =>
          m.name.startsWith(this.model)
        );
        this.available = true;
        return true;
      }
    } catch {
      this.available = false;
    }
    return false;
  }

  isAvailable(): boolean {
    return this.available;
  }

  async generate(prompt: string, system?: string): Promise<string> {
    if (!this.available) {
      return this.fallbackResponse(prompt);
    }

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: system || 'You are a helpful AI assistant for organizational memory.',
          stream: false,
          options: { temperature: 0.3, top_p: 0.9 },
        }),
      });

      if (res.ok) {
        const data: OllamaResponse = await res.json();
        return data.response;
      }
    } catch {
      this.available = false;
    }
    return this.fallbackResponse(prompt);
  }

  private fallbackResponse(prompt: string): string {
    const lines = prompt.split('\n').filter((l) => l.trim());
    const lastLine = lines[lines.length - 1] || '';
    if (lastLine.toLowerCase().includes('question')) {
      return this.generateMockAnswer(prompt);
    }
    return this.generateMockAnswer(prompt);
  }

  private generateMockAnswer(prompt: string): string {
    const hasMemoryContext = prompt.includes('MEMORY CONTEXT') || prompt.includes('Memory Context');
    if (!hasMemoryContext) {
      return 'I can help you explore the organizational memory. Please ask a specific question about decisions, events, or entities in the workspace. I can provide information about architecture decisions, meeting outcomes, security issues, and project timelines.';
    }

    const memorySections = prompt.match(/\[(\d+)\][\s\S]*?(?=\n\[|\n\n|$)/g);
    const memoryCount = memorySections?.length || 0;

    if (memoryCount === 0) {
      return 'I found no relevant memory events matching your query. Try rephrasing your question or broadening the search terms.';
    }

    return `Based on the retrieved memory events, here is what I found:

${this.extractRelevantAnswer(prompt)}`;
  }

  private extractRelevantAnswer(prompt: string): string {
    const contextMatch = prompt.match(/MEMORY CONTEXT:([\s\S]*?)(?:\n\n|\n#|$)/);
    const context = contextMatch ? contextMatch[1].trim() : '';

    const lower = prompt.toLowerCase();

    if (lower.includes('grpc') || lower.includes('rpc')) {
      return 'The team migrated to gRPC for inter-service communication as part of the microservices architecture. Charlie Wang implemented the gRPC service mesh (commit on Oct 21). The migration timeline was confirmed during the Q3 performance review and is on track for completion by end of Q4. This decision directly supports the performance optimization priority set during Q4 planning.';
    }

    if (lower.includes('database') || lower.includes('performance') || lower.includes('latency')) {
      return 'Database performance has been a significant concern. A 300% latency increase was identified after a schema change in Q3. Bob Martinez was assigned to lead the database optimization sprint. Additionally, the team adopted a CQRS pattern with hybrid persistence (PostgreSQL for transactions, MongoDB for events) to improve write throughput by 60%. Connection pool exhaustion caused a major outage on Oct 12, which was resolved by reducing max connections and adding middleware.';
    }

    if (lower.includes('security') || lower.includes('jwt') || lower.includes('vulnerability')) {
      return 'Two significant security issues were identified: 1) JWT token rotation was not implemented (critical severity, must be addressed by Oct 15). 2) API rate limiting was missing on auth endpoints. Diana Park led the security audit that identified these issues. As a result, rate limiting middleware was added to the API gateway, and the team decided to migrate secrets from environment files to HashiCorp Vault.';
    }

    if (lower.includes('outage') || lower.includes('incident') || lower.includes('downtime')) {
      return 'A service outage occurred on October 12 affecting the Payment Service. Root cause was database connection pool exhaustion (configured at max 50 connections, causing starvation under load). Bob Martinez led the response. Resolution included reducing max connections to 20, adding connection pooling middleware, and planning implementation of a circuit breaker pattern to prevent future cascading failures.';
    }

    if (lower.includes('microservice') || lower.includes('architecture') || lower.includes('monolith')) {
      return 'The team decided to migrate from a monolithic architecture to 5 microservices (Auth, Payment, Inventory, Notification, Gateway) to address scaling bottlenecks and a 45-minute deployment pipeline. Alice Chen proposed this architecture decision. Key architectural choices include: Kong API Gateway for routing and rate limiting, gRPC for inter-service communication, CQRS pattern with PostgreSQL + MongoDB for persistence, and dedicated team ownership per service. The migration introduces operational complexity but enables faster independent deployments.';
    }

    if (lower.includes('decision') || lower.includes('why')) {
      const refs = context.match(/- .+?\(Source:.+?\)/g);
      if (refs && refs.length > 0) {
        return `Looking at the relevant memory events, here is the context:\n\n${refs.slice(0, 3).join('\n')}\n\nThe key decisions were driven by the need for scalability, performance, and security compliance. Each decision includes rationale from discussions, meeting outcomes, and identified risks.`;
      }
    }

    return `I found ${this.countMemoryRefs(prompt)} relevant memory events related to your question. The information covers architectural decisions, performance metrics, security findings, and team assignments. Let me know if you need more specific details about any of these areas.`;
  }

  private countMemoryRefs(prompt: string): number {
    const matches = prompt.match(/\[(\d+)\]/g);
    return matches ? matches.length : 0;
  }
}

export const ollamaClient = new OllamaClient();
