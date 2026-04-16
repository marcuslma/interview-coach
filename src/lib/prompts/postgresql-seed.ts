import type { PracticePrompt } from "./types";

export const POSTGRESQL_PROMPTS: PracticePrompt[] = [
  {
    category: "postgresql",
    id: "pg-mvcc-isolation",
    title: "MVCC & isolation levels",
    summary: "Read Committed vs Repeatable Read vs Serializable—what anomalies appear.",
    tags: ["mvcc", "isolation"],
    primaryLanguage: "sql",
    candidateBrief:
      "Explain phantom reads vs non-repeatable reads; when Serializable is worth the cost.",
    evaluatorNotes:
      "Optional: mention snapshot isolation behavior. Tiny SQL examples, not full benchmarks.",
  },
  {
    category: "postgresql",
    id: "pg-indexes",
    title: "Indexes & access paths",
    summary: "B-tree defaults, partial indexes, when GiST/GiN matter at a high level.",
    tags: ["indexes", "planning"],
    primaryLanguage: "sql",
    candidateBrief:
      "Choose index strategies for filter + order by; trade-offs of wide composite indexes.",
    evaluatorNotes:
      "Ask what EXPLAIN would show conceptually. Keep Postgres-specific features proportional to depth.",
  },
  {
    category: "postgresql",
    id: "pg-explain",
    title: "EXPLAIN & query tuning",
    summary: "Seq scan vs index scan, nested loops vs hash joins—reading a plan.",
    tags: ["explain", "performance"],
    primaryLanguage: "sql",
    candidateBrief:
      "Walk through a simplified plan; what 'cost' and 'rows' estimates mean in an interview.",
    evaluatorNotes:
      "No need for perfect cardinality math—focus on mental model and next debugging step.",
  },
  {
    category: "postgresql",
    id: "pg-locks",
    title: "Locks & deadlocks",
    summary: "Row-level locks, lock modes intuition, avoiding common deadlock patterns.",
    tags: ["locks", "concurrency"],
    primaryLanguage: "sql",
    candidateBrief:
      "Two transactions updating overlapping rows—how deadlocks arise and how to mitigate.",
    evaluatorNotes:
      "Mention SELECT FOR UPDATE when appropriate. Advisory locks only if candidate brings them up.",
  },
  {
    category: "postgresql",
    id: "pg-partitioning",
    title: "Partitioning",
    summary: "Declarative partitioning goals, partition pruning, time-series style use cases.",
    tags: ["partitioning", "scale"],
    primaryLanguage: "sql",
    candidateBrief:
      "When partitioning helps ops and query performance vs adds operational burden.",
    evaluatorNotes:
      "Range vs list vs hash at conceptual level. Constraint exclusion idea optional.",
  },
  {
    category: "postgresql",
    id: "pg-jsonb",
    title: "JSON/JSONB vs relational",
    summary: "Indexing jsonb, containment queries, when to normalize instead.",
    tags: ["jsonb", "modeling"],
    primaryLanguage: "sql",
    candidateBrief:
      "Trade-offs of flexible schema in-column vs traditional tables; GIN index intuition.",
    evaluatorNotes:
      "Probe migration path from JSON blob to relational columns.",
  },
];
