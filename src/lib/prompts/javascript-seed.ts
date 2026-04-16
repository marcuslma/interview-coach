import type { PracticePrompt } from "./types";

/**
 * JavaScript only — language semantics, execution model, data, and complexity.
 * Scenarios align with topics seen in real FAANG/startup interviews (output
 * questions, "why does this print X?", short refactors with before/after Big-O).
 */
export const JAVASCRIPT_PROMPTS: PracticePrompt[] = [
  {
    category: "javascript",
    id: "js-event-loop-ordering",
    title: "Event loop & print order",
    summary:
      "console.log, microtasks, macrotasks, async/await — predict execution order.",
    tags: ["ordering", "async", "event-loop"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict what prints first when synchronous code, Promises, queueMicrotask, setTimeout, and await are mixed. Reason about the call stack, Web APIs, microtask queue, and macrotask queue.",
    evaluatorNotes:
      "Drill the core rule: after the stack empties, ALL microtasks drain before ANY macrotask runs; microtasks added inside microtasks still run first. Always name **microtasks vs macrotasks** when Promises/setTimeout appear. Include at least one snippet mixing sync + Promise.then + setTimeout(0); optionally add `queueMicrotask`. For Node.js depth: `process.nextTick` runs before Promise microtasks; `setImmediate` vs `setTimeout(..., 0)` order is only deterministic inside an I/O callback (setImmediate first). After each answer: explain *why*, ask the candidate *why*, then offer a slightly harder snippet.",
  },
  {
    category: "javascript",
    id: "js-hoisting-tdz",
    title: "Hoisting, var/let/const & TDZ",
    summary:
      "What gets hoisted, the Temporal Dead Zone, and why var still bites.",
    tags: ["hoisting", "scope", "semantics"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Explain which declarations are hoisted and how (`var` initialized to undefined, `function` fully hoisted, `let`/`const`/`class` in the TDZ). Predict the output of snippets that read variables before their declaration line.",
    evaluatorNotes:
      "Cover: `var` is function-scoped + initialized to undefined on hoist; `let`/`const` are hoisted but in **TDZ** until initialization (accessing throws ReferenceError); function declarations are fully hoisted; function expressions and arrow functions are not. Ask for the output of `console.log(x); var x = 1;` vs `console.log(x); let x = 1;`. Probe `typeof undeclared` (safe) vs `typeof x` while x is in TDZ (ReferenceError). Keep snippets under 10 lines.",
  },
  {
    category: "javascript",
    id: "js-references-mutation",
    title: "References, assignment & mutation",
    summary:
      "What does B hold after A changes? Primitives vs objects, cloning.",
    tags: ["semantics", "mutation", "cloning"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Drill copy-by-value (primitives) vs copy-by-reference (objects/arrays), shallow vs deep copies, and the behavior of `const` with mutable values. Reason about mutating function arguments.",
    evaluatorNotes:
      "Classic pattern: `B = A` for array/object; then mutate vs reassign A. Ask what `const` protects (binding, not contents). Cover shallow copies: `{ ...obj }`, `Object.assign`, `[...arr]`, `arr.slice()`—all leave nested refs shared. Introduce deep copy options: `structuredClone` (preferred, handles Map/Set/circular), `JSON.parse(JSON.stringify(...))` (loses functions, Date→string, Symbol, undefined, throws on cycles). Use 5–10 line examples; avoid framework context.",
  },
  {
    category: "javascript",
    id: "js-closures-scope",
    title: "Closures & lexical scope",
    summary:
      "What does a nested function close over? Classic loop/var pitfalls.",
    tags: ["closures", "scope"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Practice closures, lexical environment, and canonical interview puzzles (var in loops, module-pattern counters, factory functions).",
    evaluatorNotes:
      "Run the canonical `for (var i=0;i<3;i++) setTimeout(()=>console.log(i),0)` → prints 3,3,3; ask for **three** fixes (let, IIFE capturing i, bind, forEach closure). Probe closures for data encapsulation (counter with `increment`/`getValue`/`reset`); ask what is truly private. Emphasize **lexical** scope (where the function is written, not called). Keep snippets small; explain after each answer.",
  },
  {
    category: "javascript",
    id: "js-this-binding",
    title: "`this` binding rules",
    summary:
      "new, explicit (call/apply/bind), implicit, default, and arrow rules.",
    tags: ["this", "semantics", "bind"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict `this` when functions are called as methods, detached, via `call`/`apply`/`bind`, with `new`, or as arrow functions. Explain the priority order.",
    evaluatorNotes:
      "Name the **5 rules** in priority order: 1) `new`, 2) explicit (call/apply/bind), 3) implicit (`obj.method()`), 4) default (undefined in strict, global in sloppy), 5) arrow (lexical — no own `this`, ignored by call/apply/bind). Classic detached-method bug: `const f = obj.method; f()` loses `this`. Class + `setTimeout(() => this.x, 0)` with arrow works; with `function() { this.x }` fails. `call` vs `apply` vs `bind`: apply takes array, bind returns new function and supports partial application. Use 5–15 line snippets.",
  },
  {
    category: "javascript",
    id: "js-prototypes-inheritance",
    title: "Prototypes, classes & inheritance",
    summary:
      "Prototype chain, `Object.create`, ES6 `class`, `extends`, and `new`.",
    tags: ["prototype", "oop", "class"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Trace how property lookup walks the prototype chain, explain what `new` does, and compare constructor functions, `Object.create`, and ES6 `class`/`extends`.",
    evaluatorNotes:
      "Ask what `new Fn()` does step by step (new object → proto = Fn.prototype → run with `this` → return object unless constructor returns an object). Draw the chain for `[].map`: `arr → Array.prototype → Object.prototype → null`. Probe `class` as sugar: methods live on the prototype, `extends`/`super`, private `#fields`, static methods. Why arrow functions can't be constructors (no `[[Construct]]`, no `prototype`). Tiny snippets (≤15 lines); avoid full OOP hierarchies.",
  },
  {
    category: "javascript",
    id: "js-promises-async-await",
    title: "Promises & async/await sequencing",
    summary:
      "Order of awaits, parallel vs sequential, error propagation, common bugs.",
    tags: ["async", "ordering", "await"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Trace async functions: await boundaries, accidental sequential awaits, error handling with try/catch vs `.catch()`, and unhandled rejections.",
    evaluatorNotes:
      "Classic bug #1: `await` in `forEach` — does NOT wait (forEach ignores returned promises); fix with `for...of`, `Promise.all`, or `map + Promise.all`. Classic bug #2: accidental sequential `await`s when independent (`const a = await f(); const b = await g()`) — `Promise.all([f(), g()])` halves latency. Error handling: try/catch around `await`, `.catch()` on the returned Promise, `return` vs not returning a Promise inside `.then()`. Print-order snippets should mix sync + microtask + macrotask. Mention that `async` functions always return a Promise (value is wrapped).",
  },
  {
    category: "javascript",
    id: "js-promise-combinators",
    title: "Promise.all / allSettled / race / any",
    summary:
      "Four combinators — when each is correct and how failure propagates.",
    tags: ["async", "promises", "combinators"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Pick the right combinator for a scenario (all-or-nothing, best-effort, timeout, fastest success) and reason about what each returns and rejects with.",
    evaluatorNotes:
      "Contrast: `Promise.all` — all fulfill or first rejection wins. `Promise.allSettled` — never rejects; returns `{status, value|reason}[]`. `Promise.race` — first to **settle** (fulfill OR reject). `Promise.any` (ES2021) — first to **fulfill**; rejects with `AggregateError` only if ALL reject. Real pattern: `Promise.race([fetchData(), timeout])` for timeouts. Ask for the shape of the result array/error. Keep examples to 5–10 lines.",
  },
  {
    category: "javascript",
    id: "js-equality-coercion",
    title: "Equality & coercion (gotchas)",
    summary:
      "== vs ===, Object.is, truthy/falsy list, tricky comparisons.",
    tags: ["semantics", "coercion", "equality"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Predict outcomes of `==`/`===`/`Object.is` comparisons and boolean coercions across primitive edge cases.",
    evaluatorNotes:
      "Memorize the 8 falsy values: `false, 0, -0, 0n, '', null, undefined, NaN` (everything else truthy—including `'0'`, `[]`, `{}`, `'false'`). `==` coerces; `===` doesn't. `NaN === NaN` is false (use `Number.isNaN`). `null == undefined` is true; `null == 0` is false (special rule). `Object.is(NaN, NaN)` is true and `Object.is(+0, -0)` is false—used by React for state bailout. `value == null` catches both null and undefined (the one justified `==` use). `??` vs `||` (nullish only falls back for null/undefined).",
  },
  {
    category: "javascript",
    id: "js-es6-syntax",
    title: "ES6+ syntax (destructuring, spread, ?., ??)",
    summary:
      "Destructuring, spread/rest, optional chaining, nullish coalescing, defaults.",
    tags: ["es6", "syntax", "destructuring"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Read and refactor concise modern JS: object/array destructuring with defaults and rename, spread vs rest, safe navigation with `?.` and defaults with `??`.",
    evaluatorNotes:
      "Probe subtle differences: spread in CALLS/literals expands; rest in DEFINITIONS collects. Default parameters fire **only** for `undefined` (not `null`, `0`, `''`). `??` falls back only for `null`/`undefined` (so `0 ?? 'd'` is `0`, but `0 || 'd'` is `'d'`). Short-circuit: `user?.profile?.name ?? 'Anonymous'`. Swap with `[a,b] = [b,a]`. Keep snippets 3–8 lines; ask candidate to predict output and then rewrite in pre-ES6 for contrast.",
  },
  {
    category: "javascript",
    id: "js-array-object-methods",
    title: "Array/object built-ins & chaining",
    summary:
      "map/filter/reduce behavior, immutability, accidental extra passes.",
    tags: ["collections", "complexity"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Understand what map/filter/reduce return, mutation vs returning new arrays, and when chaining vs a single pass matters for readability and performance.",
    evaluatorNotes:
      "Ask Big-O of a chain like `.filter().map().reduce()` (still O(n) but 3 passes). Probe reduce pitfalls: forgetting the initial accumulator, mutating the accumulator instead of returning new. `map`/`filter`/`slice`/`concat` return new arrays (pure); `push`/`splice`/`sort`/`reverse` mutate. `sort` default is string comparison—`[10,2,1].sort()` → `[1,10,2]`; require a compare function for numbers. Contrast `forEach` (no return, can't break) vs `for...of` (can break/return).",
  },
  {
    category: "javascript",
    id: "js-map-set-weak",
    title: "Map, Set, WeakMap & WeakSet",
    summary:
      "When to prefer over plain Object/Array; weak refs and memory.",
    tags: ["collections", "memory", "data-structures"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Pick the right collection for a task: Map vs Object, Set vs Array, and when WeakMap/WeakSet earn their complexity.",
    evaluatorNotes:
      "Map accepts any key type (object, function, NaN), preserves insertion order, has `.size`, and is optimized for frequent add/delete. Object keys coerce to string/Symbol. Set gives O(1) `has` (vs Array.includes O(n)); classic deduplication: `[...new Set(arr)]`. WeakMap keys **must be objects** and don't prevent GC—useful for metadata keyed by DOM nodes or for true private data; not iterable, no `.size`. Ask for a simple cache that auto-cleans when the key object is GC'd.",
  },
  {
    category: "javascript",
    id: "js-currying-composition",
    title: "Currying, partial application & composition",
    summary:
      "fn(a)(b)(c), partial args, and compose/pipe as data pipelines.",
    tags: ["functional", "currying", "composition"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Transform a multi-arg function into a curried one, explain partial application, and compose small pure functions into a pipeline with `pipe`/`compose`.",
    evaluatorNotes:
      "Hand-curry `add(a,b,c)` → `a => b => c => a+b+c`. Show auto-curry using `fn.length`. Partial application: `const addFive = add.bind(null, 5)`. `pipe(f,g,h)(x) = h(g(f(x)))` (left-to-right, more readable); `compose` is right-to-left. Ask for a small data-cleanup pipeline (trim → lowercase → replace spaces). Probe when currying/composition add value vs. when they obscure intent.",
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
      "Ask for Big-O then **one concrete optimization** (e.g. Set for O(1) lookup, precomputing a frequency map, early exit). Hidden costs to surface: `includes`/`indexOf` inside a loop is O(n·m); `JSON.stringify` for keying is O(n); `sort` is O(n log n); spreading in a loop (`[...acc, item]`) is O(n²) vs `acc.push(item)` O(1). For recursion, separate call depth (space) from total work (time).",
  },
  {
    category: "javascript",
    id: "algo-optimize-loop",
    title: "Spot the inefficiency",
    summary: "Find redundant work and improve asymptotic or constant factors.",
    tags: ["optimization", "complexity"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Given a working but slow snippet, identify the bottleneck, propose an improvement, and state before/after complexity with trade-offs.",
    evaluatorNotes:
      "Canonical patterns: nested `find`/`includes` → Map/Set lookup (O(n·m) → O(n+m)); repeated work inside loop → hoist constants; `sort().slice(0,k)` → partial selection; re-creating regex inside a loop; `arr.length` recomputation only matters at interview depth in hot paths. Always ask for **before/after complexity** and a sentence on memory trade-off.",
  },
  {
    category: "javascript",
    id: "js-debounce-throttle",
    title: "Debounce vs throttle",
    summary:
      "Rate-limit event handlers: implement, distinguish, and pick correctly.",
    tags: ["performance", "async", "timers"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Implement `debounce(fn, ms)` and `throttle(fn, ms)`, explain the difference in one sentence, and pick the right one for search inputs, scroll, resize, and button clicks.",
    evaluatorNotes:
      "Debounce: reset a single timer on every call; fire `fn` only after `ms` of silence → good for **search inputs, form validation**. Throttle: allow at most one call per `ms` window → good for **scroll, mousemove, resize**. Ask about leading/trailing edges. Ensure `this` and args are preserved (`fn.apply(this, args)`). Common bug: calling `removeEventListener` with a different function reference than `addEventListener` (arrow recreated each render). Probe cleanup (`clearTimeout`) on unmount.",
  },
  {
    category: "javascript",
    id: "js-memory-gc-lite",
    title: "Garbage collection, closures & leaks",
    summary:
      "What stays alive? Listener leaks, timers, and AbortController.",
    tags: ["memory", "gc", "leaks"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Reason about reachability: what keeps an object alive, how closures and caches can leak, and the small set of fixes that catch most real bugs.",
    evaluatorNotes:
      "Mark-and-sweep: reachable from roots (globals, active stack, closures) → alive; otherwise collected. Common leaks: event listeners not removed on unmount, `setInterval` not cleared, accidental globals (`data = ...` without let/const in sloppy mode), caches keyed on strong object refs (use WeakMap), closures capturing large blobs when only one field is needed. Ask for fixes: cleanup returns from effects, `clearInterval`, `AbortController` for `fetch`, `once: true` listeners, and how `WeakMap` lets the key object be GC'd.",
  },
  {
    category: "javascript",
    id: "js-modules-scope-runtime",
    title: "Modules: ESM vs CommonJS",
    summary:
      "Static imports, live bindings, tree shaking, dynamic import.",
    tags: ["modules", "esm", "cjs"],
    primaryLanguage: "javascript",
    candidateBrief:
      "Contrast ES modules (`import`/`export`) with CommonJS (`require`/`module.exports`) in interview terms: loading model, bindings, tree-shaking, and dynamic imports.",
    evaluatorNotes:
      "ESM is static (resolved before execution), asynchronous, gives **live bindings** (consumer sees updated exported values), and is tree-shakeable. CJS is dynamic (`require()` anywhere), synchronous, returns a copy of exports, and not tree-shakeable. `import()` (dynamic) returns a Promise and enables code splitting. Interop pitfalls: default vs named exports when mixing; `__dirname` absent in ESM (use `import.meta.url`). Probe why named exports are preferred for tree-shaking (vs. default-exporting a big object).",
  },
];
