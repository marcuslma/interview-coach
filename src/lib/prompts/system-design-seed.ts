import type { PracticePrompt } from "./types";

export const SYSTEM_DESIGN_PROMPTS: PracticePrompt[] = [
  {
    category: "system_design",
    id: "news-feed",
    title: "Distributed news feed",
    summary: "Build a scalable feed for a social network (home timeline).",
    tags: ["feed", "fanout", "cache"],
    candidateBrief:
      "Design the core systems behind a social network home feed (posts from followed accounts). Consider read/write patterns, ranking, and hot users.",
    evaluatorNotes:
      "Probe fan-out on write vs read, hybrid approaches, ranking/caching, hot keys, idempotency for posts, and failure modes. Expect rough QPS/DAU estimates.",
  },
  {
    category: "system_design",
    id: "chat-messaging",
    title: "Realtime chat service",
    summary: "1:1 and small group chat with delivery semantics.",
    tags: ["websocket", "ordering", "storage"],
    candidateBrief:
      "Design a messaging system supporting online presence, message history, and delivery expectations (at-least-once vs exactly-once in practice).",
    evaluatorNotes:
      "Discuss WebSocket gateways, presence, message ordering per conversation, receipts, pagination, storage schema, push notifications, and multi-region considerations.",
  },
  {
    category: "system_design",
    id: "url-shortener",
    title: "URL shortener",
    summary: "Create short links, redirect fast, prevent abuse.",
    tags: ["kv", "routing", "scale"],
    candidateBrief:
      "Design a URL shortening service like bit.ly: create short URLs, redirect quickly, and handle analytics optionally.",
    evaluatorNotes:
      "ID generation (base62), collision handling, 302 vs 301, read-heavy workload, caching, rate limiting, abuse prevention, and analytics pipeline trade-offs.",
  },
  {
    category: "system_design",
    id: "rate-limiter",
    title: "Distributed rate limiter",
    summary: "Enforce per-user/API-key limits across many servers.",
    tags: ["redis", "consistency", "algorithms"],
    candidateBrief:
      "Design a rate limiting service usable by many API gateways with fair enforcement and minimal coordination overhead.",
    evaluatorNotes:
      "Token bucket vs leaky bucket, sliding window approximations, Redis vs in-memory, coordination, clock skew, burst handling, and accuracy vs memory.",
  },
  {
    category: "system_design",
    id: "video-upload",
    title: "Video upload and processing",
    summary: "Upload large files, transcode, stream playback.",
    tags: ["blob", "async", "cdn"],
    candidateBrief:
      "Design a system for users to upload videos, process them into multiple renditions, and deliver adaptive streaming to viewers.",
    evaluatorNotes:
      "Multipart uploads, object storage, transcoding workers/queues, metadata DB, CDN, signed URLs, lifecycle policies, and failure retries.",
  },
  {
    category: "system_design",
    id: "search-autocomplete",
    title: "Search autocomplete",
    summary: "Low-latency prefix suggestions at scale.",
    tags: ["search", "trie", "ranking"],
    candidateBrief:
      "Design an autocomplete system for a large document/query corpus with strict latency budgets.",
    evaluatorNotes:
      "Trie vs Elasticsearch completion, ranking signals, personalization trade-offs, sharding, caching popular prefixes, and update pipelines.",
  },
  {
    category: "system_design",
    id: "payments-ledger",
    title: "Payments ledger",
    summary: "Double-entry ledger with strong consistency expectations.",
    tags: ["money", "consistency", "audit"],
    candidateBrief:
      "Design a ledger service to record money movements between accounts with auditability and correctness guarantees.",
    evaluatorNotes:
      "Double-entry invariants, idempotency keys, serializable isolation vs sharded counters, reconciliation, outbox pattern, and regulatory logging.",
  },
  {
    category: "system_design",
    id: "notification-dispatcher",
    title: "Notification dispatcher",
    summary: "Email/push/SMS with preferences and retries.",
    tags: ["queue", "delivery", "preferences"],
    candidateBrief:
      "Design a notification system that schedules and delivers notifications across channels while respecting user preferences and rate limits.",
    evaluatorNotes:
      "Queueing, workers, templating, per-channel providers, suppression lists, idempotency, DLQ, observability, and time-zone scheduling.",
  },
  {
    category: "system_design",
    id: "ride-matching",
    title: "Ride matching (Uber-like)",
    summary: "Match riders to drivers with ETA and surge dynamics (high level).",
    tags: ["geo", "realtime", "marketplace"],
    candidateBrief:
      "Design the core components to match riders with nearby drivers and estimate ETAs in a large city.",
    evaluatorNotes:
      "Geo indexes, dispatch algorithms (batching vs greedy), supply/demand, surge pricing at high level, map services, and failure handling.",
  },
  {
    category: "system_design",
    id: "distributed-cache",
    title: "Distributed in-memory cache",
    summary: "Clustered cache with eviction and replication basics.",
    tags: ["cache", "consistent-hashing", "replication"],
    candidateBrief:
      "Design a distributed cache layer (like a simplified Memcached cluster) for low-latency reads across many app servers.",
    evaluatorNotes:
      "Consistent hashing, replication, eviction policies, thundering herd, cache stampede mitigation, and partial failures.",
  },
  {
    category: "system_design",
    id: "kv-store",
    title: "Key-value store",
    summary: "Highly available KV with partitioning and replication.",
    tags: ["storage", "raft", "quorum"],
    candidateBrief:
      "Design a distributed key-value store for string values with high availability and partition tolerance.",
    evaluatorNotes:
      "Partitioning, replication, leader election, quorum reads/writes, hinted handoff, anti-entropy, and conflict resolution scope.",
  },
  {
    category: "system_design",
    id: "blob-storage",
    title: "Object/blob storage",
    summary: "Large binary objects with durability and listing.",
    tags: ["storage", "metadata", "durability"],
    candidateBrief:
      "Design a blob storage system for arbitrary large objects with durability guarantees and bucket/key listing.",
    evaluatorNotes:
      "Chunking/erasure coding vs replication, metadata service, consistent hashing of objects, garbage collection, and strong vs eventual listing consistency.",
  },
  {
    category: "system_design",
    id: "metrics-aggregation",
    title: "Metrics aggregation pipeline",
    summary: "Ingest high-cardinality metrics and query aggregates.",
    tags: ["streaming", "timeseries", "rollup"],
    candidateBrief:
      "Design a pipeline to ingest application metrics at scale and support dashboard queries with rollups.",
    evaluatorNotes:
      "Cardinality limits, streaming ingest (Kafka-like), time-series DB, downsampling, pre-aggregation, and query fanout.",
  },
  {
    category: "system_design",
    id: "config-service",
    title: "Dynamic configuration service",
    summary: "Feature flags and tunable config with safe rollout.",
    tags: ["config", "rollout", "consistency"],
    candidateBrief:
      "Design a service to distribute configuration/feature flags to thousands of services with fast propagation and safe rollouts.",
    evaluatorNotes:
      "Consistency model, polling vs push, versioned snapshots, cache coherency, kill switches, audit trails, and blast radius.",
  },
  {
    category: "system_design",
    id: "collab-editor",
    title: "Collaborative document editor",
    summary: "Multiple users editing one doc with concurrency control.",
    tags: ["crdt", "realtime", "sync"],
    candidateBrief:
      "Design a collaborative text editor where multiple users can edit the same document with low latency.",
    evaluatorNotes:
      "OT vs CRDT at high level, operational transforms, presence, persistence, conflict semantics, and scaling edit fanout.",
  },
  {
    category: "system_design",
    id: "recommendation-feed",
    title: "Recommendation ranking service",
    summary: "Candidate generation + ranking for personalized items.",
    tags: ["ml", "ranking", "features"],
    candidateBrief:
      "Design a recommendation system that selects items for a user feed from a huge catalog.",
    evaluatorNotes:
      "Two-stage retrieval + ranking, feature stores, offline/online trade-offs, exploration/exploitation, and evaluation metrics.",
  },
  {
    category: "system_design",
    id: "ci-artifact-registry",
    title: "CI artifact registry",
    summary: "Store build artifacts with immutable versions.",
    tags: ["storage", "metadata", "permissions"],
    candidateBrief:
      "Design an artifact registry for CI outputs (containers, binaries) with immutable versions and access control.",
    evaluatorNotes:
      "Blob vs metadata separation, content-addressed storage, garbage collection of unreferenced artifacts, permissions, and replication for downloads.",
  },
  {
    category: "system_design",
    id: "distributed-lock",
    title: "Distributed lock service",
    summary: "Leases with fencing tokens for coordination.",
    tags: ["locks", "coordination", "correctness"],
    candidateBrief:
      "Design a distributed lock/lease service used by many workers to coordinate work safely.",
    evaluatorNotes:
      "Lease TTL, fencing tokens, stale coordinator issues, Redlock critique awareness, and when locks are the wrong tool.",
  },
];

/** @deprecated Prefer importing `SYSTEM_DESIGN_PROMPTS`. */
export const DESIGN_PROMPTS = SYSTEM_DESIGN_PROMPTS;
