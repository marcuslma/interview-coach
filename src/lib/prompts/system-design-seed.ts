import type { PracticePrompt } from "./types";

/**
 * System design scenarios. Evaluator notes ground the interview in the patterns
 * and numbers senior interviewers actually probe: capacity estimation, CAP,
 * consistency levels, fan-out strategies, idempotency keys, circuit breakers,
 * hot-partition fixes, observability, and explicit cost/benefit trade-offs.
 */
export const SYSTEM_DESIGN_PROMPTS: PracticePrompt[] = [
  {
    category: "system_design",
    id: "sd-framework-estimation",
    title: "Interview framework & capacity estimation",
    summary:
      "RESHADED flow, back-of-envelope math, availability budgets, Little's Law.",
    tags: ["framework", "estimation", "sla"],
    candidateBrief:
      "Walk through how you approach any system design question. Given \"100 M DAU, 500 M posts/day, p99 < 200 ms\", compute write QPS, read QPS (assuming 10:1 read/write), storage per day, and cache size to hit a 95% hit rate.",
    evaluatorNotes:
      "Expect a structured flow — **RESHADED**: **R**equirements (functional + non-functional), **E**stimation, **S**chema, **H**igh-level, **A**PI, **D**eep dive on 1–2 hot paths, **E**dge cases / trade-offs. Ask for **back-of-envelope** math out loud: writes/sec = (daily writes / 86 400); reads usually 5–10× writes; bytes/day = events × avg size. Call out **availability math**: 99.9 % ≈ 8.8 h/yr downtime, 99.99 % ≈ 53 min/yr, 99.999 % ≈ 5.3 min/yr; composed services multiply (99.9 % × 99.9 % = 99.8 %). **Little's Law** (N = λ·W) ties concurrency, throughput and latency. Always talk in **p50/p95/p99**, not averages—averages hide the tail. Senior signal: asking \"what's our read/write ratio?\" before drawing boxes.",
  },
  {
    category: "system_design",
    id: "news-feed",
    title: "Distributed news feed",
    summary:
      "Home timeline at scale — fan-out on write vs read, celebrity problem, hybrid.",
    tags: ["feed", "fanout", "cache"],
    candidateBrief:
      "Design the core systems behind a social network home feed (posts from followed accounts). Pick read vs write model and handle the \"Taylor Swift has 300 M followers\" problem without melting the fan-out worker.",
    evaluatorNotes:
      "Feeds are **read-heavy**: 10–100× more timeline reads than posts. Compare **push (fan-out on write)**: precompute each follower's timeline in a Redis sorted set (`ZADD timeline:<user> <ts> <postId>`, trim to last 1k)—O(1) reads, but writing one post costs N follower writes. **Pull (fan-out on read)**: cheap writes, expensive reads that scatter-gather across followees. **Hybrid is the real answer**: push for regular users (< 1 M followers), skip fan-out for celebrities and **merge on read** (small pre-built timeline + recent celebrity posts from their own index). Push must be **async** via a queue; the post API responds immediately. Probe ranking + dedupe, hot keys (cache celeb posts aggressively), idempotent post creation, and backfill strategy when the ranker changes.",
  },
  {
    category: "system_design",
    id: "chat-messaging",
    title: "Realtime chat service",
    summary:
      "1:1 and group chat — WebSockets, cross-server fan-out, delivery semantics.",
    tags: ["websocket", "ordering", "delivery"],
    candidateBrief:
      "Design a messaging system with presence, history, receipts, and group chats (including a 100k-member channel). Explain delivery semantics (at-most-once / at-least-once / effectively-exactly-once) and the cross-server fan-out problem.",
    evaluatorNotes:
      "WebSocket **gateway servers** hold sticky connections (use `ip_hash`/affinity in the LB). With N gateways, users A and B are likely on different gateways → use **Redis Pub/Sub** (or Kafka) as a message bus: publish to `chat:{roomId}`, each gateway delivers to its local connections. **Ordering** is per-conversation (use a monotonic sequence per room + server timestamp). **Delivery**: persist first, deliver second; ACK back; client retries with a **client-side msg id** to dedupe → **at-least-once + idempotent consumer = effectively-exactly-once**. **Presence** via TTL keys (`EXPIRE online:{user} 30` + heartbeat). Offline → queue a push notification. For large groups, fan-out via **Kafka partitioned by roomId** so one slow consumer doesn't block others; never loop synchronously over 100k members. Probe history pagination (descending `_id`), message search (out-of-band to Elasticsearch), multi-region, and end-to-end encryption at a concept level.",
  },
  {
    category: "system_design",
    id: "url-shortener",
    title: "URL shortener",
    summary:
      "bit.ly — short code generation, redirect latency, read-heavy cache.",
    tags: ["kv", "base62", "cache"],
    candidateBrief:
      "Design a URL shortening service: create short URLs, redirect in < 50 ms p99, and collect analytics without slowing the redirect path. Pick a short-code scheme and handle 100 M URLs with 3 800 redirects/sec.",
    evaluatorNotes:
      "Short code: **base62 (a–z, A–Z, 0–9)** — 62^7 ≈ 3.5 T combinations. Prefer a **monotonic counter** (Redis `INCR` or Snowflake) then base62-encode → **no collisions, no retries**; random UUIDs require collision checks. Writes are cheap; reads dominate → **Redis cache** keyed by code, 302 redirect (or **301 with short TTL** if you still need analytics on repeat clicks). Record clicks **asynchronously** (Kafka → analytics DB) so the redirect never blocks on it. **Bloom filter** in front of Redis for fast 404s on bots probing random codes (no false negatives—if the filter says \"no\", skip Redis and DB entirely). Probe custom aliases, abuse prevention (rate limit creation per IP, block known-bad domains), TTL/expiry, and CDN in front of the redirect endpoint.",
  },
  {
    category: "system_design",
    id: "rate-limiter",
    title: "Distributed rate limiter",
    summary:
      "Algorithms, sliding window in Redis, per-IP vs per-user, boundary burst.",
    tags: ["redis", "algorithms", "429"],
    candidateBrief:
      "Design a rate limiter usable by many API gateways: 1 000 req/min/user and 5 req/15 min for `/login`, shared state across gateway replicas. Explain the algorithm trade-offs and why a naive fixed window is wrong.",
    evaluatorNotes:
      "Compare algorithms: **fixed window** (cheap, but **boundary burst**—60 requests at 12:00:59 + 60 at 12:01:01 = 120 in 2 s), **sliding window log** (accurate, memory-heavy), **sliding window counter** (approximate, good default), **token bucket** (allows bursts up to the bucket size), **leaky bucket** (smooths output). Sliding window in Redis = sorted set: `ZREMRANGEBYSCORE key 0 (now-window)`, `ZADD key now member`, `ZCOUNT`, `PEXPIRE` in one **pipeline**; ~4 ops. Key dimension: **per user/api-key** for auth'd traffic, **per IP** for anonymous + abuse. Return **`X-RateLimit-*`** headers and HTTP **429** with `Retry-After`. Keep the limiter in the **API gateway / nginx** when possible (ngx_http_limit_req_module) so services don't carry the logic. Probe clock skew across nodes (use Redis server time), fail-open vs fail-closed when Redis is down, and cost vs accuracy.",
  },
  {
    category: "system_design",
    id: "video-upload",
    title: "Video upload, transcoding & adaptive streaming",
    summary:
      "Multipart upload → S3 → queue → transcode → DASH/HLS on the CDN.",
    tags: ["blob", "async", "cdn"],
    candidateBrief:
      "Design the upload and playback path for a YouTube-style service: 500 h of video uploaded per minute, adaptive bitrate from 240p to 4K, and sub-second join time. Keep the application servers out of the video bytes.",
    evaluatorNotes:
      "**Never proxy video bytes through your app**: issue a **pre-signed S3 URL** so the client uploads directly; app just records metadata (`videoId`, `status: uploading`). Upload complete → S3 event → SQS/Kafka → **transcoding workers** (FFmpeg) emit **multiple renditions** (240p/360p/480p/720p/1080p/4K) and segment into **2–4 s chunks** with an HLS `.m3u8` or DASH manifest. Prioritise 360p/720p first so playback starts fast. Serve everything from a **CDN** (CloudFront, Cloudflare, or Netflix-style Open Connect inside ISPs). Playback = **client redirects to CDN URL** (302); player picks bitrate based on bandwidth (ABR). Store metadata in a wide-column store (Cassandra) or Mongo; analytics (views, watch-time) via an event stream. Probe resumable uploads (tus/multipart), GPU transcoding cost, cold/hot storage tiering, DRM at concept level, and signed URLs for private content.",
  },
  {
    category: "system_design",
    id: "search-autocomplete",
    title: "Search autocomplete",
    summary:
      "Prefix suggestions with < 100 ms p99 — trie, Redis, or Elasticsearch.",
    tags: ["search", "trie", "ranking"],
    candidateBrief:
      "Design an autocomplete service (Google-style) serving 50 k QPS with p99 < 100 ms. Rank by popularity and recency, support fuzzy matches for typos, and update the index as trends change.",
    evaluatorNotes:
      "Three viable storage options: **in-memory trie** per box (lowest latency, but memory-heavy and resharding is painful), **Redis sorted sets** (one set per prefix, `ZRANGEBYLEX` or scored by popularity; simple and fast), or **Elasticsearch completion suggester / edge n-grams** (richer ranking, fuzzy matching with Damerau-Levenshtein). Always front everything with a **Redis cache keyed by the prefix string**—hot prefixes (`a`, `ap`, `app`) will dominate. **Ranking**: popularity (click-through), recency (time-decay), personalization (only if the latency budget allows). **Index updates** via a streaming pipeline (query logs → Kafka → batch aggregator → merge into sorted sets hourly). Probe cardinality control, multi-language tokenisation, how long to keep cached prefixes, and graceful degradation (fall back to simple startsWith when the fancy index is down).",
  },
  {
    category: "system_design",
    id: "payments-ledger",
    title: "Payments ledger",
    summary:
      "Double-entry, idempotency keys, exactly-once charges, audit.",
    tags: ["money", "consistency", "idempotency"],
    candidateBrief:
      "Design a payments service that charges cards via Stripe-like processors, records a double-entry ledger, never double-charges on retries, and recovers cleanly from crashes mid-charge.",
    evaluatorNotes:
      "Money requires **strong consistency** (CP on the CAP axis) and an **immutable append-only ledger**. The canonical bug is charging twice on retry—fix with a required **`Idempotency-Key` header** stored in Redis (or the DB) with the response body and status; duplicate key → **replay the stored response**, do not re-call the processor. **Write transaction row `pending` BEFORE calling the processor**; then atomically flip to `completed`/`failed` with the processor's id. Use **`w: 'majority'` + `j: true`** in Mongo, `SERIALIZABLE` or `REPEATABLE READ` in PostgreSQL; check sufficient balance in the filter itself (`WHERE balance >= amount`). For cross-service flows (reserve inventory → charge → confirm), use the **Saga pattern** (orchestration or choreography) with **compensating transactions** and retries on `TransientTransactionError`. Emit an event via the **transactional outbox** so downstream (receipts, analytics) never sees a charge that was rolled back. Probe reconciliation against the processor's daily file, regulatory audit retention, and PCI scope isolation.",
  },
  {
    category: "system_design",
    id: "notification-dispatcher",
    title: "Notification dispatcher",
    summary:
      "Email/SMS/push with preferences, retries, DLQ, timezone scheduling.",
    tags: ["queue", "fanout", "providers"],
    candidateBrief:
      "Design a notification service that sends order confirmations, promos, and critical alerts via email/SMS/push/in-app, respecting user preferences, quiet hours by timezone, and provider failures.",
    evaluatorNotes:
      "Event sources (order service, auth, marketing) → **Kafka / BullMQ** → dispatcher worker → channel-specific provider. Per-event decision tree: channels = union of user preferences + priority (critical adds email+SMS, routine uses in-app when online, push when offline). Route each channel independently with `Promise.allSettled` so one provider failure doesn't drop the rest. **Idempotency** per (userId, eventId, channel) to avoid re-sends on retries. Retries with **exponential backoff + jitter** (1 s, 2 s, 4 s, … ±random) per-provider; dead messages go to a **DLQ** for human review. Respect **quiet hours in the user's local timezone** (store IANA tz per user), suppression lists (hard bounce, unsubscribe, regulatory), and per-channel **rate caps** (SMTP provider hourly limit). Templating with variables; pre-render in the worker. Probe delivery receipts (SNS/Twilio webhooks), batching (cheaper email sends), and observability per channel.",
  },
  {
    category: "system_design",
    id: "ride-matching",
    title: "Ride matching (Uber-like)",
    summary:
      "Geo-indexed supply, low-latency match, surge pricing per hex cell.",
    tags: ["geo", "realtime", "marketplace"],
    candidateBrief:
      "Design the core match + ETA path for an Uber-scale marketplace: 3 M active drivers streaming GPS every 4 s, 5 M trips/day, \"find a driver within 2 km\" in under 200 ms.",
    evaluatorNotes:
      "Driver location updates via **WebSocket** (or HTTPS long-poll). Write to **Redis GEO** (`GEOADD` with a TTL-like expire to drop stale drivers) and publish to Kafka for the trip/analytics pipeline. Match = `GEOSEARCH FROMLONLAT ... BYRADIUS 2 km ASC COUNT 10` → rank by distance/ETA/rating → **offer to top candidate**, fall through on decline (avoid broadcasting to all, which wastes driver time). **Hex indexing (Uber's H3)** divides the map into cells for **surge pricing**: demand/supply per cell over a sliding window → multiplier. ETA from an external map service (Google/OSRM) cached per (from, to, minute). Probe dispatch algorithms (batched second-level matching for shared rides), **hot cells at airports** (pre-warm drivers, cap offers per driver), fraud (GPS spoofing detection), and cross-region data for big fleets.",
  },
  {
    category: "system_design",
    id: "distributed-cache",
    title: "Distributed in-memory cache",
    summary:
      "Clustered Redis/Memcached — consistent hashing, stampede, eviction.",
    tags: ["cache", "consistent-hashing", "stampede"],
    candidateBrief:
      "Design a shared cache layer (like Memcached cluster) serving 500 k QPS with sub-ms latency. Handle node add/remove without invalidating everything, and prevent a stampede when a hot key expires.",
    evaluatorNotes:
      "Naïve `hash(key) % N` **remaps 100 %** of keys when N changes → use **consistent hashing with virtual nodes** (100–200 vnodes per physical node) so add/remove touches ~1/N of keys. For replication, each key has a **primary + replica** on the next physical node on the ring. **Eviction**: LRU (`maxmemory-policy allkeys-lru`) is the sane default; LFU for truly long-tail access. **Cache stampede** on hot-key expiry: fix with (1) **probabilistic early refresh** (XFetch), (2) **single-flight** locks (only one request recomputes while others wait), or (3) **stale-while-revalidate** (serve stale for a grace period while background refresh runs). Use **write-through** for critical reads, **cache-aside** (lazy) for the rest. Probe **hot keys** (client-side request coalescing, per-key replication), partial failure fallthrough to DB with a circuit breaker, and cache poisoning.",
  },
  {
    category: "system_design",
    id: "kv-store",
    title: "Key-value store",
    summary:
      "Dynamo-style — partitioning, quorum, hinted handoff, anti-entropy.",
    tags: ["storage", "quorum", "replication"],
    candidateBrief:
      "Design an HA key-value store (think DynamoDB/Cassandra) for opaque string values: configurable consistency, survives a node loss, and self-heals after partitions.",
    evaluatorNotes:
      "**Partitioning** via consistent hashing with virtual nodes. **Replication factor N** (usually 3), read/write quorum **R + W > N** → quorum reads see the latest committed write. Typical config N=3, W=2, R=2 (balanced); N=3, W=3, R=1 (fast reads, slower writes); N=3, W=1, R=1 (AP, may stale-read). **Hinted handoff**: if a replica is down, store the write with a hint on a neighbour → replay when the target returns. **Anti-entropy**: Merkle trees to detect and repair divergent replicas in the background. **Conflict resolution**: vector clocks + last-write-wins, or CRDTs for specific types (counters, sets). Raft/Paxos for strong consistency (etcd/ZooKeeper), gossip for Dynamo-style AP. Always use an **odd number of nodes** for consensus (3/5/7). Probe read-repair, sloppy quorums, and that a key's owner set is determined by the ring—not a coordinator.",
  },
  {
    category: "system_design",
    id: "blob-storage",
    title: "Object / blob storage",
    summary:
      "S3-style — erasure coding vs replication, metadata plane, durability math.",
    tags: ["storage", "metadata", "durability"],
    candidateBrief:
      "Design a blob storage system for large opaque objects (up to tens of GB) with 11-nines durability, bucket/key listing, and efficient large-file upload/download.",
    evaluatorNotes:
      "Two planes: **metadata service** (lightweight KV: bucket, key, size, checksum, chunk map, ACL) and **data service** (the bytes themselves). Split objects into **chunks** (e.g. 4–64 MB) → hash for content-addressing and dedupe. Durability: compare **3× full replication** (simple, 3× storage) vs **erasure coding** (e.g. 10 data + 4 parity, ~1.4× storage, can lose any 4 out of 14)—erasure codes win at PB scale; replicas win on hot data. **Listing** is typically **eventually consistent** because metadata is sharded; objects themselves can be strongly consistent on read-after-write. **Uploads**: multipart with pre-signed URLs, resumable; **downloads**: HTTP Range requests served directly from the data plane. Probe lifecycle policies (hot → cold → glacier), GC of orphan chunks, integrity checks (scrubbing), signed URLs, and cross-region replication.",
  },
  {
    category: "system_design",
    id: "metrics-aggregation",
    title: "Metrics aggregation pipeline",
    summary:
      "High-cardinality ingest, rollups, query fan-out, cardinality control.",
    tags: ["streaming", "timeseries", "rollup"],
    candidateBrief:
      "Design a metrics pipeline ingesting 1 M points/sec from thousands of services, supporting dashboards from 5-minute granularity up to 2-year trends. Cover cardinality explosion and long-range queries.",
    evaluatorNotes:
      "Clients emit `(metric, tags, timestamp, value)` → **Kafka** (partitioned by metric name) → aggregators → **time-series DB** (Prometheus/Cortex, InfluxDB, VictoriaMetrics, ClickHouse). **Rollups**: 10 s raw → 1 min → 5 min → 1 h → 1 d, each with short TTL at the finer grain; dashboards pick the right tier for their window (read amplification stays bounded). **Cardinality** is the killer—label combos like `user_id` per metric explode storage; enforce **label allowlists** and reject unknown tags at ingest. **Query fan-out** across shards + merge (top-k, sum, avg); reject queries that would scan > N series. For alerts, use a separate **rule evaluator** that streams on the raw path. Probe clock skew, late-arriving data, how to handle a metric rename (stitching), and observability of the pipeline itself (meta-metrics).",
  },
  {
    category: "system_design",
    id: "config-service",
    title: "Dynamic configuration & feature flags",
    summary:
      "Safe rollout, blast radius, polling vs push, versioned snapshots.",
    tags: ["config", "rollout", "consistency"],
    candidateBrief:
      "Design a service that distributes configuration and feature flags to thousands of service instances: propagate changes in < 10 s, survive the service being down, and roll out safely to 1 %, 10 %, 100 % of users.",
    evaluatorNotes:
      "Each flag is **versioned + immutable per version**; services subscribe to the flag set and hold a **last-known-good snapshot on disk** so the data plane keeps working if the config service is down (**fail-open to cached values**). **Propagation**: long-poll or server-sent events/gRPC streams for push; a fallback poll loop every 30–60 s. **Targeting rules** evaluated on the client with a stable bucket (`hash(userId || visitorId) % 10000 < rolloutPercent`) → consistent assignment across services, no flappers. **Kill switches** = flags whose value propagates in seconds and is audited (who changed, when, why). Rollout flow: **1 % → 10 % → 50 % → 100 %** with automatic rollback tied to SLO alerts. Blast radius limited by scoping flags to environment/region/service. Probe staleness tolerance, encryption for secrets-like config, and the difference between **flags** (boolean/string, A/B test) and **dynamic config** (tunables like timeouts).",
  },
  {
    category: "system_design",
    id: "collab-editor",
    title: "Collaborative document editor",
    summary:
      "OT vs CRDT, presence, conflict semantics at Google Docs scale.",
    tags: ["crdt", "realtime", "sync"],
    candidateBrief:
      "Design a real-time collaborative text editor (Google Docs / Figma-lite): low-latency typing, correct convergence when two users edit simultaneously, presence, and history. Pick OT or CRDT and justify.",
    evaluatorNotes:
      "**OT (Operational Transform)** requires a central sequencer that transforms conflicting operations against each other—battle-tested (Google Docs), but the server must serialize every op. **CRDT (Conflict-free Replicated Data Types)** lets clients converge deterministically without central order—better for P2P / offline-first (Figma-ish, Yjs, Automerge); the trade-off is larger op payloads (each character carries metadata). Use a **WebSocket gateway** per document, **Redis pub/sub** to broadcast ops across gateways, and persist the oplog/snapshot periodically to object storage. **Presence** (cursors, selection) via ephemeral pub/sub—don't persist. **Undo** works per-client using the oplog. Probe large-document snapshotting, offline reconciliation, permissions + per-user masking, and cost at scale (CRDT metadata can be 10–20× larger than raw text).",
  },
  {
    category: "system_design",
    id: "recommendation-feed",
    title: "Recommendation ranking service",
    summary:
      "Two-stage retrieval + ranking, feature store, explore/exploit, A/B.",
    tags: ["ml", "ranking", "features"],
    candidateBrief:
      "Design a personalization service that picks items for each user from a 100 M-item catalog within a 100 ms budget. Cover candidate generation, ranking, cold-start users, and running A/B tests between models.",
    evaluatorNotes:
      "**Two-stage architecture**: (1) **candidate generation** — fast recall across the full catalog via ANN on user/item embeddings (FAISS, ScaNN, pgvector), collaborative filtering, or popularity heuristics → shrink to ~1 000; (2) **ranking** — a heavier model (gradient boosted, neural) scores those 1 000 on real-time features. **Feature store** serves offline-computed user/item features (batch) + online signals (last-session clicks) with a single low-latency read. **Cold start**: fallback to popularity per region/segment + exploration. Track every impression/click via Kafka → offline training refreshes models daily/weekly. **A/B testing** with sticky bucketing, guarded by SLOs (revenue, engagement); latency budget per stage (retrieval ≤ 30 ms, ranking ≤ 50 ms). Probe **explore/exploit** (ε-greedy, Thompson sampling), filter bubbles, and graceful degradation to static popular list on failure.",
  },
  {
    category: "system_design",
    id: "ci-artifact-registry",
    title: "CI artifact registry",
    summary:
      "Content-addressed storage, immutable tags, GC of unreferenced blobs.",
    tags: ["storage", "metadata", "permissions"],
    candidateBrief:
      "Design an artifact registry for container images and binaries with immutable versions, fast pulls from any region, and automatic cleanup of abandoned artifacts.",
    evaluatorNotes:
      "**Metadata + blob separation** (like OCI distribution): manifests live in a transactional DB, blobs (layers) in object storage keyed by **SHA-256 digest** (content-addressed). Same layer pushed by many images is deduped automatically. **Tags are mutable pointers to immutable digests**; always record both. **Global distribution**: replicate blobs to regional S3/registry caches; pull-through cache for upstreams. **Authentication** per repo/namespace; write with short-lived signed URLs. **GC**: mark-sweep across the digest graph—a blob is reachable if any current manifest references it; delete unreachable blobs only after a **grace period** so an in-flight push doesn't lose its just-uploaded layer (the classic race). Probe content trust/signing (cosign, Notary), rate limits on pulls, vulnerability scanning on push, and retention policies per tag pattern.",
  },
  {
    category: "system_design",
    id: "distributed-lock",
    title: "Distributed lock service",
    summary:
      "TTL leases, fencing tokens, Redlock critique, \"when not to lock\".",
    tags: ["locks", "coordination", "correctness"],
    candidateBrief:
      "Design a distributed lock service used by workers to ensure a scheduled job runs on exactly one node at a time. Cover lock expiry, the GC-pause problem, and when a lock is the wrong tool.",
    evaluatorNotes:
      "Basic Redis lock: `SET key <uuid> NX PX <ttl>` for acquire, **Lua script** (get-and-delete only if value matches) for release—you **must own the lock to release it**. **TTL is mandatory** (crashed holder must not deadlock forever) but introduces the **GC-pause problem**: a 30-second GC pause inside the critical section lets the lock expire and a second holder start; the first holder then \"succeeds\" with stale assumptions. Fix with a **fencing token**—the lock service returns a monotonically increasing token; the protected resource rejects writes with a lower token. Be aware of the **Redlock critique** (Kleppmann vs antirez): multi-node Redlock adds complexity but doesn't guarantee safety without fencing. For truly correct locks, prefer **etcd/ZooKeeper leases** backed by Raft. **Often the right answer is to avoid locks**: idempotent operations, optimistic concurrency (CAS with version), or a single-leader scheduler.",
  },
  {
    category: "system_design",
    id: "sd-flash-sale-booking",
    title: "Flash sale / booking under extreme contention",
    summary:
      "Limited inventory, no oversell, thundering herd, fair queueing.",
    tags: ["contention", "inventory", "queue"],
    candidateBrief:
      "Design the checkout path for a flash sale: 1 000 concert tickets, 500 000 users pressing \"buy\" at 12:00:00. No oversell, fair ordering, and the site must still respond during the spike.",
    evaluatorNotes:
      "Single atomic counter in Redis (`DECR stock`) is the canonical solution—first 1 000 `DECR` return ≥ 0 (winners), the rest return negative and are rejected; **roll back with `INCR` on downstream failure**. Persist the reservation synchronously (DB row linked to the Redis decrement) before confirming. **Hot key** problem: that one counter is the universe's worst hot partition—**pre-warm nodes**, consider sharding the counter across N keys and summing (for N = 10 slots, user hits `stock:<i>`, check remaining = Σ slots). Absorb load with a **virtual waiting room** / **token queue** (Ticketmaster style): issue signed tokens at a steady rate (e.g. 5k/s), only token holders can call checkout. **Idempotency-Key** on purchase to survive retries. Load shedding at the gateway when memory/CPU > 90 % (return 503 with Retry-After). Pre-compute every static asset to the CDN; only the `POST /reserve` endpoint hits origin. Probe bot mitigation, queue fairness, and what happens if payment fails after reservation (timeout → return to pool).",
  },
  {
    category: "system_design",
    id: "sd-observability-slos",
    title: "Observability & SLOs",
    summary:
      "Metrics/logs/traces, RED + USE, SLI/SLO/SLA, error budget, chaos.",
    tags: ["observability", "slo", "reliability"],
    candidateBrief:
      "Design the observability stack for a microservices platform and define SLOs for an order API. Explain how you'd detect, diagnose, and page on a latency regression at p99.",
    evaluatorNotes:
      "**Three pillars**: **metrics** (Prometheus/Datadog — cheap, low cardinality, time-series), **logs** (structured JSON with requestId/userId/spanId in Loki/ELK/CloudWatch), **traces** (OpenTelemetry + Jaeger/Tempo — end-to-end request across services with spans). Dashboard with the **RED method** for services (Rate, Errors, Duration p50/p95/p99) and the **USE method** for resources (Utilisation, Saturation, Errors). **SLI** = what we measure (e.g. fraction of requests < 300 ms), **SLO** = target (99.9 %), **SLA** = contractual (with penalty); the gap between SLO and 100 % is the **error budget** — spend it on risky deploys or slow down releases when it's exhausted. Page on **burn-rate alerts** (fast burn = 14.4× for 1 h → page; slow burn = 6× for 6 h → ticket) rather than raw thresholds. Close the loop with **canary + blue-green deploys**, **feature flags** as kill switches, and **chaos engineering** (Chaos Monkey) to verify resilience before customers find the failures. Propagate `traceparent` on every hop and correlate with logs using the requestId.",
  },
];

/** @deprecated Prefer importing `SYSTEM_DESIGN_PROMPTS`. */
export const DESIGN_PROMPTS = SYSTEM_DESIGN_PROMPTS;
