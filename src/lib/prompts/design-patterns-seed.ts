import type { PracticePrompt } from "./types";

export const DESIGN_PATTERNS_PROMPTS: PracticePrompt[] = [
  {
    category: "design_patterns",
    id: "pat-singleton",
    title: "Singleton",
    summary: "Global state, testability, dependency injection alternatives.",
    tags: ["creational", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When is Singleton appropriate in TS/Node? When is it an anti-pattern?",
    evaluatorNotes:
      "Discuss module singletons, concurrency, testing with reset, prefer explicit DI.",
  },
  {
    category: "design_patterns",
    id: "pat-factory-simple",
    title: "Factory Method & Simple Factory",
    summary: "Creation polymorphism, hiding constructors.",
    tags: ["creational", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Contrast Factory Method with direct `new`; give a TypeScript sketch.",
    evaluatorNotes:
      "Ask when factory returns interface type vs concrete.",
  },
  {
    category: "design_patterns",
    id: "pat-abstract-factory",
    title: "Abstract Factory",
    summary: "Families of related objects; UI themes, driver stacks.",
    tags: ["creational", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "What problem does Abstract Factory solve vs Factory Method?",
    evaluatorNotes:
      "Probe combinatorial explosion if misused.",
  },
  {
    category: "design_patterns",
    id: "pat-builder",
    title: "Builder",
    summary: "Stepwise construction, fluent APIs, optional fields.",
    tags: ["creational", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When do you reach for Builder instead of a long constructor or object literal?",
    evaluatorNotes:
      "Discuss telescoping constructors; immutable result.",
  },
  {
    category: "design_patterns",
    id: "pat-prototype",
    title: "Prototype",
    summary: "Cloning, copy vs deep copy, structuredClone caveats.",
    tags: ["creational", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How would you clone complex objects in TypeScript safely?",
    evaluatorNotes:
      "References, class instances, performance of clone.",
  },
  {
    category: "design_patterns",
    id: "pat-adapter",
    title: "Adapter",
    summary: "Wrapping incompatible interfaces; ports to legacy.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Adapter vs Decorator vs Facade—one sentence each and when you pick Adapter.",
    evaluatorNotes:
      "Mention wrapping third-party SDKs.",
  },
  {
    category: "design_patterns",
    id: "pat-decorator",
    title: "Decorator",
    summary: "Composable behavior, middleware stacks, class vs function decorators.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Implement or describe stacking behaviors (e.g. HTTP pipeline) with Decorator.",
    evaluatorNotes:
      "TS experimental decorators vs composition of plain objects.",
  },
  {
    category: "design_patterns",
    id: "pat-facade",
    title: "Facade",
    summary: "Simplified API over a subsystem; reducing coupling for callers.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When does a Facade become a god object? How do you keep it thin?",
    evaluatorNotes:
      "Contrast with Adapter (intent: simplify vs match interface).",
  },
  {
    category: "design_patterns",
    id: "pat-proxy",
    title: "Proxy",
    summary: "Lazy loading, caching, access control, virtual proxy.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain Proxy; give a use case different from Decorator.",
    evaluatorNotes:
      "JS Proxy traps; network clients with retries.",
  },
  {
    category: "design_patterns",
    id: "pat-composite",
    title: "Composite",
    summary: "Tree structures, uniform treatment of part/whole.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Where does Composite appear in UIs or document models?",
    evaluatorNotes:
      "Ask for component interface with leaf vs composite.",
  },
  {
    category: "design_patterns",
    id: "pat-bridge",
    title: "Bridge",
    summary: "Separate abstraction from implementation; two hierarchies.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Bridge vs Adapter—orthogonal dimensions of variation.",
    evaluatorNotes:
      "Example: rendering API vs OS graphics backend.",
  },
  {
    category: "design_patterns",
    id: "pat-flyweight",
    title: "Flyweight",
    summary: "Intrinsic vs extrinsic state; pooling; memory at scale.",
    tags: ["structural", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When is Flyweight worth the complexity?",
    evaluatorNotes:
      "String interning, game tiles, shared icon glyphs.",
  },
  {
    category: "design_patterns",
    id: "pat-strategy",
    title: "Strategy",
    summary: "Pluggable algorithms, open/closed at behavior level.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Replace a switch on type with Strategy; show typings for context + strategy.",
    evaluatorNotes:
      "Relation to functional passing of lambdas.",
  },
  {
    category: "design_patterns",
    id: "pat-template-method",
    title: "Template Method",
    summary: "Skeleton algorithm, hooks, inheritance vs composition.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Template Method vs Strategy for varying behavior—trade-offs.",
    evaluatorNotes:
      "Fragile base class problem.",
  },
  {
    category: "design_patterns",
    id: "pat-command",
    title: "Command",
    summary: "Encapsulate requests, undo/redo, job queues.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Model a user action as a Command object; where does undo live?",
    evaluatorNotes:
      "CQRS command side naming collision—disambiguate.",
  },
  {
    category: "design_patterns",
    id: "pat-observer",
    title: "Observer / Pub-Sub",
    summary: "Push vs pull; memory leaks; EventEmitter patterns.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Implement Observer in TS; discuss unsubscription and error in handlers.",
    evaluatorNotes:
      "RxJS as scaled observer—only if candidate knows it.",
  },
  {
    category: "design_patterns",
    id: "pat-chain-of-responsibility",
    title: "Chain of Responsibility",
    summary: "Middleware pipelines, filters, handler chains.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Model Express-style middleware as a chain; who stops the chain?",
    evaluatorNotes:
      "Contrast with Decorator stacking.",
  },
  {
    category: "design_patterns",
    id: "pat-state",
    title: "State",
    summary: "State machine vs giant switch; transitions.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "State pattern vs table-driven FSM; when each wins.",
    evaluatorNotes:
      "Order workflow, connection lifecycle.",
  },
  {
    category: "design_patterns",
    id: "pat-mediator",
    title: "Mediator",
    summary: "Central hub vs many-to-many coupling.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How does Mediator reduce coupling in a dialog with many controls?",
    evaluatorNotes:
      "Contrast with Observer broadcast.",
  },
  {
    category: "design_patterns",
    id: "pat-memento",
    title: "Memento",
    summary: "Snapshots for undo; encapsulation of state.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design memento without exposing private fields.",
    evaluatorNotes:
      "Caretaker vs originator responsibilities.",
  },
  {
    category: "design_patterns",
    id: "pat-visitor",
    title: "Visitor",
    summary: "Double dispatch, adding operations to stable hierarchies.",
    tags: ["behavioral", "gof"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When is Visitor worth it vs pattern matching / sum types?",
    evaluatorNotes:
      "Open/closed on operations; closed on types.",
  },
  {
    category: "design_patterns",
    id: "pat-repository-uow",
    title: "Repository & Unit of Work",
    summary: "Persistence abstraction, transaction boundaries.",
    tags: ["enterprise", "ddd"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Define Repository and UoW; where does transaction commit happen?",
    evaluatorNotes:
      "Anemic domain vs rich—brief; focus on boundaries.",
  },
  {
    category: "design_patterns",
    id: "pat-specification",
    title: "Specification pattern",
    summary: "Composable business rules, reusable predicates.",
    tags: ["ddd", "rules"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Encode a business rule that can be combined (AND/OR) for queries and in-memory checks.",
    evaluatorNotes:
      "Overlap with CQRS query filters.",
  },
  {
    category: "design_patterns",
    id: "pat-object-pool",
    title: "Object pool",
    summary: "Reuse expensive objects; connection pools; lifecycle.",
    tags: ["performance", "creational"],
    primaryLanguage: "typescript",
    candidateBrief:
      "When does pooling beat allocate-on-demand? Risks?",
    evaluatorNotes:
      "Stale state, sizing, monitoring pool exhaustion.",
  },
  {
    category: "design_patterns",
    id: "pat-null-object",
    title: "Null Object",
    summary: "Replace null checks with no-op behavior.",
    tags: ["behavioral", "defensive"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Null Object vs optional chaining vs Maybe—when to use each?",
    evaluatorNotes:
      "Hidden failures if no-op swallows errors.",
  },
  {
    category: "design_patterns",
    id: "pat-dependency-injection",
    title: "DI patterns (constructor vs setter vs interface)",
    summary: "Wiring styles; testability; service locator smell.",
    tags: ["di", "testing"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Compare constructor injection to a service locator; why is SL often discouraged?",
    evaluatorNotes:
      "Framework DI vs manual factories.",
  },
];
