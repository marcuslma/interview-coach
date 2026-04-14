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

/** Highlight panel: luminous gradient + tinted shadow + ring per track */
function trackSpotlightClass(accent: PromptTrackConfig["accent"]): string {
  const glow = {
    js: "shadow-[0_14px_44px_-12px_rgba(234,179,8,0.45)] dark:shadow-[0_14px_48px_-10px_rgba(234,179,8,0.22)]",
    design:
      "shadow-[0_14px_44px_-12px_rgba(168,85,247,0.4)] dark:shadow-[0_14px_48px_-10px_rgba(168,85,247,0.2)]",
    node: "shadow-[0_14px_44px_-12px_rgba(16,185,129,0.42)] dark:shadow-[0_14px_48px_-10px_rgba(16,185,129,0.2)]",
    ts: "shadow-[0_14px_44px_-12px_rgba(59,130,246,0.42)] dark:shadow-[0_14px_48px_-10px_rgba(59,130,246,0.2)]",
    nest: "shadow-[0_14px_44px_-12px_rgba(239,68,68,0.38)] dark:shadow-[0_14px_48px_-10px_rgba(239,68,68,0.18)]",
    next: "shadow-[0_14px_44px_-12px_rgba(113,113,122,0.35)] dark:shadow-[0_14px_48px_-10px_rgba(0,0,0,0.5)]",
    arch: "shadow-[0_14px_44px_-12px_rgba(245,158,11,0.4)] dark:shadow-[0_14px_48px_-10px_rgba(245,158,11,0.2)]",
    patterns:
      "shadow-[0_14px_44px_-12px_rgba(6,182,212,0.42)] dark:shadow-[0_14px_48px_-10px_rgba(6,182,212,0.2)]",
    default:
      "shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)]",
  } as const;

  switch (accent) {
    case "js":
      return `overflow-hidden border-2 border-yellow-400/75 bg-gradient-to-br from-yellow-50 via-amber-50/90 to-orange-50/50 ring-2 ring-yellow-200/70 ring-offset-2 ring-offset-white/90 ${glow.js} dark:border-yellow-600/60 dark:from-yellow-950/55 dark:via-amber-950/35 dark:to-zinc-950 dark:ring-yellow-800/50 dark:ring-offset-zinc-950`;
    case "design":
      return `overflow-hidden border-2 border-purple-400/70 bg-gradient-to-br from-purple-50 via-violet-50/85 to-fuchsia-50/45 ring-2 ring-purple-200/65 ring-offset-2 ring-offset-white/90 ${glow.design} dark:border-purple-600/55 dark:from-purple-950/50 dark:via-violet-950/35 dark:to-zinc-950 dark:ring-purple-800/45 dark:ring-offset-zinc-950`;
    case "node":
      return `overflow-hidden border-2 border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-green-50/80 to-teal-50/40 ring-2 ring-emerald-200/60 ring-offset-2 ring-offset-white/90 ${glow.node} dark:border-emerald-600/55 dark:from-emerald-950/45 dark:via-green-950/30 dark:to-zinc-950 dark:ring-emerald-800/40 dark:ring-offset-zinc-950`;
    case "ts":
      return `overflow-hidden border-2 border-blue-400/70 bg-gradient-to-br from-blue-50 via-sky-50/85 to-indigo-50/40 ring-2 ring-blue-200/65 ring-offset-2 ring-offset-white/90 ${glow.ts} dark:border-blue-600/55 dark:from-blue-950/50 dark:via-sky-950/35 dark:to-zinc-950 dark:ring-blue-800/45 dark:ring-offset-zinc-950`;
    case "nest":
      return `overflow-hidden border-2 border-red-400/65 bg-gradient-to-br from-red-50 via-orange-50/75 to-amber-50/35 ring-2 ring-red-200/55 ring-offset-2 ring-offset-white/90 ${glow.nest} dark:border-red-700/55 dark:from-red-950/45 dark:via-orange-950/28 dark:to-zinc-950 dark:ring-red-900/40 dark:ring-offset-zinc-950`;
    case "next":
      return `overflow-hidden border-2 border-zinc-300/90 bg-gradient-to-br from-white via-zinc-50/95 to-zinc-100/70 ring-2 ring-zinc-200/80 ring-offset-2 ring-offset-white/90 ${glow.next} dark:border-zinc-600 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-black dark:ring-zinc-700/70 dark:ring-offset-zinc-950`;
    case "arch":
      return `overflow-hidden border-2 border-amber-400/70 bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50/45 ring-2 ring-amber-200/60 ring-offset-2 ring-offset-white/90 ${glow.arch} dark:border-amber-600/55 dark:from-amber-950/48 dark:via-orange-950/32 dark:to-zinc-950 dark:ring-amber-800/42 dark:ring-offset-zinc-950`;
    case "patterns":
      return `overflow-hidden border-2 border-cyan-400/70 bg-gradient-to-br from-cyan-50 via-teal-50/75 to-sky-50/40 ring-2 ring-cyan-200/58 ring-offset-2 ring-offset-white/90 ${glow.patterns} dark:border-cyan-600/55 dark:from-cyan-950/45 dark:via-teal-950/30 dark:to-zinc-950 dark:ring-cyan-800/42 dark:ring-offset-zinc-950`;
    default:
      return `overflow-hidden border-2 border-zinc-200 bg-gradient-to-br from-zinc-50 to-white ${glow.default} ring-2 ring-zinc-200/80 ring-offset-2 ring-offset-white dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950 dark:ring-zinc-700/60 dark:ring-offset-zinc-950`;
  }
}

