"use client";

import type { Rubric } from "@/lib/llm/schema";

type Props = {
  rubric: Rubric;
};

export function RubricPanel({ rubric }: Props) {
  return (
    <div className="rounded-lg border border-violet-300/60 bg-violet-50/80 p-4 dark:border-violet-500/30 dark:bg-violet-950/40">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-violet-950 dark:text-violet-100">
          Rubric
        </h2>
        <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
          {rubric.overall_score}/10
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
        {rubric.summary}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {rubric.dimensions.map((d) => (
          <li
            key={d.name}
            className="rounded-md border border-violet-200/70 bg-white/70 px-3 py-2 dark:border-violet-500/20 dark:bg-zinc-950/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {d.name}
              </span>
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                {d.score}/10
              </span>
            </div>
            <p className="mt-1 text-zinc-700 dark:text-zinc-300">{d.comment}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Topics to review before your interview
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
          {rubric.study_next.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
