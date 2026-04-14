"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { StartSessionButton } from "@/components/start-session-button";
import {
  categoryFromTrackParam,
  DEFAULT_TRACK_SLUG,
  type PracticePrompt,
  trackSlugFromCategory,
} from "@/lib/prompts/types";

export type PromptTrackConfig = {
  slug: string;
  label: string;
  description: string;
  prompts: PracticePrompt[];
  accent: "js" | "design" | "node" | "ts" | "nest" | "next" | "arch" | "patterns";
};

function cardAccentClass(accent: PromptTrackConfig["accent"]): string {
  switch (accent) {
    case "js":
      return "border-yellow-200/90 dark:border-yellow-900/45";
    case "design":
      return "border-purple-200/80 dark:border-purple-900/50";
    case "node":
      return "border-green-200/90 dark:border-green-900/45";
    case "ts":
      return "border-blue-200/90 dark:border-blue-900/45";
    case "nest":
      return "border-red-200/90 dark:border-red-900/45";
    case "next":
      return "border-zinc-300 dark:border-zinc-600";
    case "arch":
      return "border-amber-200/90 dark:border-amber-900/45";
    case "patterns":
      return "border-cyan-200/90 dark:border-cyan-900/45";
    default:
      return "border-zinc-200 dark:border-zinc-800";
  }
}

function PromptCard({
  prompt,
  accent,
}: {
  prompt: PracticePrompt;
  accent: PromptTrackConfig["accent"];
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border-2 bg-white p-4 shadow-sm dark:bg-zinc-950/40 ${cardAccentClass(accent)}`}
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {prompt.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-300">
        {prompt.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {prompt.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <StartSessionButton promptId={prompt.id} />
      </div>
    </article>
  );
}

export function PromptLibraryTabs({ tracks }: { tracks: PromptTrackConfig[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const slugOrder = useMemo(() => tracks.map((t) => t.slug), [tracks]);

  const activeSlug = useMemo(() => {
    const raw = searchParams.get("track");
    const cat = categoryFromTrackParam(raw);
    return trackSlugFromCategory(cat);
  }, [searchParams]);

  const setSlug = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === DEFAULT_TRACK_SLUG) {
        params.delete("track");
      } else {
        params.set("track", slug);
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const activeTrack = useMemo(
    () => tracks.find((t) => t.slug === activeSlug) ?? tracks[0],
    [tracks, activeSlug],
  );

  const onTabListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const i = slugOrder.indexOf(activeSlug);
      if (i < 0) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = slugOrder[(i + 1) % slugOrder.length];
        setSlug(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = slugOrder[(i - 1 + slugOrder.length) % slugOrder.length];
        setSlug(next);
      }
    },
    [activeSlug, setSlug, slugOrder],
  );

  useEffect(() => {
    function onGlobalKeyDown(ev: globalThis.KeyboardEvent) {
      if (ev.defaultPrevented) {
        return;
      }
      const el = ev.target;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      if (ev.altKey || ev.metaKey || ev.ctrlKey) {
        return;
      }
      if (!/^[1-8]$/.test(ev.key)) {
        return;
      }
      const n = Number.parseInt(ev.key, 10) - 1;
      if (n < 0 || n >= slugOrder.length) {
        return;
      }
      ev.preventDefault();
      setSlug(slugOrder[n]!);
    }
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [slugOrder, setSlug]);

  return (
    <section aria-label="Practice tracks">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
        <div
          role="tablist"
          aria-label="Choose practice track"
          onKeyDown={onTabListKeyDown}
          className="-mx-1 flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80 xl:mx-0 xl:flex-1 xl:flex-wrap"
        >
          {tracks.map((t) => {
            const selected = activeSlug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                role="tab"
                id={`tab-${t.slug}`}
                aria-selected={selected}
                aria-controls={`panel-${t.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setSlug(t.slug)}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  selected
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="hidden max-w-sm flex-none text-xs leading-relaxed text-zinc-500 xl:block xl:text-right dark:text-zinc-400">
          {activeTrack?.description}
        </p>
      </div>

      <details className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/90 p-3 dark:border-zinc-800 dark:bg-zinc-900/50 xl:hidden">
        <summary className="cursor-pointer text-xs font-medium text-zinc-800 dark:text-zinc-100">
          About this track
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {activeTrack?.description}
        </p>
      </details>

      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        Shortcuts:{" "}
        <kbd className="rounded border border-zinc-300 bg-white px-1 font-mono dark:border-zinc-600 dark:bg-zinc-800">
          1
        </kbd>
        –
        <kbd className="rounded border border-zinc-300 bg-white px-1 font-mono dark:border-zinc-600 dark:bg-zinc-800">
          8
        </kbd>{" "}
        switch track when not typing in a field. Arrow keys navigate tabs when
        the tab list is focused.
      </p>

      <div className="mt-6">
        {tracks.map((t) => (
          <div
            key={t.slug}
            role="tabpanel"
            id={`panel-${t.slug}`}
            aria-labelledby={`tab-${t.slug}`}
            hidden={activeSlug !== t.slug}
          >
            {activeSlug === t.slug && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {t.prompts.map((p) => (
                  <PromptCard key={p.id} prompt={p} accent={t.accent} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
