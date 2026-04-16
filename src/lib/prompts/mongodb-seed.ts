import type { PracticePrompt } from "./types";

/**
 * MongoDB — document model, indexing, aggregation, schema design, replication,
 * sharding, transactions, and production concerns. Scenarios focus on what
 * interviewers actually probe (ESR, covered queries, $lookup with index,
 * shard key choice, replica-set transactions, Mongoose ODM patterns).
 */
export const MONGODB_PROMPTS: PracticePrompt[] = [
  {
    category: "mongodb",
    id: "mongo-document-bson-ids",
    title: "Documents, BSON & ObjectId",
    summary:
      "Collections, BSON types, 16MB limit, ObjectId comparison, Decimal128.",
    tags: ["bson", "objectid", "basics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Explain the document/collection model, what BSON adds on top of JSON, how ObjectId works, and why you use `Decimal128` instead of `Number` for money.",
    evaluatorNotes:
      "**Document** ≈ row (JSON-like, max 16 MB, flexible shape); **collection** ≈ table; BSON adds binary types over JSON: **ObjectId** (12 bytes = 4 timestamp + 5 random + 3 counter — embeds creation time via `getTimestamp()`), `Date`, `Int32`/`Int64`, `Decimal128`, `BinData`. Pitfall: `id1 === id2` is always false for ObjectId (different objects)—use `id1.equals(id2)` or compare `toString()`. Floating-point Number loses precision for money (`0.1 + 0.2 !== 0.3`); store monetary values as **Decimal128**. Custom `_id` is allowed (email, natural key) but you lose the free timestamp and sharding-friendly distribution. Exposing `_id` publicly leaks registration timestamp—hash or use UUIDs when privacy matters.",
  },
  {
    category: "mongodb",
    id: "mongo-crud-operators",
    title: "CRUD & update operators",
    summary:
      "$set/$inc/$push/$pull/$addToSet, upsert with $setOnInsert, bulkWrite.",
    tags: ["crud", "operators", "bulk"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Write correct update operations: increment a counter, push to a bounded array, upsert with safe defaults, and bulk-update many documents. Then contrast `updateOne` with `replaceOne` pitfalls.",
    evaluatorNotes:
      "Update operators: **`$set`** (single field), **`$unset`** (remove field), **`$inc`** (atomic, works on non-existent fields → creates), **`$push`** (array append, pairs with `$each`/`$slice`/`$sort` for bounded arrays), **`$pull`** (remove by criteria), **`$addToSet`** (push only if not present). Classic bug: `updateOne({ _id }, { name: 'x' })` **replaces** the whole document with `{ name: 'x' }`—use `$set`. **Upsert** with `$setOnInsert`: set initial fields **only on insert** (e.g. `createdAt`), use `$set` for fields that should also update. **`bulkWrite`** with `ordered: false` for data imports and batch jobs (one round trip, continues past errors). `findOneAndUpdate({ new: true })` returns the post-update doc; default returns the pre-update doc.",
  },
  {
    category: "mongodb",
    id: "mongo-indexes-queries",
    title: "Indexes, ESR rule & covered queries",
    summary:
      "Compound index order (Equality, Sort, Range), covered queries, explain().",
    tags: ["indexes", "performance", "esr"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Given `find({ status: 'active', city: 'Mumbai' }).sort({ createdAt: -1 })`, design the correct compound index and prove it's used with `explain()`. Then make the query **covered**.",
    evaluatorNotes:
      "**ESR rule** for compound index field order: **Equality → Sort → Range**. The example here wants `{ status: 1, city: 1, createdAt: -1 }` so the index satisfies filter and sort together; reverse order (`createdAt` first) forces an in-memory sort. Verify with `explain('executionStats')`: aim for **`IXSCAN`** (index scan), not **`COLLSCAN`**; `totalDocsExamined ≈ nReturned` (ratio close to 1:1). A **covered query** is satisfied by the index alone (`totalDocsExamined: 0`)—requires every filtered *and* projected field to be in the index, plus `{ _id: 0 }` projection (since `_id` is returned by default). Compound index direction matters only when it intersects `sort`. **Index intersection** between two single-field indexes is a hint you're missing a compound index. `hint()` forces a specific index and is a code smell—fix the real indexing problem instead.",
  },
  {
    category: "mongodb",
    id: "mongo-index-types-special",
    title: "Special indexes: TTL, text, geo, partial, sparse, unique",
    summary:
      "Pick the right index type; unique+optional field gotcha.",
    tags: ["indexes", "ttl", "text", "partial"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Pick the right index for: auto-expiring sessions, full-text product search, nearest-store lookup, a unique email only for verified users, and an optional external OAuth id.",
    evaluatorNotes:
      "**TTL** — `expireAfterSeconds` on a `Date` field; background deleter runs every ~60 s, so expiry is approximate. **Text** — `{ field: 'text' }`, one text index per collection; query with `$text: { $search: ... }`. **2dsphere** — `[lng, lat]` GeoJSON `Point`; use `$near`, `$geoWithin`. **Unique on optional field** is a trap: without `sparse` or `partialFilterExpression`, only one document can have the field missing (null is indexed once). Solve with **`sparse: true`** (skip docs without the field) or the more explicit **`partialFilterExpression: { field: { $exists: true } }`**. **Partial index** also shrinks hot indexes (e.g. only `status: 'pending'` orders)—much smaller + faster than a full index when most docs don't match. **Collation** for case-insensitive unique email (`{ locale: 'en', strength: 2 }`)—better than `.toLowerCase()`. Multikey indexes on arrays are automatic.",
  },
  {
    category: "mongodb",
    id: "mongo-aggregation",
    title: "Aggregation pipeline",
    summary:
      "$match/$project early, $lookup with index, $facet, allowDiskUse.",
    tags: ["aggregation", "pipeline", "performance"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Write an aggregation that returns the top-10 categories by revenue this month, plus list/count pagination of orders in one round trip. Cover the two biggest performance rules.",
    evaluatorNotes:
      "Stages used: `$match` (filter early — **the single biggest perf win**; uses indexes), `$project` (shrink docs early), `$group`, `$sort`, `$limit`, `$lookup` (join — always **index the `foreignField`**), `$unwind` (after filters, or you blow up intermediate results), `$facet` (run multiple sub-pipelines: e.g. `data: [...]` + `total: [{ $count: 'count' }]` for paginated list + total in one query), `$addFields`, `$out`/`$merge` (write results to a collection for pre-aggregation). **Memory limit:** 100 MB per stage; pass **`allowDiskUse: true`** only after squeezing with `$match`/`$project` first. **Top-K coalescence:** `$sort` immediately followed by `$limit` is optimized (keeps top N, not full sort). Prefer **pre-aggregation** (maintain a rolled-up collection via `$merge` or counters) over running heavy aggregations on every request.",
  },
  {
    category: "mongodb",
    id: "mongo-query-optimization",
    title: "Query optimization: explain, lean, projection",
    summary:
      "IXSCAN vs COLLSCAN, totalDocsExamined, lean(), cursor streaming.",
    tags: ["performance", "explain", "mongoose"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Diagnose a slow MongoDB query with `explain('executionStats')` and list the top five fixes you'd consider (indexing, projection, `lean()`, batching, cursor streaming).",
    evaluatorNotes:
      "Read `explain('executionStats')`: **`stage: 'IXSCAN'`** good, **`'COLLSCAN'`** bad; `totalDocsExamined` should be close to `nReturned` (big gap = missing index). Fixes (in order of typical impact): (1) add compound index matching filter+sort (ESR); (2) **project** only the fields you need (`.select('name email')`); (3) **`.lean()`** in Mongoose skips document hydration (2–5× faster for reads—no `.save()`, virtuals, or middleware); (4) replace loops with **bulk ops** (`updateMany`, `bulkWrite`); (5) use a **cursor** (`for await (const doc of Model.find().cursor())`) for million-row exports. Other gotchas: unanchored `$regex` can't use an index (use `^prefix`); returning a 50-field document when you need 2 is the cheapest optimization to fix; `hint()` is a band-aid—fix the index.",
  },
  {
    category: "mongodb",
    id: "mongo-schema-design",
    title: "Schema design: embedding, referencing & denormalization",
    summary:
      "Model for queries; bucket, subset, computed patterns.",
    tags: ["schema", "modeling", "patterns"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Design the schema for a blog (posts, comments, authors, tags) and an e-commerce orders system. Justify each embed vs reference decision and the deliberate denormalizations.",
    evaluatorNotes:
      "Golden rule: **model for the queries, not for normalization**—data read together lives together. **Embed** when the array is **bounded** and always accessed with the parent (addresses, small comment lists, order line items). **Reference** when the relationship is **unbounded** or independently queried (user → orders, post → all comments). Watch the **16 MB limit** (e.g. viral post with 100k embedded comments). Canonical **deliberate denormalizations**: author name/avatar on posts (fast feed, stale-if-user-renames), `likeCount`/`commentCount` maintained via `$inc` (avoid `COUNT(*)`), **price + product name snapshot on order items** (historical correctness—price must not change if product price changes). Patterns worth naming: **subset** (keep last 5 comments inline, rest in another collection), **bucket** (group IoT readings into per-hour buckets), **computed** (pre-calc aggregates). Many-to-many with attributes (enrollment date, grade) → **junction collection**.",
  },
  {
    category: "mongodb",
    id: "mongo-mongoose-patterns",
    title: "Mongoose ODM patterns",
    summary:
      "Schemas, hooks, populate, virtuals, lean, when to drop to the driver.",
    tags: ["mongoose", "odm", "validation"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Using Mongoose, design a `User` model that hashes the password on save, hides it in JSON output, soft-deletes instead of removing, and populates referenced docs efficiently.",
    evaluatorNotes:
      "Schema pieces: types with **validators** (`required`, `min`, `max`, `match`, `enum`), `trim`, `lowercase`, `{ select: false }` to hide by default (e.g. `password`), `timestamps: true` for auto `createdAt`/`updatedAt`. **Middleware (hooks):** `pre('save', async fn)` for password hashing (check `this.isModified('password')`); `pre(/^find/, fn)` to scope all find queries to `{ deleted: { $ne: true } }` → clean soft-delete. **Instance methods** for `comparePassword`; **statics** for shared queries. **`populate('userId', 'name avatar')`** ≈ `$lookup` but client-side (N+1 risk — always project fields). Prefer **`.lean()`** for read-heavy endpoints (no Mongoose wrapping). Drop to the native driver for bulk performance or rare operators Mongoose wraps awkwardly. Mongoose enforces the schema Node-side; MongoDB also supports **JSON-schema validators** at collection level for defense in depth.",
  },
  {
    category: "mongodb",
    id: "mongo-replication",
    title: "Replica sets, read/write concern & failover",
    summary:
      "Primary/secondary, w:majority, read preference, retryable writes.",
    tags: ["replication", "ha", "concern"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Configure a 3-node replica set for a fintech service: what write concern and read concern do you choose for a payment, and how do you route analytics reads? What does the app see during failover?",
    evaluatorNotes:
      "**3-node replica set** = 1 primary + 2 secondaries (odd count for clean elections, minimum for true HA). Writes go to primary and replicate via **oplog** (capped collection); if the primary dies, the secondary with the freshest oplog wins an election in ~10–30 s. **Write concern:** `w: 1` default (primary ack), **`w: 'majority'` + `j: true`** for money—survives primary crash. **Read concern:** `'local'` default (may see rolled-back data), **`'majority'`** for reads that must see committed state, `'snapshot'` only in transactions. **Read preference:** `primary` (default, consistent), `primaryPreferred`, `secondary(Preferred)`, `nearest` + tag sets (route heavy analytics to a tagged analytics secondary). Secondary reads can be **milliseconds to seconds stale**—never for balances or auth. **`retryWrites=true`** (default in modern drivers) + idempotency makes single-statement writes safe across transient network / failover events. Application should expect ~30 s of write unavailability during failover and retry with backoff.",
  },
  {
    category: "mongodb",
    id: "mongo-sharding",
    title: "Sharding & shard key choice",
    summary:
      "High-cardinality shard keys, hashed vs range, zone sharding.",
    tags: ["sharding", "scale", "shard-key"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Design sharding for a global orders collection: pick a shard key, justify hashed vs range, avoid hot shards, and handle GDPR data residency.",
    evaluatorNotes:
      "Shard first = shard wrong: scale vertically, add replicas, and cache before introducing `mongos` + config servers. A good shard key has **high cardinality**, **even distribution**, and **aligns with common queries** (so targeted queries hit one shard; unmatched queries become expensive **scatter-gather**). Canonical bad keys: low-cardinality (`status`), monotonic (`createdAt`, `_id` raw — writes all hit one shard). **Hashed shard keys** give even writes (good) but kill range queries. **Compound** shard keys (e.g. `{ customerId: 1, _id: 1 }`) get isolation + freshness. **Chunks** (default 128 MB) split and the **balancer** moves them—pause the balancer during big imports. **Zone sharding** pins ranges of the shard key to tagged shards (e.g. `region: 'EU'` → EU shards) for **GDPR/data residency**. **Shard key is immutable** (in practice you re-create the collection)—design carefully.",
  },
  {
    category: "mongodb",
    id: "mongo-transactions",
    title: "Transactions & consistency",
    summary:
      "Single-doc atomicity, multi-doc ACID, retry on transient errors.",
    tags: ["transactions", "acid", "consistency"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Implement a money transfer between two accounts with correctness guarantees. Explain why you'd still design the schema to avoid transactions where possible.",
    evaluatorNotes:
      "**Every operation on a single document is atomic**—lean on this: embed related data and use `$inc`, `$push`, `$set` for atomic multi-field updates on one doc. **Multi-document transactions** (4.0+ on replica sets; 4.2+ on sharded clusters) use **snapshot isolation** with `session.withTransaction(async () => ...)`; pass `{ session }` to every operation. **Write-write conflicts** surface as `WriteConflictError` / `TransientTransactionError`—**always retry** with exponential backoff; `withTransaction` retries automatically for transient labels. Don't retry on validation/duplicate-key errors. Guard invariants in the `filter` (e.g. `{ _id: fromId, balance: { $gte: amount } }`) so the operation fails cleanly when funds are insufficient. Transactions cost latency (majority acks, locks) and add operational complexity—prefer single-document atomicity via embedding whenever correctness allows. Use `w: 'majority', j: true` for durability and `readConcern: 'snapshot'` inside transactions.",
  },
  {
    category: "mongodb",
    id: "mongo-pagination",
    title: "Pagination: skip/limit vs cursor",
    summary:
      "Why skip(100000) is O(n); cursor pagination with tiebreaker; $facet.",
    tags: ["pagination", "performance", "cursor"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Paginate a 10M-document feed efficiently. Use cursor pagination with a stable secondary sort, and return `data + total` in one query when the UI actually needs a page count.",
    evaluatorNotes:
      "`skip(N)` is **O(N)**—it reads and discards N docs; page 1000 of a large list becomes unusable. **Cursor (range) pagination** uses the last doc's key as a filter (`{ _id: { $lt: lastId } }`) and is **O(log n)** via the index. For non-`_id` sort, include a **tiebreaker**: `.sort({ price: -1, _id: -1 })` with a compound `$or` cursor `{ $or: [{ price: { $lt: lastPrice } }, { price: lastPrice, _id: { $lt: lastId } }] }`—otherwise ties produce duplicates/gaps. Cursor pagination is also **consistent** with concurrent inserts. When the UI genuinely needs a total, **`$facet`** returns `data + count` in **one** round trip. Index must cover the sort order (`{ price: -1, _id: -1 }`). Always `.lean()` and project only needed fields for list endpoints.",
  },
  {
    category: "mongodb",
    id: "mongo-change-streams-ttl",
    title: "Change streams, TTL & capped collections",
    summary:
      "Real-time events, auto-expiring data, log-buffer collections.",
    tags: ["change-streams", "ttl", "capped"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Build three things: a real-time notifier that reacts to order updates, automatic cleanup of expired sessions/OTPs, and a bounded log store for the last 10k events.",
    evaluatorNotes:
      "**Change streams** read the oplog under the hood: `Model.watch(pipeline, { fullDocument: 'updateLookup' })` delivers `{ operationType, documentKey, fullDocument, updateDescription }`. Require a **replica set** (or sharded cluster). Persist the last `resumeToken` so you can reconnect after a restart (`{ resumeAfter: token }`). Use cases: cache invalidation, sync to Elasticsearch/Meilisearch, push notifications, event-driven services—no polling. **TTL indexes:** index a `Date` field with `expireAfterSeconds: 0` (expire at the date value) or `expireAfterSeconds: N` (N seconds after the date). Cleanup runs in background every ~60 s—perfect for sessions/OTPs/password-reset tokens; extend sessions by updating the date. **Capped collections** are fixed-size, FIFO, very fast, no individual delete—ideal for log rings and **tailable cursors** for `tail -f`-style streaming. Beware the oplog window: size it so secondaries can catch up after downtime without a full resync.",
  },
];
