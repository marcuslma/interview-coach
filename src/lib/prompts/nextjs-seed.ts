import type { PracticePrompt } from "./types";

/**
 * Next.js — App Router era. Scenarios track how senior interviews probe
 * rendering, caching, streaming, the server/client boundary, and production
 * concerns (auth, middleware, SEO, performance).
 */
export const NEXTJS_PROMPTS: PracticePrompt[] = [
  {
    category: "nextjs",
    id: "next-app-router-layouts",
    title: "App Router: layouts, templates & segment files",
    summary:
      "Nested layouts, template re-mounts, loading/error/not-found, and where to fetch.",
    tags: ["app-router", "layouts", "segments"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design a layout tree for a dashboard: a global shell, a dashboard section with sidebar, and a nested analytics section. Decide what each segment file does and when the UI re-renders on navigation.",
    evaluatorNotes:
      "Special files per segment: **`layout.tsx`** (persistent across navigation), **`template.tsx`** (re-mounts on navigation — useful for transitions, bad for state), **`loading.tsx`** (auto Suspense boundary), **`error.tsx`** (Client Component error boundary with `error` + `reset`), **`not-found.tsx`**, **`page.tsx`**. Only the **root layout** owns `<html>`/`<body>`. Layouts **do not re-render** when navigating between sibling children → great for performance but they can't read `searchParams` (would be stale). Use **`useSelectedLayoutSegment()`** for active-link highlighting. Probe data fetching location: colocate near where the data is consumed; layouts fetch once and stay.",
  },
  {
    category: "nextjs",
    id: "next-routing-groups-parallel",
    title: "Routing: dynamic, catch-all, groups & parallel routes",
    summary:
      "[slug], [...slug], [[...slug]], (group), @slot, and (.) interception.",
    tags: ["routing", "app-router", "parallel-routes"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Walk through Next.js file-based routing: dynamic segments, route groups without URL impact, parallel routes (`@slot`), and intercepting routes (`(.)`, `(..)`, `(...)`). When does each fit?",
    evaluatorNotes:
      "**Dynamic:** `[slug]`, **catch-all** `[...slug]`, **optional catch-all** `[[...slug]]` (matches the parent route too). **Route groups** `(marketing)` organize files and share a layout without adding a URL segment; enables **multiple root layouts** (marketing shell vs app shell) by omitting `app/layout.tsx` and putting one in each group. **Parallel routes** use `@slot` folders; the parent layout receives each slot as a prop—great for dashboards with independent panels and **URL-aware modals**. **Intercepting routes** (`(.)photo/[id]`) swap a route when navigated from within the app but show the full page on direct hit/refresh (the Instagram-style photo modal). Ask how the candidate would build that modal end-to-end.",
  },
  {
    category: "nextjs",
    id: "next-server-client-components",
    title: "Server vs Client Components",
    summary:
      "When to use 'use client', the boundary, and Server Actions.",
    tags: ["rsc", "use-client", "use-server"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Decide server vs client for pieces of a product page. Explain what crosses the boundary, how to compose them, and when to reach for `'use server'`.",
    evaluatorNotes:
      "Server Components are the **default** in App Router—async, can hit the DB directly, **zero client JS**, no hooks, no events, no `useContext`. `'use client'` marks a module as client-side; it must be the **first line** and marks everything it imports as client too. Rule: **push `'use client'` to the leaves** (only the interactive bit—`LikeButton`) so the surrounding tree stays server-rendered. A Server Component can **render** a Client Component and **pass a Server Component as `children`**, but a Client Component cannot **import** a Server Component. Props across the boundary must be **serializable** (no functions, no classes, no Dates-as-Dates). **Server Actions** (`'use server'`) are callable from client forms/buttons; use for mutations; they run server-side, support progressive enhancement (forms work without JS), and pair with `revalidatePath`/`revalidateTag`.",
  },
  {
    category: "nextjs",
    id: "next-rendering-strategies",
    title: "Rendering strategies: SSG / ISR / SSR / CSR",
    summary:
      "Per-page decision and how Next auto-opts into dynamic rendering.",
    tags: ["ssg", "ssr", "isr", "rendering"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Pick a rendering strategy for each page of a hybrid app (marketing homepage, blog, product page with prices, authenticated dashboard, search page with query params) and justify each.",
    evaluatorNotes:
      "**SSG** (default when the route has no dynamic signals): rendered at build, served from CDN—best for marketing, docs, blog posts. **ISR**: SSG + `next: { revalidate: N }` on fetch or `export const revalidate = N` on the segment; supports **on-demand** via `revalidatePath`/`revalidateTag` (webhook pattern). **SSR** (dynamic): any of `cookies()`, `headers()`, the `searchParams` prop, `cache: 'no-store'`, or `unstable_noStore()` auto-opts the route in. **CSR**: a `'use client'` leaf that fetches client-side (useful for truly live dashboards, but usually a last resort in App Router). Force with `export const dynamic = 'force-dynamic' | 'force-static' | 'error'`. Mention **PPR** (Partial Pre-Rendering) conceptually: static shell + dynamic holes wrapped in Suspense. Build output legend: `○` static, `ƒ`/`λ` dynamic—aim for as many static as possible.",
  },
  {
    category: "nextjs",
    id: "next-data-fetching-cache",
    title: "Data fetching patterns in Server Components",
    summary:
      "Parallel vs sequential, React cache(), preload, deduplication.",
    tags: ["data", "rsc", "cache"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Fetch user, posts and stats for a dashboard page without creating a waterfall, and share the user fetch across a layout and its page without a second DB hit.",
    evaluatorNotes:
      "Default pattern: `async` Server Component that `await`s data directly—no `useEffect`, no loading state, no separate API route. Two common bugs: **sequential awaits** of independent fetches (fix with `Promise.all`) and **waterfalls** from child components (fix with **preload pattern**: call the fetch function but don't await it in the parent, then await in the child—request is deduplicated). Within a single render, identical **`fetch()`** calls are auto-memoized; for non-`fetch` data access (ORMs, DB drivers), wrap the helper with React's **`cache()`** so a layout + page + `generateMetadata` share one call. Data fetched in `generateStaticParams` is also deduplicated with the page's fetch. Colocate data next to the component that consumes it; avoid prop-drilling across Server Components.",
  },
  {
    category: "nextjs",
    id: "next-caching-layers",
    title: "Caching & revalidation (4 layers)",
    summary:
      "Request memo, Data cache, Full Route cache, Router cache.",
    tags: ["cache", "revalidate", "isr"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain the four caching layers in Next.js App Router and how `revalidatePath` / `revalidateTag` / `cache: 'no-store'` interact with each. Then debug: \"I changed the DB but the page still shows old data.\"",
    evaluatorNotes:
      "Four layers: **(1) Request memoization** — same `fetch()` URL deduped within a single render. **(2) Data cache** — `fetch()` results persisted across requests; controlled by `next: { revalidate: N, tags: [...] }` or `cache: 'no-store'`. **(3) Full Route cache** — rendered HTML cached on the server for static routes; invalidated by `revalidatePath`/`revalidateTag` and time-based revalidation. **(4) Router cache** — client-side cache of visited routes (~30 s dynamic, ~5 min static); `router.refresh()` clears it. Debug flow for 'stale data': did the mutation `revalidatePath`/`revalidateTag`? Is the route actually static (full-route cache) or dynamic? Is the client Router cache holding on (try `router.refresh()`)? Is a non-`fetch` data source bypassing the Data cache (wrap in `cache()` + `revalidateTag`). `unstable_noStore()` opts a specific component out.",
  },
  {
    category: "nextjs",
    id: "next-streaming-suspense",
    title: "Streaming & Suspense",
    summary:
      "loading.tsx, granular Suspense boundaries, use() hook.",
    tags: ["streaming", "suspense", "performance"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Make a dashboard feel fast: ship the shell immediately, stream the fast widget in ~200 ms and the slow analytics in ~800 ms, independently of each other.",
    evaluatorNotes:
      "`loading.tsx` is sugar for wrapping the segment in a Suspense boundary—quick to add but one fallback for the whole segment. For fine-grained control use **multiple `<Suspense fallback={...}>`** around the slow async children; each streams in as soon as its data resolves (React 18 streaming SSR). Keep fallbacks meaningful (skeletons matching real layout) to avoid layout shift. In a Client Component, **`use(promise)`** unwraps a Promise with Suspense semantics—pass the **unawaited** promise from a Server Component parent. Pitfall: awaiting a slow fetch **in the parent** blocks the whole shell; move the await into a child component and wrap in Suspense.",
  },
  {
    category: "nextjs",
    id: "next-api-route-handlers",
    title: "Route Handlers & Server Actions",
    summary:
      "route.ts (GET/POST/…) vs 'use server' mutations — when to pick which.",
    tags: ["api", "server-actions", "route-handlers"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design a form submit flow: Zod validation, write to DB, revalidate the list page, and handle the \"no JavaScript\" case. Then contrast with exposing the same mutation as a public JSON endpoint.",
    evaluatorNotes:
      "**Route Handlers** (`app/api/…/route.ts`, export `GET`/`POST`/…) are HTTP endpoints—use for webhooks, OAuth callbacks, public JSON APIs, file uploads, anything that needs raw HTTP (status codes, streaming, custom headers, `OPTIONS` preflight for CORS). Handle the body with `req.json()` / `req.formData()`; respond via `NextResponse.json()` or `new Response()`. **Server Actions** (`'use server'`, used as `<form action={action}>` or callable from Client Components) are for **first-party mutations** driven by UI: no URL to expose, automatic CSRF protection on form POSTs, **progressive enhancement** (work without JS). Both should validate input with **Zod/safeParse** before touching the DB. After a mutation, call **`revalidatePath`** or **`revalidateTag`** to bust the relevant cache. Never trust the client—re-authenticate inside the action/handler; `cookies()` / `headers()` are available.",
  },
  {
    category: "nextjs",
    id: "next-middleware-edge",
    title: "Middleware & Edge Runtime",
    summary:
      "Auth checks, redirects, headers — at the edge before rendering.",
    tags: ["middleware", "edge", "auth"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Use middleware to protect `/dashboard/*`, redirect unauthenticated users to `/login?from=…`, and attach the user id as a request header for downstream Server Components. Then compare the Edge Runtime to Node.js Runtime for API routes.",
    evaluatorNotes:
      "`middleware.ts` at the project root runs **before every matched request** at the **Edge Runtime** (restricted Web APIs only—no `fs`, no Node built-ins, no native addons). Use the `matcher` config to scope (exclude `_next/static`, `_next/image`, etc.). Use for: auth gate, locale negotiation, A/B bucketing, bot/geo headers, rewrites. Pattern: verify a JWT with an **Edge-compatible** library (`jose`, not `jsonwebtoken`), then `NextResponse.next()` and set `x-user-id`/`x-user-role` headers that Server Components read via `headers()`. Can also `.redirect`, `.rewrite`, or return a response directly. For API routes, `export const runtime = 'edge'` chooses Edge (≈5 ms cold start, 128 MB, Web APIs only); default is `'nodejs'` for DB drivers and native packages (`bcrypt`, `sharp`). Middleware **cannot** talk to a database—keep it fast.",
  },
  {
    category: "nextjs",
    id: "next-auth-cookies-session",
    title: "Auth, cookies & sessions",
    summary:
      "cookies()/headers() on the server, NextAuth/Auth.js, middleware gate.",
    tags: ["auth", "cookies", "nextauth"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Wire authentication end-to-end: log the user in via a Server Action, store a session cookie, read it in a Server Component, and block unauthenticated access in middleware. Outline the NextAuth/Auth.js way too.",
    evaluatorNotes:
      "Server-side cookie/header APIs live in **`next/headers`**: `cookies()` / `headers()` work in Server Components, Server Actions, and Route Handlers; reading any of them opts the route into **dynamic** rendering. Set cookies with `cookies().set(name, value, { httpOnly: true, secure: true, sameSite: 'lax', maxAge })` inside a Server Action, or `response.cookies.set(...)` in a Route Handler. Never use `document.cookie` for auth—auth cookies must be **`httpOnly`**. **Auth.js (NextAuth v5)**: `auth.ts` exports `{ handlers, signIn, signOut, auth }`; mount `handlers` under `app/api/auth/[...nextauth]/route.ts`; use `auth()` in Server Components (cheap, no client JS) and `useSession` in Client Components only when reactivity is needed. Probe common pitfalls: trying to read `cookies()` in a layout (works, but opts it dynamic), exposing tokens via `NEXT_PUBLIC_`, and refreshing stale sessions after a role change (`revalidatePath('/') ` or `router.refresh()`).",
  },
  {
    category: "nextjs",
    id: "next-images-fonts-assets",
    title: "Images, fonts & Core Web Vitals",
    summary:
      "next/image, next/font, next/script, and LCP/CLS/INP trade-offs.",
    tags: ["performance", "images", "web-vitals"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Optimize a landing page for Core Web Vitals: one hero image, one custom font, a third-party analytics script, and a lazy-loaded product grid below the fold.",
    evaluatorNotes:
      "**`next/image`**: pass `width`+`height` **or** `fill` inside a `position: relative` parent; provide meaningful `sizes` for responsive images so Next generates the right `srcSet`; add **`priority`** to the LCP image (hero/logo) so it isn't lazy-loaded; `placeholder='blur'` works automatically with static imports. Whitelist remote hosts in `next.config.js` via `images.remotePatterns`. **`next/font`**: self-hosted, zero network to Google Fonts at runtime, uses `font-display: swap` by default → prevents CLS. **`next/script`** strategies: `beforeInteractive` (critical, e.g. theme flash guard), `afterInteractive` (default, analytics), `lazyOnload` (chat widgets). Budget talk: LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Push `'use client'` to leaves to shrink the JS bundle; dynamic-import heavy libs (charts, editors) with `next/dynamic` and `ssr: false` when they touch `window`.",
  },
  {
    category: "nextjs",
    id: "next-metadata-seo",
    title: "Metadata & SEO",
    summary:
      "generateMetadata, OG images, sitemap/robots, JSON-LD.",
    tags: ["seo", "metadata", "opengraph"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Expose correct titles, descriptions, and social previews for dynamic blog posts; generate OG images per post; ship a valid sitemap and `robots.txt`; add JSON-LD for articles.",
    evaluatorNotes:
      "Static vs dynamic: **`export const metadata`** for static values; **`generateMetadata({ params, searchParams })`** (async, deduplicated with the page's fetch) for per-route data. Title templates go on the **root layout**: `title: { template: '%s | MyApp', default: 'MyApp' }`—child pages fill `%s`. Set **`metadataBase: new URL('https://...')`** so `openGraph.images` with relative URLs resolve correctly in production. **File conventions** auto-wire: `icon.png`, `opengraph-image.png` (static) or **`opengraph-image.tsx`** with `ImageResponse` from `next/og` (dynamic per-route OG image, runs at the edge). **`app/sitemap.ts`** and **`app/robots.ts`** generate `sitemap.xml` and `robots.txt`. Add **JSON-LD** with a `<script type='application/ld+json'>` (Article, Product, Breadcrumb) for rich results. Avoid duplicated metadata in nested layouts—merge via the template.",
  },
  {
    category: "nextjs",
    id: "next-errors-not-found",
    title: "error.tsx, not-found & error digests",
    summary:
      "Error boundaries per segment, notFound() flow, global-error.",
    tags: ["errors", "not-found", "observability"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Handle failure in a `/dashboard` segment: render a retryable error UI for unexpected errors, a 404 UI when the item isn't found, and make sure internals aren't leaked to users.",
    evaluatorNotes:
      "**`not-found.tsx`** is a Server Component shown when `notFound()` is called from `next/navigation` (or for unmatched routes); HTTP 404. Call `notFound()` after a DB lookup that returns `null`. **`error.tsx`** must be a **Client Component** (`'use client'`)—it's a React Error Boundary receiving `{ error, reset }`; HTTP 500. It does **not** catch errors thrown by the **same segment's layout**—those bubble up until a parent boundary catches them; use **`app/global-error.tsx`** (includes its own `<html>`/`<body>`) as last resort. In production the **`error.digest`** is a server-generated id that maps to the full error in your logs—show the digest to the user, never `error.message` (may leak paths/stack). `reset()` re-renders the segment—useful for transient failures. Redirects via `redirect()` from `next/navigation` throw internally, so keep them out of `try/catch` blocks.",
  },
];
