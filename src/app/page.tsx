import { Suspense } from "react";
import { listPromptsByCategory } from "@/lib/prompts";
import { PromptLibraryTabs } from "@/components/prompt-library-tabs";
import type { PromptTrackConfig } from "@/components/prompt-library-tabs";
import { RecentSessions } from "@/components/recent-sessions";

export default function HomePage() {
  const tracks: PromptTrackConfig[] = [
    {
      slug: "javascript",
      label: "JavaScript",
      description:
        "Pure ECMAScript depth: event loop and microtasks, closures and scope, this binding, coercion, modules, and Big-O on small snippets—exactly the kind of language grilling you see in frontend and Node screens.",
      prompts: listPromptsByCategory("javascript"),
      accent: "js",
    },
    {
      slug: "typescript",
      label: "TypeScript",
      description:
        "The type-system interview: narrowing, generics, inference, utility and mapped types, structural typing, and async-aware typing—practice explaining your reasoning, not compiler trivia.",
      prompts: listPromptsByCategory("typescript"),
      accent: "ts",
    },
    {
      slug: "react",
      label: "React",
      description:
        "React + Redux at interview depth: JSX and reconciliation, the hooks model (rules, stale closures, cleanup), the React.memo + useMemo + useCallback trio, React 18 concurrent features, forms with React Hook Form, server state with React Query / RTK Query, and Redux Toolkit.",
      prompts: listPromptsByCategory("react"),
      accent: "react",
    },
    {
      slug: "nodejs",
      label: "Node.js",
      description:
        "Runtime mechanics that matter: libuv, event loop phases, streams and backpressure, buffers, process and module resolution, and when to reach for workers or clustering.",
      prompts: listPromptsByCategory("nodejs"),
      accent: "node",
    },
    {
      slug: "nestjs",
      label: "NestJS",
      description:
        "Opinionated server frameworks: modules and DI scopes, guards, pipes, interceptors, filters, REST shape, validation, and when message transports beat HTTP.",
      prompts: listPromptsByCategory("nestjs"),
      accent: "nest",
    },
    {
      slug: "nextjs",
      label: "Next.js",
      description:
        "App Router-era Next: Server vs Client Components, layouts, caching and data fetching, route handlers and server actions (conceptually), metadata, and performance trade-offs.",
      prompts: listPromptsByCategory("nextjs"),
      accent: "next",
    },
    {
      slug: "mongodb",
      label: "MongoDB",
      description:
        "Document databases at interview depth: indexes and aggregation pipelines, replica sets and read preferences, sharding trade-offs, schema embedding vs referencing, and when transactions matter.",
      prompts: listPromptsByCategory("mongodb"),
      accent: "mongo",
    },
    {
      slug: "postgresql",
      label: "PostgreSQL",
      description:
        "The world's favorite relational engine: MVCC and isolation, indexes and EXPLAIN, locks and deadlocks, partitioning, and jsonb vs tables—practice articulating trade-offs clearly.",
      prompts: listPromptsByCategory("postgresql"),
      accent: "pg",
    },
    {
      slug: "system_design",
      label: "System Design",
      description:
        "Large-scale systems: clarify requirements, sketch capacity, APIs and data, consistency, reliability, and trade-offs—whiteboard style, without diving into a single framework.",
      prompts: listPromptsByCategory("system_design"),
      accent: "design",
    },
    {
      slug: "software_architecture",
      label: "Software Architecture",
      description:
        "Code-level architecture: SOLID, Clean and Hexagonal boundaries, DDD building blocks, CQRS in principle, packaging, integration styles, and how to evolve a codebase safely.",
      prompts: listPromptsByCategory("software_architecture"),
      accent: "arch",
    },
    {
      slug: "design_patterns",
      label: "Design Patterns",
      description:
        "Classic GoF and enterprise patterns—know when they pay off and when they add noise. Expect small TypeScript sketches, comparisons (Adapter vs Decorator), and honest trade-offs.",
      prompts: listPromptsByCategory("design_patterns"),
      accent: "patterns",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Open source
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Interview Coach
        </h1>
        <p className="mt-3 w-full text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Chat-only practice with an AI interviewer: JavaScript (default tab), TypeScript, React, Node.js, NestJS, Next.js, MongoDB, PostgreSQL, system design, software architecture, and design patterns.
          Provide your own LLM API key on the{" "}
          <a
            href="/settings"
            className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Settings
          </a>{" "}
          page — it is encrypted with a passphrase you choose and stored only in
          this browser. Deep links:{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            ?track=system_design
          </code>
          ,{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            ?track=nextjs
          </code>
          , etc. With no query string, the first tab (JavaScript) is selected.
        </p>
      </div>

      <RecentSessions />

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Practice library
        </h2>
        <div className="mt-4">
          <Suspense
            fallback={
              <div
                className="h-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
                aria-hidden
              />
            }
          >
            <PromptLibraryTabs tracks={tracks} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
