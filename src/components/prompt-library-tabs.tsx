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

/** Highlight panel for the active track description */
function trackSpotlightClass(accent: PromptTrackConfig["accent"]): string {
  switch (accent) {
    case "js":
      return "border-yellow-400/70 bg-gradient-to-br from-yellow-50/95 to-amber-50/40 ring-1 ring-yellow-200/60 dark:border-yellow-700/50 dark:from-yellow-950/40 dark:to-zinc-950/80 dark:ring-yellow-900/40";
    case "design":
      return "border-purple-400/60 bg-gradient-to-br from-purple-50/95 to-violet-50/40 ring-1 ring-purple-200/60 dark:border-purple-700/50 dark:from-purple-950/35 dark:to-zinc-950/80 dark:ring-purple-900/40";
    case "node":
      return "border-emerald-400/60 bg-gradient-to-br from-emerald-50/95 to-green-50/30 ring-1 ring-emerald-200/50 dark:border-emerald-700/50 dark:from-emerald-950/35 dark:to-zinc-950/80 dark:ring-emerald-900/35";
    case "ts":
      return "border-blue-400/60 bg-gradient-to-br from-blue-50/95 to-sky-50/35 ring-1 ring-blue-200/60 dark:border-blue-700/50 dark:from-blue-950/35 dark:to-zinc-950/80 dark:ring-blue-900/40";
    case "nest":
      return "border-red-400/55 bg-gradient-to-br from-red-50/90 to-orange-50/25 ring-1 ring-red-200/50 dark:border-red-800/50 dark:from-red-950/30 dark:to-zinc-950/80 dark:ring-red-900/35";
    case "next":
      return "border-zinc-400/50 bg-gradient-to-br from-zinc-100/95 to-zinc-50/50 ring-1 ring-zinc-300/70 dark:border-zinc-600 dark:from-zinc-900/80 dark:to-zinc-950 dark:ring-zinc-700/60";
    case "arch":
      return "border-amber-400/60 bg-gradient-to-br from-amber-50/95 to-orange-50/30 ring-1 ring-amber-200/55 dark:border-amber-700/50 dark:from-amber-950/35 dark:to-zinc-950/80 dark:ring-amber-900/35";
    case "patterns":
      return "border-cyan-400/60 bg-gradient-to-br from-cyan-50/95 to-teal-50/25 ring-1 ring-cyan-200/55 dark:border-cyan-700/50 dark:from-cyan-950/30 dark:to-zinc-950/80 dark:ring-cyan-900/35";
    default:
      return "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50";
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
    <section aria-label="Practice tracks" className="flex flex-col gap-0">
      {/* 1. All track tabs */}
      <div
        role="tablist"
        aria-label="Choose practice track"
        onKeyDown={onTabListKeyDown}
        className="-mx-1 flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100/90 p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/85 sm:flex-wrap sm:overflow-x-visible"
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
              className={`shrink-0 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                selected
                  ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-700/80"
                  : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 2. How to switch tracks */}
      <div className="mt-5 rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-teal-50/30 px-4 py-3.5 dark:border-emerald-900/50 dark:from-emerald-950/25 dark:to-zinc-950/60">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-300/95">
          Switch tracks in seconds
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-100/85">
          <li>
            <strong className="font-semibold text-emerald-950 dark:text-emerald-50">
              Click
            </strong>{" "}
            any tab above—the URL updates so you can bookmark or share (
            <code className="rounded bg-emerald-100/90 px-1 font-mono text-[11px] dark:bg-emerald-950/80">
              ?track=…
            </code>
            ).
          </li>
          <li>
            Press{" "}
            <kbd className="rounded border border-emerald-300 bg-white px-1.5 py-0.5 font-mono text-[11px] shadow-sm dark:border-emerald-800 dark:bg-zinc-900">
              1
            </kbd>
            –
            <kbd className="rounded border border-emerald-300 bg-white px-1.5 py-0.5 font-mono text-[11px] shadow-sm dark:border-emerald-800 dark:bg-zinc-900">
              8
            </kbd>{" "}
            while focus is{" "}
            <strong className="font-semibold">not</strong> in a text field to
            jump by position (JavaScript ={" "}
            <kbd className="rounded border border-emerald-300 bg-white px-1 font-mono text-[11px] dark:border-emerald-800 dark:bg-zinc-900">
              1
            </kbd>
            , …).
          </li>
          <li>
            Click inside the tab strip once, then use{" "}
            <kbd className="rounded border border-emerald-300 bg-white px-1 font-mono text-[11px] dark:border-emerald-800 dark:bg-zinc-900">
              ←
            </kbd>{" "}
            <kbd className="rounded border border-emerald-300 bg-white px-1 font-mono text-[11px] dark:border-emerald-800 dark:bg-zinc-900">
              →
            </kbd>{" "}
            (or up/down) to move between tracks.
          </li>
        </ul>
      </div>

      {/* 3. Active track description (prominent) */}
      <div
        className={`mt-5 rounded-2xl border-2 p-5 sm:p-6 ${trackSpotlightClass(activeTrack.accent)}`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Current track
        </p>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
          {activeTrack.label}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-zinc-800 sm:text-[1.05rem] dark:text-zinc-200">
          {activeTrack.description}
        </p>
      </div>

      {/* 4. Scenario cards */}
      <div className="mt-8">
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

