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
  accent:
    | "js"
    | "design"
    | "node"
    | "ts"
    | "nest"
    | "next"
    | "react"
    | "mongo"
    | "pg"
    | "arch"
    | "patterns";
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
    case "react":
      return "border-sky-200/90 dark:border-sky-900/45";
    case "mongo":
      return "border-lime-200/90 dark:border-lime-900/45";
    case "pg":
      return "border-indigo-200/90 dark:border-indigo-900/45";
    case "arch":
      return "border-amber-200/90 dark:border-amber-900/45";
    case "patterns":
      return "border-cyan-200/90 dark:border-cyan-900/45";
    default:
      return "border-zinc-200 dark:border-zinc-800";
  }
}

/** Highlight panel: luminous gradient + tinted shadow + ring per track */
function trackSpotlightClass(accent: PromptTrackConfig["accent"]): string {
  switch (accent) {
    case "js":
      return `overflow-hidden border border-yellow-400/75 bg-gradient-to-br from-yellow-50 via-amber-50/90 to-orange-50/50 dark:border-yellow-600/60 dark:from-yellow-950/55 dark:via-amber-950/35 dark:to-zinc-950`;
    case "design":
      return `overflow-hidden border border-purple-400/70 bg-gradient-to-br from-purple-50 via-violet-50/85 to-fuchsia-50/45 dark:border-purple-600/55 dark:from-purple-950/50 dark:via-violet-950/35 dark:to-zinc-950`;
    case "node":
      return `overflow-hidden border border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-green-50/80 to-teal-50/40 dark:border-emerald-600/55 dark:from-emerald-950/45 dark:via-green-950/30 dark:to-zinc-950`;
    case "ts":
      return `overflow-hidden border border-blue-400/70 bg-gradient-to-br from-blue-50 via-sky-50/85 to-indigo-50/40 dark:border-blue-600/55 dark:from-blue-950/50 dark:via-sky-950/35 dark:to-zinc-950`;
    case "nest":
      return `overflow-hidden border border-red-400/65 bg-gradient-to-br from-red-50 via-orange-50/75 to-amber-50/35 dark:border-red-700/55 dark:from-red-950/45 dark:via-orange-950/28 dark:to-zinc-950`;
    case "next":
      return `overflow-hidden border border-zinc-300/90 bg-gradient-to-br from-white via-zinc-50/95 to-zinc-100/70 dark:border-zinc-600 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-black`;
    case "react":
      return `overflow-hidden border border-sky-400/70 bg-gradient-to-br from-sky-50 via-cyan-50/85 to-blue-50/45 dark:border-sky-600/55 dark:from-sky-950/48 dark:via-cyan-950/32 dark:to-zinc-950`;
    case "mongo":
      return `overflow-hidden border border-lime-400/70 bg-gradient-to-br from-lime-50 via-emerald-50/85 to-green-50/45 dark:border-lime-600/55 dark:from-lime-950/45 dark:via-emerald-950/32 dark:to-zinc-950`;
    case "pg":
      return `overflow-hidden border border-indigo-400/70 bg-gradient-to-br from-indigo-50 via-blue-50/85 to-slate-50/45 dark:border-indigo-600/55 dark:from-indigo-950/48 dark:via-blue-950/32 dark:to-zinc-950`;
    case "arch":
      return `overflow-hidden border border-amber-400/70 bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50/45 dark:border-amber-600/55 dark:from-amber-950/48 dark:via-orange-950/32 dark:to-zinc-950`;
    case "patterns":
      return `overflow-hidden border border-cyan-400/70 bg-gradient-to-br from-cyan-50 via-teal-50/75 to-sky-50/40 dark:border-cyan-600/55 dark:from-cyan-950/45 dark:via-teal-950/30 dark:to-zinc-950`;
    default:
      return `overflow-hidden border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950`;
  }
}

