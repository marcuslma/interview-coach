"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { RubricPanel } from "@/components/rubric-panel";
import type { Rubric } from "@/lib/llm/schema";
import { CATEGORY_LABEL, type PracticeCategory } from "@/lib/prompts/types";

type ApiMessage = {
  id: string;
  role: string;
  content: string;
  metadataJson: string | null;
  createdAt: string;
};

type SessionPayload = {
  session: {
    id: string;
    promptId: string;
    title: string;
  };
  prompt: {
    category: PracticeCategory;
    candidateBrief: string;
    summary: string;
    primaryLanguage: string | null;
  } | null;
  messages: ApiMessage[];
};

export function SessionWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [data, setData] = useState<SessionPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) {
      setLoadError("Could not load session");
      return;
    }
    const json = (await res.json()) as SessionPayload;
    setData(json);
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (data?.messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages.length]);

  const rubric: Rubric | null = useMemo(() => {
    if (!data?.messages?.length) {
      return null;
    }

    for (let i = data.messages.length - 1; i >= 0; i--) {
      const m = data.messages[i];

      if (m.role !== "assistant" || !m.metadataJson) {
        continue;
      }

      try {
        const meta = JSON.parse(m.metadataJson) as {
          session_complete?: boolean;
          rubric?: Rubric;
        };

        if (meta.session_complete && meta.rubric) {
          return meta.rubric;
        }
      } catch {
        return null;
      }
    }

    return null;
  }, [data?.messages]);

  const sessionComplete = useMemo(() => rubric != null, [rubric]);

  async function send() {
    const text = input.trim();

    if (!text || sending || sessionComplete) {
      return;
    }

    setSending(true);
    setChatError(null);
    setInput("");

    const optimistic: ApiMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      metadataJson: null,
      createdAt: new Date().toISOString(),
    };

    setData((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev,
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: text }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Request failed");
      }

      await refresh();
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to send");
      await refresh();
    } finally {
      setSending(false);
    }
  }

  async function downloadExport() {
    const res = await fetch(`/api/sessions/${sessionId}/export`);

    if (!res.ok) {
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${sessionId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteSession() {
    if (
      !globalThis.confirm(
        "Delete this session permanently? This cannot be undone.",
      )
    ) {
      return;
    }
 
    setDeleting(true);
 
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
        {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading session…
      </div>
    );
  }

  const trackLabel = data.prompt
    ? CATEGORY_LABEL[data.prompt.category]
    : "Session";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {trackLabel}
            {data.prompt?.primaryLanguage && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-normal text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {data.prompt.primaryLanguage}
              </span>
            )}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {data.session.title}
          </h1>
          {data.prompt && (
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
              {data.prompt.candidateBrief}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void downloadExport()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Export Markdown
          </button>
          <button
            type="button"
            onClick={() => void deleteSession()}
            disabled={deleting}
            className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
          >
            {deleting ? "Deleting…" : "Delete session"}
          </button>
          <Link
            href="/"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Library
          </Link>
        </div>
      </header>

      {rubric && <RubricPanel rubric={rubric} />}

      <section className="flex min-h-128 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Chat
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Answer in your own words. The interviewer replies in phases until
            completion.
          </p>
        </div>
        <div className="flex max-h-[min(70vh,720px)] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {data.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => (
              <ChatMessage key={m.id} role={m.role as "user" | "assistant"}>
                {m.content}
              </ChatMessage>
            ))}
          <div ref={bottomRef} />
        </div>
        {chatError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
            {chatError}
          </div>
        )}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              disabled={sending || sessionComplete}
              placeholder={
                sessionComplete
                  ? "Session complete — review the rubric or export."
                  : "Type your answer…"
              }
              className="min-h-20 flex-1 resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-inner outline-none focus:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || sessionComplete || !input.trim()}
              className="self-end rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
