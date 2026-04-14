import type { PracticePrompt } from "./types";

export const SOFTWARE_ARCHITECTURE_PROMPTS: PracticePrompt[] = [
  {
    category: "software_architecture",
    id: "arch-solid-overview",
    title: "SOLID — overview & when it breaks",
    summary: "Five principles as a set; coupling vs cohesion; pragmatic limits.",
    tags: ["solid", "principles"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain each SOLID letter at interview depth: what problem it solves and a symptom when you ignore it.",
    evaluatorNotes:
      "Probe trade-offs: over-abstraction, YAGNI, performance vs DIP. Ask for a real refactor story.",
  },
  {
    category: "software_architecture",
    id: "arch-srp",
    title: "Single Responsibility Principle",
    summary: "Reasons to change, slice boundaries, fat classes vs split.",
    tags: ["solid", "srp"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Define SRP; how you decide if a class/module has one reason to change.",
    evaluatorNotes:
      "Use a concrete example (e.g. report + email + DB in one class). Ask how you’d split without shotgun surgery.",
  },
  {
    category: "software_architecture",
    id: "arch-ocp",
    title: "Open/Closed Principle",
    summary: "Extension without modification; strategy vs inheritance.",
    tags: ["solid", "ocp"],
    primaryLanguage: "typescript",
    candidateBrief:
      "What does “open for extension, closed for modification” mean in shipping code?",
    evaluatorNotes:
      "Contrast plugin interfaces vs endless if/switch. Ask when OCP is overkill.",
  },
  {
    category: "software_architecture",
    id: "arch-lsp",
    title: "Liskov Substitution Principle",
    summary: "Subtyping contracts, pre/postconditions, squares & rectangles.",
    tags: ["solid", "lsp"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When can you substitute a subtype without breaking callers? Give a subtle violation.",
    evaluatorNotes:
      "Discuss throwing new exceptions in overrides, stricter preconditions, read-only collections.",
  },
  {
    category: "software_architecture",
    id: "arch-isp",
    title: "Interface Segregation Principle",
    summary: "Fat interfaces, role interfaces, client-specific APIs.",
    tags: ["solid", "isp"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Why force clients to depend on methods they don’t use? How do you split interfaces?",
    evaluatorNotes:
      "Mention TypeScript structural typing; optional vs split interfaces.",
  },
  {
    category: "software_architecture",
    id: "arch-dip",
    title: "Dependency Inversion Principle",
    summary: "Abstractions, ownership of interfaces, DI containers.",
    tags: ["solid", "dip"],
    primaryLanguage: "typescript",
    candidateBrief:
      "High-level modules should not depend on low-level details—how do you wire that in practice?",
    evaluatorNotes:
      "Ask for ports/adapters preview; test doubles; who owns the interface?",
  },
  {
    category: "software_architecture",
    id: "arch-clean-architecture",
    title: "Clean Architecture (Uncle Bob)",
    summary: "Entities, use cases, interface adapters, frameworks; dependency rule.",
    tags: ["clean-architecture", "layers"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Walk through the circles: what belongs in each layer and which way dependencies point.",
    evaluatorNotes:
      "Probe use case orchestration vs framework code; where HTTP/DB live.",
  },
  {
    category: "software_architecture",
    id: "arch-hexagonal-ports",
    title: "Hexagonal / ports & adapters",
    summary: "Driving vs driven ports, primary/secondary adapters, testability.",
    tags: ["hexagonal", "ports"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain ports and adapters with one inbound (HTTP) and one outbound (DB) example.",
    evaluatorNotes:
      "Ask how this differs from Clean Architecture naming; same idea, different diagram.",
  },
  {
    category: "software_architecture",
    id: "arch-onion",
    title: "Onion architecture",
    summary: "Core domain inward; infrastructure on the rim.",
    tags: ["onion", "layers"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How does the onion model relate to hexagonal and clean? Where is application service logic?",
    evaluatorNotes:
      "Discuss inversion of control through interfaces toward the center.",
  },
  {
    category: "software_architecture",
    id: "arch-ddd-tactical",
    title: "DDD tactical patterns (lite)",
    summary: "Entities, value objects, aggregates, domain events, repositories.",
    tags: ["ddd", "domain"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Define aggregate boundaries and why they matter for consistency and transactions.",
    evaluatorNotes:
      "Avoid full DDD book—interview depth: invariants, eventual consistency at edges.",
  },
  {
    category: "software_architecture",
    id: "arch-bounded-contexts",
    title: "Bounded contexts & integration",
    summary: "Context maps, shared kernel, customer/supplier, ACL.",
    tags: ["ddd", "integration"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When do you split bounded contexts vs share a model? Name integration patterns.",
    evaluatorNotes:
      "Probe anti-corruption layer vs conformist; translation at boundaries.",
  },
  {
    category: "software_architecture",
    id: "arch-cqrs-lite",
    title: "CQRS (conceptual)",
    summary: "Read vs write models, when it pays off, pitfalls.",
    tags: ["cqrs", "read-models"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain CQRS; give a case where it helps and one where it’s overkill.",
    evaluatorNotes:
      "Eventual consistency on reads, duplication, operational complexity.",
  },
  {
    category: "software_architecture",
    id: "arch-package-structure",
    title: "Package & module structure",
    summary: "By feature vs by layer; public API of a package; cycles.",
    tags: ["modules", "coupling"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How do you organize folders in a medium service to avoid dependency cycles?",
    evaluatorNotes:
      "Mention eslint import boundaries, barrel files trade-offs.",
  },
  {
    category: "software_architecture",
    id: "arch-modulith",
    title: "Monolith vs modular monolith vs microservices",
    summary: "Boundaries, deployment, data ownership, team topology.",
    tags: ["microservices", "monolith"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Criteria to split a service out; failure modes of premature microservices.",
    evaluatorNotes:
      "Ask about distributed transactions, sagas at high level only if candidate brings it.",
  },
  {
    category: "software_architecture",
    id: "arch-anti-corruption",
    title: "Anti-corruption layer",
    summary: "Wrapping legacy or external models; translation cost.",
    tags: ["integration", "legacy"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design an ACL between your domain and a messy third-party API.",
    evaluatorNotes:
      "Contrast with naive DTO mapping everywhere; where ACL sits in layers.",
  },
  {
    category: "software_architecture",
    id: "arch-evolution",
    title: "Evolving architecture",
    summary: "Strangler fig, feature flags, incremental extraction.",
    tags: ["migration", "refactoring"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How would you peel a legacy module into a new boundary without a big bang?",
    evaluatorNotes:
      "Dual writes, shadow reads, rollback strategy—conceptual.",
  },
  {
    category: "software_architecture",
    id: "arch-testability-layers",
    title: "Testability & architecture",
    summary: "What to mock; fast tests for domain; contract tests for adapters.",
    tags: ["testing", "ports"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How does your layering strategy change what you unit test vs integration test?",
    evaluatorNotes:
      "Hexagonal: domain without DB; adapter contract tests.",
  },
  {
    category: "software_architecture",
    id: "arch-cross-cutting",
    title: "Cross-cutting concerns",
    summary: "Logging, auth, metrics, correlation IDs across layers.",
    tags: ["observability", "aop"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Where do logging and auth fit without polluting domain logic?",
    evaluatorNotes:
      "Decorators, middleware, aspect-like patterns; avoid domain knowing HTTP headers.",
  },
];
