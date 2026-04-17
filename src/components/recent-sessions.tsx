"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PracticeCategory } from "@/lib/prompts/types";
import { CATEGORY_LABEL } from "@/lib/prompts/types";
import { getPromptById } from "@/lib/prompts";
import {
  deleteSession,
  listSessions,
  subscribe,
  type StoredSession,
} from "@/lib/storage/client-store";

type RecentSessionRow = {
  id: string;
  title: string;
  updatedAt: string;
  category: PracticeCategory;
};

function toRow(s: StoredSession): RecentSessionRow {
  const p = getPromptById(s.promptId);
  return {
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt,
    category: p?.category ?? "javascript",
  };
}

export function RecentSessions() {
  const [rows, setRows] = useState<RecentSessionRow[] | null>(null);

  useEffect(() => {
    const hydrate = () => {
      setRows(listSessions().slice(0, 12).map(toRow));
    };
    hydrate();
    return subscribe(hydrate);
  }, []);

  function remove(id: string) {
    if (
      !globalThis.confirm("Delete this session? This cannot be undone.")
    ) {
      return;
    }
    deleteSession(id);
  }

  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Recent sessions
      </h2>
      <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40">
        {rows.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-2 px-3 py-2"
          >
            <Link
              href={`/session/${s.id}`}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/60 sm:py-0"
            >
              <span className="min-w-0 truncate font-medium text-zinc-900 dark:text-zinc-50">
                {s.title}
              </span>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(s.updatedAt).toLocaleString()}
              </span>
            </Link>
            <span className="hidden shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:inline dark:bg-zinc-800 dark:text-zinc-300">
              {CATEGORY_LABEL[s.category]}
            </span>
            <button
              type="button"
              onClick={() => remove(s.id)}
              className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
              aria-label={`Delete session ${s.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
