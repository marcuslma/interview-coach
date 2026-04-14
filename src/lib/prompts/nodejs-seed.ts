import type { PracticePrompt } from "./types";

export const NODEJS_PROMPTS: PracticePrompt[] = [
  {
    category: "nodejs",
    id: "node-event-loop-libuv",
    title: "Event loop & libuv (conceptual)",
    summary: "How Node handles I/O, timers, and the thread pool.",
    tags: ["runtime", "async"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Explain phases relevant to Node: timers, pending callbacks, poll, check, close—at interview depth, not kernel trivia.",
    evaluatorNotes:
      "Contrast CPU-bound vs I/O-bound work. Ask why blocking the event loop is bad. Use small setTimeout/fs pseudo-examples.",
  },
  {
    category: "nodejs",
    id: "node-streams-backpressure",
    title: "Streams & backpressure",
    summary: "Readable, writable, piping, handling slow consumers.",
    tags: ["streams", "io"],
    primaryLanguage: "javascript",
    candidateBrief:
      "When to use streams vs buffering entire files; how backpressure works conceptually.",
    evaluatorNotes:
      "Ask for a sketch of piping fs.createReadStream to http response. Mention highWaterMark at high level.",
  },
  {
    category: "nodejs",
    id: "node-modules-resolution",
    title: "Modules: CJS vs ESM in Node",
    summary: "require vs import, __dirname in ESM, package exports.",
    tags: ["modules", "interop"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Interoperability, when .mjs matters, and practical migration pitfalls.",
    evaluatorNotes:
      "Avoid deep Node version matrix; focus on concepts. Short Q&A or tiny snippets.",
  },
  {
    category: "nodejs",
    id: "node-cluster-worker",
    title: "Scaling: cluster & worker threads (lite)",
    summary: "When to fork processes vs use worker threads.",
    tags: ["scaling", "threads"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Use cases for child_process, cluster module, and worker_threads—strengths and limits.",
    evaluatorNotes:
      "CPU-bound vs shared memory. No need for full code of cluster—conceptual interview depth.",
  },
  {
    category: "nodejs",
    id: "node-buffer-binary",
    title: "Buffers & binary data",
    summary: "Buffer vs Uint8Array, encoding, when to use Buffer.alloc.",
    tags: ["buffers", "encoding"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Read/write binary safely; understand encodings for strings.",
    evaluatorNotes:
      "Small Buffer examples. Ask about security of Buffer.allocUnsafe vs alloc.",
  },
  {
    category: "nodejs",
    id: "node-process-env-cli",
    title: "process, env, and CLI patterns",
    summary: "argv, env vars, exit codes, uncaughtException.",
    tags: ["process", "cli"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Structure a small CLI tool: config from env, graceful shutdown.",
    evaluatorNotes:
      "Ask about signal handlers (SIGTERM) and why process.on('uncaughtException') is not a substitute for fixing bugs.",
  },
];