/** Chevron control: border/text/bg aligned with each track accent */
function trackDescChevronClass(accent: PromptTrackConfig["accent"]): string {
  switch (accent) {
    case "js":
      return "border-yellow-500/60 bg-yellow-100/90 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-950/70 dark:text-yellow-100";
    case "design":
      return "border-purple-500/50 bg-purple-100/90 text-purple-900 dark:border-purple-600 dark:bg-purple-950/70 dark:text-purple-100";
    case "node":
      return "border-emerald-500/50 bg-emerald-100/90 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-100";
    case "ts":
      return "border-blue-500/50 bg-blue-100/90 text-blue-900 dark:border-blue-600 dark:bg-blue-950/70 dark:text-blue-100";
    case "nest":
      return "border-red-500/50 bg-red-100/90 text-red-900 dark:border-red-700 dark:bg-red-950/70 dark:text-red-100";
    case "next":
      return "border-zinc-400/60 bg-zinc-200/90 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800/90 dark:text-zinc-100";
    case "react":
      return "border-sky-500/50 bg-sky-100/90 text-sky-950 dark:border-sky-600 dark:bg-sky-950/70 dark:text-sky-100";
    case "mongo":
      return "border-lime-500/50 bg-lime-100/90 text-lime-950 dark:border-lime-600 dark:bg-lime-950/70 dark:text-lime-100";
    case "pg":
      return "border-indigo-500/50 bg-indigo-100/90 text-indigo-950 dark:border-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-100";
    case "arch":
      return "border-amber-500/50 bg-amber-100/90 text-amber-950 dark:border-amber-600 dark:bg-amber-950/70 dark:text-amber-100";
    case "patterns":
      return "border-cyan-500/50 bg-cyan-100/90 text-cyan-950 dark:border-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-100";
    default:
      return "border-zinc-300/80 bg-white/90 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-300";
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
      let idx: number;
      if (ev.key === "0") {
        idx = 9;
      } else if (/^[1-9]$/.test(ev.key)) {
        idx = Number.parseInt(ev.key, 10) - 1;
      } else {
        return;
      }
      if (idx < 0 || idx >= slugOrder.length) {
        return;
      }
      ev.preventDefault();
      setSlug(slugOrder[idx]!);
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
        className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100/90 p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/85 sm:flex-wrap sm:overflow-x-visible"
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
              className={`shrink-0 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${
                selected
                  ? "bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 2. How to switch tracks (collapsible) — neutral slate/zinc (not green) */}
      <details
        className="tracks-help-details mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/98 to-zinc-100/55 open:[&_.tracks-help-chevron]:rotate-180 dark:border-zinc-700/85 dark:from-zinc-900/95 dark:via-zinc-950/92 dark:to-slate-950/75"
        open
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-200">
            Switch tracks in seconds
          </h3>
          <span
            className="tracks-help-chevron inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white/95 text-slate-600 transition-transform duration-200 dark:border-zinc-600 dark:bg-zinc-800/95 dark:text-zinc-200"
            aria-hidden
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </span>
        </summary>
        <div className="border-t border-slate-200/80 bg-linear-to-b from-transparent to-slate-50/50 px-4 py-3.5 dark:border-zinc-700/70 dark:to-zinc-950/40">
          <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
            <li>
              <strong className="font-semibold text-slate-900 dark:text-zinc-50">
                Click
              </strong>{" "}
              any tab above—the URL updates so you can bookmark or share (
              <code className="rounded border border-slate-200/80 bg-white px-1 font-mono text-[11px] text-slate-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
                ?track=…
              </code>
              ).
            </li>
            <li>
              Press{" "}
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
                1
              </kbd>
              –
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
                9
              </kbd>{" "}
              and{" "}
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
                0
              </kbd>{" "}
              (10th track) while focus is{" "}
              <strong className="font-semibold text-slate-900 dark:text-zinc-50">
                not
              </strong>{" "}
              in a text field to jump by position (JavaScript ={" "}
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[11px] dark:border-zinc-600 dark:bg-zinc-900">
                1
              </kbd>
              , …).
            </li>
            <li>
              Click inside the tab strip once, then use{" "}
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[11px] dark:border-zinc-600 dark:bg-zinc-900">
                ←
              </kbd>{" "}
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[11px] dark:border-zinc-600 dark:bg-zinc-900">
                →
              </kbd>{" "}
              (or up/down) to move between tracks.
            </li>
          </ul>
        </div>
      </details>

      {/* 3. Active track description (collapsible) */}
      <details
        className={`track-desc-details mt-5 rounded-2xl open:[&_.track-desc-chevron]:rotate-180 open:shadow-[0_20px_56px_-14px_rgba(0,0,0,0.12)] dark:open:shadow-[0_22px_60px_-10px_rgba(0,0,0,0.55)] ${trackSpotlightClass(activeTrack.accent)}`}
        open
      >
        <summary className="relative cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600/90 dark:text-zinc-400">
                Current track
              </p>
              <h3 className="mt-1 bg-linear-to-r from-zinc-900 to-zinc-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-zinc-50 dark:to-zinc-300">
                {activeTrack.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Expand for the full track description, or collapse to focus on
                scenarios below.
              </p>
            </div>
            <span
              className={`track-desc-chevron inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-md shadow-black/5 transition-transform duration-200 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.55),0_4px_14px_-4px_rgba(0,0,0,0.12)] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.45)] ${trackDescChevronClass(activeTrack.accent)}`}
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </div>
        </summary>
        <div className="relative border-t border-white/50 bg-linear-to-b from-white/30 to-transparent px-4 py-3 dark:border-zinc-600/45 dark:from-zinc-900/35 dark:to-transparent">
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {activeTrack.description}
          </p>
        </div>
      </details>

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

