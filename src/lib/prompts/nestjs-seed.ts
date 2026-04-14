import type { PracticePrompt } from "./types";

export const NESTJS_PROMPTS: PracticePrompt[] = [
  {
    category: "nestjs",
    id: "nest-di-providers",
    title: "Dependency injection & providers",
    summary: "Injectable, scopes, custom providers, circular deps.",
    tags: ["di", "providers"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How Nest resolves dependencies, singleton vs request scope, useFactory/useClass patterns.",
    evaluatorNotes:
      "Ask to sketch a module with a service and a repository abstraction. Discuss scope pitfalls.",
  },
  {
    category: "nestjs",
    id: "nest-modules-imports",
    title: "Modules & imports/exports",
    summary: "Feature modules, global modules, dynamic modules.",
    tags: ["modules", "architecture"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Structure a medium app: which module exports what, avoiding tight coupling.",
    evaluatorNotes:
      "Ask where to put shared guards or filters. Mention DynamicModule at high level.",
  },
  {
    category: "nestjs",
    id: "nest-pipes-guards",
    title: "Pipes, guards, interceptors, filters",
    summary: "Request lifecycle, validation, auth, exception mapping.",
    tags: ["lifecycle", "http"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Order of execution for guards vs pipes vs interceptors; ValidationPipe behavior.",
    evaluatorNotes:
      "Trace a single HTTP request through decorators. Ask when to use guard vs middleware.",
  },
  {
    category: "nestjs",
    id: "nest-rest-openapi-lite",
    title: "Controllers & DTOs",
    summary: "Routing, status codes, serialization, validation.",
    tags: ["rest", "dto"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design REST endpoints with proper HTTP semantics and DTO validation.",
    evaluatorNotes:
      "Use class-validator style conceptually. Ask about PATCH vs PUT and idempotency briefly.",
  },
  {
    category: "nestjs",
    id: "nest-microservices-lite",
    title: "Microservices transport (lite)",
    summary: "When to use Redis/NATS/RabbitMQ transport vs HTTP.",
    tags: ["microservices", "messaging"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Trade-offs between sync HTTP and message-based communication in Nest.",
    evaluatorNotes:
      "No deep config—patterns: request/reply, events, idempotency.",
  },
];
