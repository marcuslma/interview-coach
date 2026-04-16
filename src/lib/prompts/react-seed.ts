import type { PracticePrompt } from "./types";

/**
 * React (with Redux / RTK Query where relevant). Scenarios focus on the
 * mental models interviewers probe most: JSX + reconciliation + keys,
 * state/effect correctness, stale closures, the memoization trio, React 18
 * concurrent features, forms, data fetching, and architecture choices.
 */
export const REACT_PROMPTS: PracticePrompt[] = [
  {
    category: "react",
    id: "react-jsx-reconciliation",
    title: "JSX, Virtual DOM & reconciliation",
    summary:
      "createElement under the hood, diffing heuristics, key as identity + reset.",
    tags: ["jsx", "vdom", "keys"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain what JSX compiles to, how React decides what DOM to change, and why `key` matters. Then show two bug-level consequences of using array index as key.",
    evaluatorNotes:
      "JSX → `React.createElement(type, props, ...children)` (or `jsx()` with the new runtime); it's **just JavaScript** (`className`/`htmlFor`, camelCase events, expressions in `{}`). Reconciliation is **O(n)** thanks to two heuristics: (1) **different element type → destroy and rebuild subtree** (component state is lost—e.g. `isAdmin ? <div><Form /></div> : <span><Form /></span>` remounts `Form`); (2) **siblings matched by `key`**. Without stable keys, React matches by **position** → on insert/delete, internal state of items drifts (e.g. an input's text sticks to the wrong row). Never use array index as key for reorderable lists. **Key-as-reset trick**: changing the `key` of a component unmounts + remounts it, clearing its state—useful for forms per `userId`. Fragments (`<>...</>`) avoid wrapper divs; the long form `<React.Fragment key=...>` is the only one that takes `key`.",
  },
  {
    category: "react",
    id: "react-state-props",
    title: "Props, state, lifting up & batching",
    summary:
      "State as snapshot, functional updates, React 18 auto-batching.",
    tags: ["state", "props", "batching"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Predict the output of a handler that calls `setCount(count + 1)` three times, then fix it. Lift shared state between siblings and justify the refactor.",
    evaluatorNotes:
      "**Props** are read-only inputs (parent → child); **state** is owned by one component and changing it triggers a re-render. Inside a given render, state is a **snapshot**—calling `setCount(count + 1)` three times from the same render only increments once because `count` is captured at render time; **functional updates** (`setCount(prev => prev + 1)`) use the latest queued value. Never mutate (`user.name = 'x'`) or `arr.push(...)` state—React compares by reference with `Object.is`; use spread / `map` / `filter`. **Lift state up** to the closest common ancestor when two siblings need the same value; pass down via props. **React 18 automatic batching**: all `setState` calls in the same tick are batched into one render, even in `setTimeout`/`fetch().then(...)` (escape hatch: `flushSync` when you must read DOM synchronously after an update). Enabled only via `createRoot` (not legacy `ReactDOM.render`).",
  },
  {
    category: "react",
    id: "react-hooks-rules-closures",
    title: "Rules of hooks & why they exist",
    summary:
      "Top-level-only calls, hook ordering model, no hooks in classes/events.",
    tags: ["hooks", "rules", "internals"],
    primaryLanguage: "typescript",
    candidateBrief:
      "State the two rules of hooks and explain *why* they exist (internal model). Then fix a component that calls `useState` inside an `if` block.",
    evaluatorNotes:
      "The two rules (enforced by `eslint-plugin-react-hooks`): (1) **only call hooks at the top level**—no `if`/`for`/nested functions/early returns before the hook; (2) **only call hooks inside React function components or custom hooks** (not regular JS, not class methods, not event handlers). **Why:** React tracks hook state by **call order** on each fiber (conceptually a linked list of hook nodes). If the order differs between renders, slot N returns the wrong state and the component silently corrupts. Fix conditional logic by moving the condition **inside** the hook (`const value = cond ? a : b`) rather than wrapping the hook. Custom hooks must start with `use` so lint can verify the rules. Call **early returns after all hooks** to keep ordering stable.",
  },
  {
    category: "react",
    id: "react-useeffect",
    title: "useEffect: deps, cleanup & pitfalls",
    summary:
      "Stale closures, infinite loops, useLayoutEffect, React 18 dev double-invoke.",
    tags: ["useEffect", "cleanup", "stale-closure"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Fetch a user when `userId` changes with proper cancellation, then debug a `setInterval` that logs the wrong count. Explain `useEffect` vs `useLayoutEffect`.",
    evaluatorNotes:
      "Timing: **render → commit DOM → paint → useEffect**. `useLayoutEffect` runs **synchronously after commit, before paint**—reserve for **DOM measurements** that would otherwise cause flicker. Dep rules: **every reactive value used in the body** (props, state, values derived from them, functions defined in render) must appear; `setState`/`dispatch` are stable; refs are stable (but `ref.current` isn't reactive). **Stale closure** is the #1 bug: an interval captures `count = 0` from mount. Fix with (a) functional update `setCount(c => c + 1)`, (b) add to deps, or (c) a ref holding the latest value. **Infinite loops** come from `setState` inside an effect with missing deps or with an object/array dep that's recreated each render—fix with proper deps, `useMemo`, or a module-level constant. **Cleanup** runs before the next effect and on unmount: always `clearTimeout`/`clearInterval`, `removeEventListener`, `socket.close`, `AbortController.abort()`. In **React 18 dev + StrictMode**, effects mount → unmount → mount deliberately to flush out missing cleanups.",
  },
  {
    category: "react",
    id: "react-refs-forwardref",
    title: "useRef, forwardRef & Portals",
    summary:
      "DOM refs, stable mutable storage, imperative handles, rendering outside the tree.",
    tags: ["useRef", "forwardRef", "portal"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Build a reusable `<Input>` that the parent can `.focus()`, then expose only `play`/`pause`/`seek` from a `<VideoPlayer>`. When and how would you use a Portal?",
    evaluatorNotes:
      "`useRef(initial)` returns a stable `{ current }` object; writes to `.current` **don't re-render**—great for DOM nodes, timer ids, a \"previous value\" slot, or an `isMounted` flag. `useState` vs `useRef`: re-render vs no re-render. **`forwardRef(fn)`** lets a parent pass a ref **through** to a child's DOM node; combine with **`useImperativeHandle(ref, () => ({ play, pause }))`** to expose only a curated API instead of the raw DOM node. React 19 makes `ref` a normal prop—`forwardRef` becomes unnecessary; know both APIs. **Portals** (`createPortal(child, container)`) render into a different DOM node while keeping the component as a logical React child (context, events still flow). Typical use: modals, tooltips, toasts that must escape overflow/z-index stacking contexts. Remember `event.stopPropagation()` to avoid the overlay click handler firing when clicking the inner dialog.",
  },
  {
    category: "react",
    id: "react-context-reducer",
    title: "useContext, useReducer & custom hooks",
    summary:
      "When to pick each; context re-render cost; memoize the provider value.",
    tags: ["context", "useReducer", "custom-hooks"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design an `AuthProvider` with Context + a custom `useAuth()` hook. Refactor a component with 4 related state fields to `useReducer`. Explain why Context can be a performance pitfall and the standard mitigations.",
    evaluatorNotes:
      "**`useContext`** reads a context value—**all consumers re-render** when the provider value changes (by reference). Mitigations: (1) wrap the provider value in **`useMemo`** so it has a stable reference when nothing actually changed; (2) split contexts by update frequency (one for auth, another for live data); (3) pass the setter via a separate context so readers of the value don't re-render when only setters change; (4) for high-frequency updates switch to Redux/Zustand (their selector systems subscribe only to relevant slices). **Custom hook wrapper** is the standard idiom: `useAuth()` throws when called outside the provider and returns a typed shape. **`useReducer(reducer, initial)`** is preferred over `useState` when you have 3+ related fields or actions with clear names; the reducer is a pure function (easy to test) and `dispatch` is stable (safe in deps arrays). `useReducer` + Context ≈ mini-Redux.",
  },
  {
    category: "react",
    id: "react-performance-memo",
    title: "React.memo, useMemo, useCallback — the trio",
    summary:
      "When they actually help; virtualization; code splitting with lazy + Suspense.",
    tags: ["performance", "memo", "virtualization"],
    primaryLanguage: "typescript",
    candidateBrief:
      "A parent re-renders on every keystroke, wasting a heavy `<Chart>` child. Apply the right memoization (all three pieces) and explain why any single piece alone wouldn't help.",
    evaluatorNotes:
      "**Memoization is a system**: `React.memo(Child)` skips a re-render when props are shallowly equal; **`useCallback`** keeps function props referentially stable; **`useMemo`** keeps object/array props stable. Any single piece alone is usually a no-op: `React.memo` without stable props re-renders anyway; `useCallback` without `React.memo` doesn't prevent the child render. Measure **first** (React DevTools Profiler), because memoization has non-zero overhead (deps comparison). Bigger wins first: (1) **route-level code splitting** with `React.lazy(() => import(...))` + `<Suspense fallback>`; (2) **virtualization** of long lists (`react-window`/`react-virtual` → render only what's on screen); (3) avoid inline object/array/function literals in JSX when the child is memoized; (4) use **stable keys** so DOM nodes can be reused instead of recreated.",
  },
  {
    category: "react",
    id: "react-concurrent-18",
    title: "React 18: concurrent rendering, Suspense, transitions",
    summary:
      "createRoot, auto-batching, useTransition/useDeferredValue, streaming Suspense.",
    tags: ["react-18", "concurrent", "suspense"],
    primaryLanguage: "typescript",
    candidateBrief:
      "A search input becomes janky while filtering 10k items. Use `useTransition` (and/or `useDeferredValue`) to keep input responsive. Explain what `createRoot` enables vs legacy `ReactDOM.render`.",
    evaluatorNotes:
      "**`createRoot(el).render(<App />)`** opts into concurrent rendering + automatic batching everywhere (set/state calls in `setTimeout`/`fetch().then` are batched). **Render phase** is now interruptible; **commit phase** is still synchronous. **`useTransition()`** returns `[isPending, startTransition]`—wrap non-urgent updates so typing/clicks stay urgent; the non-urgent render can be paused/discarded when a newer one arrives. **`useDeferredValue(value)`** gives a lagging version of a value—use when you can't wrap the setter. **Suspense** can be used for code splitting (with `React.lazy`) and for data fetching with Suspense-enabled libraries; wrap components granularly so slow children don't block fast ones, stream content as each Suspense resolves. Escape hatch: **`flushSync(fn)`** forces a synchronous commit when you must read DOM right after an update (rare).",
  },
  {
    category: "react",
    id: "react-forms",
    title: "Forms: controlled vs uncontrolled, React Hook Form + Zod",
    summary:
      "Re-render cost of controlled forms; RHF with Zod resolver at scale.",
    tags: ["forms", "validation", "rhf"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Build a signup form with email/password/age validation. Use **React Hook Form + Zod**, show field errors, and disable submit while in flight. Explain why this is dramatically more performant than a manual controlled form.",
    evaluatorNotes:
      "**Controlled** = input value in React state (re-render per keystroke; great for on-change validation, masking, conditional UI). **Uncontrolled** = DOM owns the value; React reads via `ref` (or via RHF's `register`). For forms with many fields, manual controlled re-renders the whole form on every keystroke. **React Hook Form** keeps inputs uncontrolled under the hood and only re-renders the field that changed (or a `watch`er you explicitly opt into)—30× fewer renders on real forms. **`{ resolver: zodResolver(schema) }`** gives type-safe validation; the same Zod schema validates client-side and on your API (one source of truth). Use `register('field')`, `handleSubmit(onSubmit)`, `formState: { errors, isSubmitting }`, `setError('field', ...)` for server-side errors, `reset()` after success. Prefer `<form action={serverAction}>` in Next.js App Router when you can.",
  },
  {
    category: "react",
    id: "react-data-fetching",
    title: "Data fetching: React Query / RTK Query",
    summary:
      "Server state ≠ client state; caching, invalidation, optimistic updates.",
    tags: ["react-query", "rtk-query", "server-state"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Fetch a paginated user list, refetch on window focus, invalidate after creating a user, and do an optimistic delete. Explain the idea of \"server state vs client state\".",
    evaluatorNotes:
      "**Server state** (data owned by a remote system, asynchronous, potentially stale) is fundamentally different from **client state** (UI state you own). Trying to model server state in `useState`/`useReducer`/`Redux` leads to endless loading/error/cache boilerplate. Use **React Query (TanStack Query)** or **RTK Query** for server state. Core concepts: **`queryKey`** identifies the cache entry; **`staleTime`** when it's considered fresh; **`cacheTime`/`gcTime`** how long to keep after unsubscribe; **`refetchOnWindowFocus`** default true. Mutations with **tag/query invalidation** (`queryClient.invalidateQueries`, RTK Query `invalidatesTags`) automatically refetch affected queries. **Optimistic updates**: `onMutate` writes the predicted state, `onError` rolls back, `onSettled` refetches. RTK Query integrates with a Redux store (use when already on Redux); React Query is standalone. Never mix the two for the same data.",
  },
  {
    category: "react",
    id: "react-redux-rtk",
    title: "Redux Toolkit: createSlice, createAsyncThunk, RTK Query",
    summary:
      "Modern Redux; Immer-powered reducers; selectors; when NOT to reach for Redux.",
    tags: ["redux", "rtk", "state-management"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Write a `cartSlice` with `addItem`/`removeItem`/`clearCart` using Redux Toolkit, plus a `createAsyncThunk` for checkout. Compare Redux to Context/Zustand and give a concrete reason to pick each.",
    evaluatorNotes:
      "Use **Redux Toolkit (RTK)** for all new Redux—never hand-roll action types/reducers/spread boilerplate. `createSlice({ name, initialState, reducers })` auto-generates action creators; reducers **look mutating** (`state.items.push(item)`) because **Immer** produces an immutable next state under the hood. `configureStore` wires DevTools and sensible middleware. `useSelector((s) => s.cart.total)` subscribes to a **slice**—only re-renders when that value changes (the big perf advantage over Context). `useDispatch()` returns a stable dispatch. `createAsyncThunk` generates `pending`/`fulfilled`/`rejected` actions handled in `extraReducers`. **RTK Query** adds full data-fetching with cache + tag invalidation. Decision guide: **Context** for truly static, low-frequency data (theme/locale); **Zustand** for simple global state with minimal setup; **Redux (RTK)** for complex domains where time-travel debug, middleware, and selector-based subscriptions actually pay off; **React Query / RTK Query** for server state.",
  },
  {
    category: "react",
    id: "react-error-handling",
    title: "Error boundaries, lazy loading & resilient UI",
    summary:
      "Error boundaries (class-only), react-error-boundary, React.lazy + Suspense.",
    tags: ["errors", "suspense", "code-splitting"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Make a dashboard resilient: one section crashing doesn't take the whole app down, users can retry, and route-level bundles are split. Explain what error boundaries don't catch.",
    evaluatorNotes:
      "**Error boundaries** catch rendering, lifecycle and constructor errors in their subtree via **`static getDerivedStateFromError(error)`** + **`componentDidCatch(error, info)`** on a class component. They **do not** catch: event handlers (use try/catch), async code (use `.catch`), errors thrown in the boundary itself, or SSR. Prefer **`react-error-boundary`** (`<ErrorBoundary FallbackComponent={...} onError={sendToSentry} resetKeys={[userId]}>`)—no class plumbing, `resetKeys` re-mounts on recovery, `useErrorBoundary()` lets children trigger the fallback. Place boundaries per section (header, main, sidebar) instead of one app-wide fallback. For async data, combine with Suspense-enabled libraries or show inline `error` from `useQuery`. Combine with **`React.lazy(() => import(...))`** + **`<Suspense fallback>`** for route-level code splitting (biggest bundle-size win in a large SPA). In Next.js App Router, `error.tsx` and `not-found.tsx` give you per-segment boundaries automatically.",
  },
  {
    category: "react",
    id: "react-architecture-ssr",
    title: "Rendering strategies, architecture & auth storage",
    summary:
      "CSR vs SSR vs SSG vs RSC; hydration mismatch; feature-based folders; JWT storage.",
    tags: ["architecture", "ssr", "rsc"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Pick a rendering strategy per page for a SaaS (marketing homepage, blog, product dashboard, personalized settings). Explain hydration mismatches with a concrete example, then outline a feature-based folder layout and a safe JWT storage choice.",
    evaluatorNotes:
      "**CSR** — empty HTML shell + client bundle; good for apps behind login; bad SEO, slow first paint. **SSR** — HTML per request; good SEO + fresh personalised data; more server cost. **SSG** — HTML at build time + CDN; fastest; bad for frequently changing data. **ISR** — SSG + time-based or on-demand revalidation. **React Server Components (RSC)** — components that run **only on the server**, ship zero JS, can hit the DB directly; compose with `'use client'` leaves for interactivity; the App Router default. **Hydration mismatch** = server HTML ≠ first client render (usual causes: `Date.now()`, `Math.random()`, browser-only APIs accessed in render, locale-sensitive formatting). Fix by computing in `useEffect` or using deterministic values. **Folder layout**: feature-based (`features/<domain>/{components,hooks,store,api}`) scales far better than type-based. **JWT storage**: prefer **httpOnly + SameSite=Lax** cookies set by the server (XSS can't read them); `localStorage` is a last resort and exposes tokens to any XSS; for SPAs with refresh flows, keep access tokens in memory and refresh via an httpOnly refresh cookie.",
  },
];
