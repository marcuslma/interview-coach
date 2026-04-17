"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getPromptById } from "@/lib/prompts";
import { createSession } from "@/lib/storage/client-store";

export function StartSessionButton({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setLoading(true);
    setError(null);

    try {
      const prompt = getPromptById(promptId);
      if (!prompt) {
        setError("Unknown prompt");
        return;
      }

      const sessionId = crypto.randomUUID();
      createSession({ id: sessionId, promptId, title: prompt.title });
      router.push(`/session/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Starting…" : "Start session"}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
