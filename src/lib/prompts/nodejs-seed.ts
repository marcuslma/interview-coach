import type { PracticePrompt } from "./types";

/**
 * Node.js — runtime, async model, streams, scaling, memory, and production concerns.
 * Scenarios reflect the topics most often asked in real Node.js interviews:
 * event loop phases, nextTick vs setImmediate, backpressure, worker_threads,
 * graceful shutdown, AsyncLocalStorage, memory leaks, and stateless scaling.
 */
export const NODEJS_PROMPTS: PracticePrompt[] = [
  {
    category: "nodejs",
    id: "node-event-loop-libuv",
    title: "Event loop, libuv & thread pool",
    summary:
      "6 event loop phases, what blocks it, and what actually uses the thread pool.",
    tags: ["runtime", "async", "libuv"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Explain how Node handles async I/O: the event loop phases, the libuv thread pool, and when JavaScript is (or isn't) the bottleneck.",
    evaluatorNotes:
      "Name the 6 phases in order: **timers → pending callbacks → idle/prepare → poll → check → close**, with the **microtask drain rule** between phases (process.nextTick queue first, then Promise microtasks, before moving on). Clarify what goes through the **libuv thread pool** (default size 4, tunable via `UV_THREADPOOL_SIZE`): `fs`, `crypto.pbkdf2`/`bcrypt`, `dns.lookup`, some native addons. **Network I/O** uses OS async (epoll/kqueue/IOCP)—no thread pool. Drill the **50 ms rule**: any sync operation >50 ms starves every other request. Ask how the candidate would detect event loop lag (`monitorEventLoopDelay`, clinic doctor). Use 5–15 line snippets.",
  },
  {
    category: "nodejs",
    id: "node-nexttick-setimmediate",
    title: "process.nextTick vs setImmediate vs setTimeout",
    summary:
      "Priority order and the canonical Node output question.",
    tags: ["async", "event-loop", "timers"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict execution order of `process.nextTick`, Promise microtasks, `setImmediate`, and `setTimeout(fn, 0)` inside and outside an I/O callback.",
    evaluatorNotes:
      "Priority at top level: **sync → process.nextTick → Promise.then → setImmediate → setTimeout(0)**. Inside an **I/O callback** (e.g. `fs.readFile` completion), `setImmediate` fires **before** `setTimeout(0)` deterministically. Ask for the classic output puzzle mixing all four, then add a microtask that schedules a `nextTick` (nextTick queue drains fully before Promise microtasks resume). Probe the Zalgo pattern: always-async APIs should wrap the sync path with `process.nextTick` to avoid inconsistent callback timing. Warn about **recursive `process.nextTick`** starving I/O—use `setImmediate` to yield.",
  },
  {
    category: "nodejs",
    id: "node-streams-backpressure",
    title: "Streams, backpressure & pipeline",
    summary:
      "Readable/Writable/Duplex/Transform, highWaterMark, and why pipeline() beats pipe().",
    tags: ["streams", "io", "backpressure"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Design a streaming pipeline for a large file (read → transform → write). Explain backpressure, `highWaterMark`, and why `pipeline()` is preferred over `.pipe()` in production.",
    evaluatorNotes:
      "Four stream types: **Readable, Writable, Duplex, Transform**. Backpressure: `writable.write()` returns `false` when the internal buffer passes `highWaterMark`; `.pipe()` auto-pauses/resumes but does **not** propagate errors or clean up all streams on failure. **Prefer `stream.pipeline`** (or `stream/promises.pipeline`)—handles backpressure **and** destroys all streams on error. Ask for a sketch: `fs.createReadStream → zlib.createGzip → fs.createWriteStream` or streaming an HTTP response. Mention async iteration (`for await (const chunk of stream)`) for readable streams in Node 10+. Keep examples short; don't require full custom Transform classes unless the candidate goes there.",
  },
  {
    category: "nodejs",
    id: "node-buffer-binary",
    title: "Buffers & binary data",
    summary:
      "Buffer vs Uint8Array, encodings, and Buffer.alloc vs allocUnsafe.",
    tags: ["buffers", "encoding", "security"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Work with binary data: create Buffers, convert encodings (utf8/base64/hex), and reason about the security implication of `Buffer.allocUnsafe`.",
    evaluatorNotes:
      "`Buffer.alloc(n)` is zero-filled (safe). `Buffer.allocUnsafe(n)` is faster but may contain **arbitrary memory** from prior allocations—if that leaks to the network it's a security bug; fill before reading. `Buffer.from(string, encoding)` for construction. Common conversions: base64 (JWT, file uploads, Basic auth), hex (hashes, IDs). Stream chunks default to `Buffer` unless `objectMode: true`. Compare via `a.equals(b)` (content) not `===` (reference). Mention `Buffer.concat` and that `Buffer` extends `Uint8Array`. Short examples only.",
  },
  {
    category: "nodejs",
    id: "node-cluster-worker",
    title: "Cluster vs worker_threads",
    summary:
      "Processes for I/O scaling, threads for CPU—and PM2 on top.",
    tags: ["scaling", "cluster", "threads"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Pick between the `cluster` module and `worker_threads` for a given workload, and explain how PM2 fits in.",
    evaluatorNotes:
      "`cluster` forks N Node **processes** sharing a listening port (round-robin on Linux). Goal: use all CPU cores for I/O-bound work and crash isolation. **`worker_threads`** run in the **same process** with their own V8 isolate; use for CPU-bound tasks and share memory via `SharedArrayBuffer` + `Atomics`. IPC between cluster workers goes through master (JSON). Ask when cluster isn't enough (CPU-bound endpoint → offload to worker thread). Mention **PM2** (`pm2 start app.js -i max`) for production: cluster + zero-downtime `pm2 reload` + restarts + logs. Expect architecture-level answers, not full code.",
  },
  {
    category: "nodejs",
    id: "node-event-emitter",
    title: "EventEmitter patterns",
    summary:
      "on/once/emit, the special 'error' event, and listener leaks.",
    tags: ["events", "patterns"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Design a small pub/sub using `EventEmitter`, and explain the `error` event contract, `once`, and the `MaxListenersExceeded` warning.",
    evaluatorNotes:
      "Core API: `on` (persistent), `once` (auto-removed), `emit` (sync, in-order), `off` / `removeAllListeners`, `listenerCount`. **Unhandled `error` event throws**—always attach an `error` listener on EventEmitters (streams, sockets, DB clients, process). Default **max 10 listeners** per event; `setMaxListeners(n)` when justified. The `MaxListenersExceededWarning` is usually a leak (adding listeners in a loop or on every request). Streams, `net.Socket`, `http.Server`, `process` all extend EventEmitter—this is why the pattern is everywhere. Small snippet: a service emitting `payment:success` / `payment:failed` with two subscribers.",
  },
  {
    category: "nodejs",
    id: "node-error-handling",
    title: "Error handling: async, uncaught & unhandled",
    summary:
      "try/catch + .catch(), operational vs programmer errors, process.on last resort.",
    tags: ["errors", "async", "reliability"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Handle errors correctly across async/await, Promises, and streams. Explain when `process.on('uncaughtException')` is acceptable and when to let the process crash.",
    evaluatorNotes:
      "Distinguish **operational errors** (expected: ENOENT, ECONNREFUSED, 4xx/5xx upstream) from **programmer errors** (bugs: TypeError, undefined access). Patterns: try/catch around `await`, `.catch()` on standalone chains, `'error'` listener on streams/EE. Common bug: `await` in `forEach` doesn't wait—use `for...of` or `Promise.all(array.map(...))`. `process.on('unhandledRejection')` and `process.on('uncaughtException')` are **last-resort log-and-exit**, not recovery (Node 15+ crashes on unhandledRejection by default). Mention ESLint `no-floating-promises` to catch these at lint time. `util.promisify` to lift legacy callback APIs. Short, realistic snippets.",
  },
  {
    category: "nodejs",
    id: "node-graceful-shutdown",
    title: "Graceful shutdown & process signals",
    summary:
      "SIGTERM/SIGINT, drain in-flight requests, close DB/Redis, force-exit timeout.",
    tags: ["production", "signals", "reliability"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Implement graceful shutdown for a Node HTTP service: stop accepting connections, drain in-flight work, close DB and Redis, and exit cleanly under a Kubernetes `SIGTERM`.",
    evaluatorNotes:
      "Order of operations: set a `shuttingDown` flag (503 new requests with `Connection: close`) → `server.close()` to stop accepting → wait for in-flight to drain → close DB, Redis, queue consumers → `process.exit(0)`. Always set a **force-exit timer** (e.g. 30 s) with `.unref()` so a stuck connection can't block shutdown forever. Handle both **`SIGTERM`** (K8s/Docker) and **`SIGINT`** (Ctrl+C). **`SIGKILL` cannot be caught**—K8s sends it after `terminationGracePeriodSeconds`. Mention zero-downtime reload via PM2 (`pm2 reload`). The `'exit'` event is **sync only**—use signals for async cleanup.",
  },
  {
    category: "nodejs",
    id: "node-async-localstorage",
    title: "AsyncLocalStorage & request context",
    summary:
      "Propagate requestId/userId through async chains without prop drilling.",
    tags: ["context", "async_hooks", "observability"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Use `AsyncLocalStorage` to attach a requestId (and userId) to every log line in a request, without threading it through every function call.",
    evaluatorNotes:
      "API: `store.run(value, callback)` sets context for the async chain; `store.getStore()` reads it from anywhere inside. Available since Node 12.17. Propagates through `await`, callbacks, timers, and EventEmitter-driven flows. Typical usage: Express middleware that generates a requestId and calls `als.run({ requestId, userId }, next)`; a structured logger reads the store and injects it into every entry. Contrast with alternatives (passing context everywhere, `cls-hooked`). Mention the small overhead, but that observability tools (OpenTelemetry, pino-http) rely on it.",
  },
  {
    category: "nodejs",
    id: "node-memory-leaks-perf",
    title: "Memory leaks, event loop lag & profiling",
    summary:
      "Spot leaks, measure loop lag, pick the right profiler.",
    tags: ["memory", "performance", "profiling"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Diagnose a Node service whose heap grows over time and whose p95 latency creeps up. Name the tools you'd use and the fixes for common leak patterns.",
    evaluatorNotes:
      "Most common leaks: listeners not removed, `setInterval` not cleared, growing in-memory caches without TTL/size (fix with `lru-cache` or `WeakMap`), closures retaining large blobs. Detect growth with `process.memoryUsage()` over time and **heap snapshots** (Chrome DevTools comparison view). **Event loop lag** via `perf_hooks.monitorEventLoopDelay` (p50/p95/p99 in ns)—alert when p95 > 50 ms. Tools: `clinic doctor` (overall health), `clinic flame` / `0x` (CPU flame graph), `--inspect` + Chrome DevTools. GC pauses can look like blocking—observe `gc` performance entries. Keep the scenario realistic (one endpoint slow, others fine) and probe reasoning, not trivia.",
  },
  {
    category: "nodejs",
    id: "node-scaling-stateless",
    title: "Horizontal scaling & stateless design",
    summary:
      "Move sessions/caches/rate-limits out of memory; load balance Node.",
    tags: ["scaling", "architecture", "redis"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Take a single-instance Express app and prepare it for N replicas behind a load balancer. What breaks, what moves to Redis, and what does the LB need to know?",
    evaluatorNotes:
      "Anything in process memory breaks: `express-session` MemoryStore → Redis store or JWT; in-memory rate limiter → Redis-backed (sliding window); in-process caches → Redis; local disk uploads → S3/GCS; background timers → queue (BullMQ/Kafka) with a dedicated worker. Node must honor **`X-Forwarded-For`**: `app.set('trust proxy', 1)` so `req.ip` is the real client. Provide a `/health` (fast) and a `/ready` (503 until DB/Redis connected) for load balancer probes. Mention sticky sessions only as a temporary workaround, not a design. Nginx/ALB in front can handle TLS, gzip, and slow-client buffering so Node connections stay short-lived.",
  },
  {
    category: "nodejs",
    id: "node-modules-resolution",
    title: "Modules: CJS vs ESM in Node",
    summary:
      "require vs import, live bindings, top-level await, caching, __dirname in ESM.",
    tags: ["modules", "esm", "cjs"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Explain interop between CommonJS and ES Modules in Node, when `.mjs` or `\"type\": \"module\"` matters, and the `__dirname` story in ESM.",
    evaluatorNotes:
      "CJS: `require` is **sync + dynamic** (callable anywhere), exports are **value copies**, modules are **cached** after first load (`require.cache` keyed by resolved path—the reason singletons work). ESM: `import` is **static + async**, gives **live bindings**, enables **tree shaking** and **top-level await** (only in ESM). In ESM, `__dirname`/`__filename` don't exist—reconstruct from `import.meta.url` via `fileURLToPath`. Interop: ESM can import default/namespace from CJS, CJS can use dynamic `import()` to load ESM. Circular requires in CJS yield a **partially populated** `exports`—usually a design smell. Mention `require.main === module` for dual script/module files.",
  },
  {
    category: "nodejs",
    id: "node-process-env-cli",
    title: "process, env & CLI patterns",
    summary:
      "argv, validated env, exit codes, signals, promisify.",
    tags: ["process", "cli", "config"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Structure a small Node CLI/service: parse `argv`, validate environment variables at startup, handle signals, and promisify a legacy callback API.",
    evaluatorNotes:
      "`process.argv` skipping [0]=node, [1]=script. Validate env at startup with **Zod/Joi**—crash fast if `JWT_SECRET` is missing rather than run insecurely. Never expose env values to clients (they often contain credentials). Exit codes: 0 success, non-zero error; `process.exitCode = 1` lets natural exit happen while signalling failure. Signals: `SIGTERM` (orchestrator), `SIGINT` (Ctrl+C), `SIGHUP` (optional config reload). `util.promisify(fn)` turns error-first callbacks into awaitable functions (core `fs`, older DB drivers). Use `timers/promises` (`await setTimeout(ms)`) instead of wrapping `setTimeout` by hand.",
  },
];
