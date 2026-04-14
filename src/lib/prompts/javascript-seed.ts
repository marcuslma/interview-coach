import type { PracticePrompt } from "./types";

/** JavaScript only — execution order, semantics, complexity */
export const JAVASCRIPT_PROMPTS: PracticePrompt[] = [
  {
    category: "javascript",
    id: "js-event-loop-ordering",
    title: "Event loop & print order",
    summary:
      "console.log, microtasks, macrotasks, async/await — predict execution order.",
    tags: ["ordering", "async"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Practice predicting what prints first: synchronous code, Promises, queueMicrotask, setTimeout, await, and timers at a conceptual level.",
    evaluatorNotes:
      "Use short snippets. Always teach or name **microtasks vs macrotasks** when Promises/setTimeout appear. After each answer: explain *why*, ask the candidate *why*, then offer a slightly harder snippet. Include at least one snippet mixing sync + Promise + setTimeout(0).",
  },
  {
    category: "javascript",
    id: "js-references-mutation",
    title: "References, assignment & mutation",
    summary: "What does B hold after A changes? Objects, arrays, primitives.",
    tags: ["semantics", "mutation"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Drill shared references, reassignment vs mutating properties, shallow copies, and const with mutable values.",
    evaluatorNotes:
      "Ask: given A and B = A or B = [...A], what changes when A is reassigned or mutated? Use small examples.",
  },
  {
    category: "javascript",
    id: "js-closures-scope",
    title: "Closures & lexical scope",
    summary: "What does a nested function close over? Classic loop/var pitfalls.",
    tags: ["closures", "scope"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Practice closures, lexical environment, and common interview gotchas (var in loops, parameters vs outer bindings).",
    evaluatorNotes:
      "Short functions with inner functions or loops. Ask what prints or final values. Include let vs var in loops when appropriate.",
  },
  {
    category: "javascript",
    id: "js-this-binding",
    title: "`this` binding",
    summary: "How `this` is resolved in methods, arrows, call/apply, and classes.",
    tags: ["this", "semantics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict behavior when functions are passed around, bound, or called as methods.",
    evaluatorNotes:
      "Use 5-15 line snippets. Ask what `this` refers to or what logs. Cover implicit binding, arrow lexical this, and explicit bind.",
  },
  {
    category: "javascript",
    id: "js-big-o-from-code",
    title: "Time & space from code",
    summary: "Big-O of loops, nested structures, and hidden costs.",
    tags: ["complexity", "big-o"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Given iterative or small recursive snippets, state time and space complexity and name dominant terms.",
    evaluatorNotes:
      "Ask for Big-O then **one concrete optimization** (e.g. Set for lookups). Focus on reasoning.",
  },
  {
    category: "javascript",
    id: "js-array-object-methods",
    title: "Array/object built-ins & chaining",
    summary: "map/filter/reduce behavior, shallow copies, and accidental complexity.",
    tags: ["collections", "complexity"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Understand what map/filter/reduce return, mutation vs immutability, and when chaining creates extra passes.",
    evaluatorNotes:
      "Ask complexity of chained operations vs single pass. Include reduce accumulator pitfalls.",
  },
  {
    category: "javascript",
    id: "js-promises-async-await",
    title: "Promises & async/await sequencing",
    summary: "Order of awaits, parallel vs sequential, error propagation.",
    tags: ["async", "ordering"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Trace async functions: await boundaries, Promise.all vs sequential awaits, and unhandled rejections at concept level.",
    evaluatorNotes:
      "Print-order questions with async IIFE patterns. Explain why after each answer.",
  },
  {
    category: "javascript",
    id: "js-equality-coercion",
    title: "Equality & coercion (gotchas)",
    summary: "== vs ===, object equality, and tricky comparisons.",
    tags: ["semantics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict outcomes of comparisons and Boolean(...) coercions in small expressions.",
    evaluatorNotes:
      "Keep it short and professional. Prefer === in solutions but test understanding of == when relevant.",
  },
  {
    category: "javascript",
    id: "js-memory-gc-lite",
    title: "Garbage collection & closures (lite)",
    summary: "What stays alive? Practical retention scenarios.",
    tags: ["memory", "semantics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Reason about what objects remain reachable when closures or caches hold references.",
    evaluatorNotes:
      "Conceptual level. Ask whether a large array can be collected in a given pattern.",
  },
  {
    category: "javascript",
    id: "algo-optimize-loop",
    title: "Spot the inefficiency",
    summary: "Find redundant work and improve asymptotic or constant factors.",
    tags: ["optimization", "complexity"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Given a working but slow snippet, identify the bottleneck and suggest a better approach.",
    evaluatorNotes:
      "Classic nested find in loop → map/Set. Ask for **before/after complexity** and trade-offs.",
  },
  {
    category: "javascript",
    id: "js-modules-scope-runtime",
    title: "Modules & scope (conceptual)",
    summary: "ES modules: live bindings vs copies, scope puzzles.",
    tags: ["modules", "semantics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "High-level questions about ES modules and one-file scope puzzles.",
    evaluatorNotes:
      "Avoid bundler-specific details unless labeled. Keep snippets hypothetical and small.",
  },
];
