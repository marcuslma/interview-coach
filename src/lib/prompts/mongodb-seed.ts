import type { PracticePrompt } from "./types";

export const MONGODB_PROMPTS: PracticePrompt[] = [
  {
    category: "mongodb",
    id: "mongo-indexes-queries",
    title: "Indexes & query patterns",
    summary: "Single/compound indexes, covered queries, equality vs range order.",
    tags: ["indexes", "performance"],
    primaryLanguage: "javascript",
    candidateBrief:
      "When compound indexes help; ESR rule at interview depth; trade-offs of too many indexes.",
    evaluatorNotes:
      "Ask for a minimal find() + sort() scenario and which index supports it. Mention collation briefly if relevant.",
  },
  {
    category: "mongodb",
    id: "mongo-aggregation",
    title: "Aggregation pipeline",
    summary: "$match, $group, $lookup, $facet—shape and performance intuition.",
    tags: ["aggregation", "pipeline"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Build mental models for pipeline stages; when $lookup is worth the cost.",
    evaluatorNotes:
      "Small pipeline sketch in mongo shell style. Ask about allowDiskUse and memory limits at high level.",
  },
  {
    category: "mongodb",
    id: "mongo-replication",
    title: "Replica sets & reads",
    summary: "Elections, primary/secondary roles, read concern and read preference.",
    tags: ["replication", "ha"],
    primaryLanguage: "javascript",
    candidateBrief:
      "What happens on primary failure; when stale reads are acceptable vs not.",
    evaluatorNotes:
      "Avoid vendor version matrix; focus on concepts. Mention rollback window only if candidate goes deep.",
  },
  {
    category: "mongodb",
    id: "mongo-sharding",
    title: "Sharding basics",
    summary: "Shard key choice, chunks, balancer, when sharding is (not) the answer.",
    tags: ["sharding", "scale"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Hot shard vs even distribution; monotonically increasing shard key pitfalls.",
    evaluatorNotes:
      "Keep at architecture level—no need for full config scripts.",
  },
  {
    category: "mongodb",
    id: "mongo-schema-design",
    title: "Document modeling",
    summary: "Embedding vs referencing, document growth, atomicity boundaries.",
    tags: ["schema", "modeling"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Model a small domain (e.g. users + orders + comments) and justify trade-offs.",
    evaluatorNotes:
      "Probe normalization vs duplication; when subdocuments explode in size.",
  },
  {
    category: "mongodb",
    id: "mongo-transactions",
    title: "Transactions & consistency",
    summary: "Multi-document ACID (where supported), causal consistency intuition.",
    tags: ["transactions", "consistency"],
    primaryLanguage: "javascript",
    candidateBrief:
      "When to reach for multi-document transactions vs redesign; performance implications.",
    evaluatorNotes:
      "Contrast with typical single-document atomic updates. Stay practical, not whitepaper depth.",
  },
];