/** Chevron control: border/text/bg aligned with each track accent */
function trackDescChevronClass(accent: PromptTrackConfig["accent"]): string {
  switch (accent) {
    case "js":
      return "border-yellow-500/60 bg-yellow-100/90 text-yellow-900 shadow-yellow-200/50 ring-1 ring-yellow-300/40 dark:border-yellow-600 dark:bg-yellow-950/70 dark:text-yellow-100 dark:shadow-none dark:ring-yellow-800/50";
    case "design":
      return "border-purple-500/50 bg-purple-100/90 text-purple-900 shadow-purple-200/40 ring-1 ring-purple-300/35 dark:border-purple-600 dark:bg-purple-950/70 dark:text-purple-100 dark:ring-purple-800/45";
    case "node":
      return "border-emerald-500/50 bg-emerald-100/90 text-emerald-900 shadow-emerald-200/40 ring-1 ring-emerald-300/35 dark:border-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-100 dark:ring-emerald-800/45";
    case "ts":
      return "border-blue-500/50 bg-blue-100/90 text-blue-900 shadow-blue-200/40 ring-1 ring-blue-300/35 dark:border-blue-600 dark:bg-blue-950/70 dark:text-blue-100 dark:ring-blue-800/45";
    case "nest":
      return "border-red-500/50 bg-red-100/90 text-red-900 shadow-red-200/40 ring-1 ring-red-300/35 dark:border-red-700 dark:bg-red-950/70 dark:text-red-100 dark:ring-red-900/40";
    case "next":
      return "border-zinc-400/60 bg-zinc-200/90 text-zinc-900 shadow-zinc-300/40 ring-1 ring-zinc-400/30 dark:border-zinc-500 dark:bg-zinc-800/90 dark:text-zinc-100 dark:ring-zinc-600/50";
    case "arch":
      return "border-amber-500/50 bg-amber-100/90 text-amber-950 shadow-amber-200/40 ring-1 ring-amber-300/35 dark:border-amber-600 dark:bg-amber-950/70 dark:text-amber-100 dark:ring-amber-800/45";
    case "patterns":
      return "border-cyan-500/50 bg-cyan-100/90 text-cyan-950 shadow-cyan-200/40 ring-1 ring-cyan-300/35 dark:border-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-100 dark:ring-cyan-800/45";
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
                  ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-700/80"
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
        className="tracks-help-details mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/98 to-zinc-100/55 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.14)] ring-1 ring-white/90 open:shadow-[0_18px_48px_-12px_rgba(15,23,42,0.18)] open:[&_.tracks-help-chevron]:rotate-180 dark:border-zinc-700/85 dark:from-zinc-900/95 dark:via-zinc-950/92 dark:to-slate-950/75 dark:shadow-[0_14px_44px_-8px_rgba(0,0,0,0.55)] dark:ring-zinc-600/35"
        open
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-200">
            Switch tracks in seconds
          </h3>
          <span
            className="tracks-help-chevron inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm ring-1 ring-slate-100/90 transition-transform duration-200 dark:border-zinc-600 dark:bg-zinc-800/95 dark:text-zinc-200 dark:ring-zinc-700/60"
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
        <div className="border-t border-slate-200/80 bg-gradient-to-b from-transparent to-slate-50/50 px-4 py-3.5 dark:border-zinc-700/70 dark:to-zinc-950/40">
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
                8
              </kbd>{" "}
              while focus is{" "}
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
        <summary className="relative cursor-pointer list-none px-4 py-4 marker:content-none sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-transparent opacity-90 dark:from-white/5 dark:opacity-100"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600/90 dark:text-zinc-400">
                Current track
              </p>
              <h3 className="mt-1 bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl dark:from-zinc-50 dark:to-zinc-300">
                {activeTrack.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Expand for the full track description, or collapse to focus on
                scenarios below.
              </p>
            </div>
            <span
              className={`track-desc-chevron inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-md shadow-black/5 transition-transform duration-200 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.55),0_4px_14px_-4px_rgba(0,0,0,0.12)] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.45)] ${trackDescChevronClass(activeTrack.accent)}`}
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
        <div className="relative border-t border-white/50 bg-gradient-to-b from-white/30 to-transparent px-5 pb-5 pt-3 dark:border-zinc-600/45 dark:from-zinc-900/35 dark:to-transparent sm:px-6 sm:pb-6">
          <p className="text-base leading-relaxed text-zinc-800 sm:text-[1.05rem] dark:text-zinc-200">
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

