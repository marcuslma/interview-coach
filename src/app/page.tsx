import { Suspense } from "react";
import { listPromptsByCategory } from "@/lib/prompts";
import { getPromptById } from "@/lib/prompts";
import { PromptLibraryTabs } from "@/components/prompt-library-tabs";
import type { PromptTrackConfig } from "@/components/prompt-library-tabs";
import { RecentSessions } from "@/components/recent-sessions";
import { listSessions } from "@/lib/sessions/service";
import type { PracticeCategory } from "@/lib/prompts/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tracks: PromptTrackConfig[] = [
    {
      slug: "system_design",
      label: "System design",
      description:
        "Architecture, trade-offs, capacity, APIs, data, reliability.",
      prompts: listPromptsByCategory("system_design"),
      accent: "design",
    },
    {
      slug: "javascript",
      label: "JavaScript",
      description:
        "Language fundamentals: execution order, semantics, closures, Big-O — JavaScript only.",
      prompts: listPromptsByCategory("javascript"),
      accent: "js",
    },
    {
      slug: "typescript",
      label: "TypeScript",
      description: "Types, narrowing, generics, utility types, modules.",
      prompts: listPromptsByCategory("typescript"),
      accent: "ts",
    },
    {
      slug: "nodejs",
      label: "Node.js",
      description: "Runtime, streams, modules, process, scaling patterns.",
      prompts: listPromptsByCategory("nodejs"),
      accent: "node",
    },
    {
      slug: "nestjs",
      label: "NestJS",
      description: "DI, modules, guards, pipes, interceptors, REST.",
      prompts: listPromptsByCategory("nestjs"),
      accent: "nest",
    },
    {
      slug: "nextjs",
      label: "Next.js",
      description: "App Router, RSC, caching, route handlers, metadata.",
      prompts: listPromptsByCategory("nextjs"),
      accent: "next",
    },
  ];

  let recent: {
    id: string;
    title: string;
    updatedAt: string;
    category: PracticeCategory;
  }[] = [];
  try {
    const rows = await listSessions();
    recent = rows.slice(0, 12).map((s) => {
      const p = getPromptById(s.promptId);
      return {
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt.toISOString(),
        category: p?.category ?? "javascript",
      };
    });
  } catch {
    recent = [];
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Open source
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Interview Coach
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Chat-only practice with an AI interviewer: system design (default tab), JavaScript, TypeScript, Node.js, NestJS, and Next.js.
          Set{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            OPENAI_API_KEY
          </code>{" "}
          locally. Deep links:{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            ?track=javascript
          </code>
          ,{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            ?track=nextjs
          </code>
          , etc. With no query string, the first tab (system design) is selected.
        </p>
      </div>

      {recent.length > 0 && <RecentSessions initial={recent} />}

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
