"use client";

import { ArrowDown, ArrowLeft, Download, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChatMessage } from "@/components/chat-message";
import { RubricPanel } from "@/components/rubric-panel";
import { Banner, Button } from "@/components/ui";
import { buildSessionMarkdown } from "@/lib/export/markdown";
import { DEFAULT_MODEL_BY_PROVIDER } from "@/lib/llm/providers";
import type { Rubric } from "@/lib/llm/schema";
import { getPromptById } from "@/lib/prompts";
import { CATEGORY_LABEL, type PracticePrompt } from "@/lib/prompts/types";
import { useVault } from "@/lib/settings/vault-context";
import { UnlockDialog } from "@/lib/settings/vault-gate";
import {
  appendMessage,
  deleteSession as storeDeleteSession,
  getSession,
  subscribe,
  type StoredMessage,
  type StoredSession,
} from "@/lib/storage/client-store";

type ChatApiResponse = {
  message: string;
  phase: string;
  sessionComplete: boolean;
  rubric: Rubric | null;
  error?: string;
};

type AssistantMeta = {
  phase: string;
  session_complete: boolean;
  rubric: Rubric | null;
};

function toHistory(messages: StoredMessage[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role === "user" || m.role === "assistant") {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

function parseAssistantMeta(raw: string | null): AssistantMeta | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssistantMeta;
  } catch {
    return null;
  }
}

function SessionSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading session"
    >
      <div className="space-y-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <section className="flex min-h-128 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mr-auto h-20 w-2/3 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
        <div className="ml-auto h-16 w-1/2 animate-pulse rounded-lg bg-emerald-100 dark:bg-emerald-900/40" />
        <div className="mr-auto h-24 w-3/4 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900/60" />
      </section>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="mr-auto flex max-w-[min(100%,52rem)] items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60"
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 [animation-delay:-0.3s] dark:bg-zinc-500" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 [animation-delay:-0.15s] dark:bg-zinc-500" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
    </div>
  );
}

function findLatestRubric(messages: StoredMessage[]): Rubric | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    const meta = parseAssistantMeta(m.metadataJson);
    if (meta?.session_complete && meta.rubric) {
      return meta.rubric;
    }
  }
  return null;
}

export function SessionWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const vault = useVault();
  const [session, setSession] = useState<StoredSession | null | undefined>(
    undefined,
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const bootstrapStartedRef = useRef(false);
  const pendingActionRef = useRef<null | "send" | "bootstrap">(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composerFocusedOnce = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastMessageCountRef = useRef(0);

  const prompt: PracticePrompt | null = useMemo(
    () => (session ? (getPromptById(session.promptId) ?? null) : null),
    [session],
  );

  const rubric = useMemo(
    () => (session ? findLatestRubric(session.messages) : null),
    [session],
  );
  const sessionComplete = rubric != null;

  useEffect(() => {
    const hydrate = () => setSession(getSession(sessionId));
    hydrate();
    return subscribe(hydrate);
  }, [sessionId]);

  useEffect(() => {
    const target = bottomRef.current;
    const root = scrollContainerRef.current;
    if (!target || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setAtBottom(visible);
        if (visible) setUnreadCount(0);
      },
      { root, threshold: 0.01, rootMargin: "0px 0px 48px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const count = session?.messages?.length ?? 0;
    if (count === 0) {
      lastMessageCountRef.current = 0;
      return;
    }
    const previous = lastMessageCountRef.current;
    lastMessageCountRef.current = count;
    if (count <= previous) return;
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setUnreadCount((c) => c + (count - previous));
    }
  }, [session?.messages?.length, atBottom]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (session && !sessionComplete && !composerFocusedOnce.current) {
      textareaRef.current?.focus();
      composerFocusedOnce.current = true;
    }
  }, [session, sessionComplete]);

  function ensureUnlocked(intent: "send" | "bootstrap"): boolean {
    if (vault.status === "unlocked") return true;
    pendingActionRef.current = intent;
    setUnlockOpen(true);
    return false;
  }

  const callChatApi = useCallback(
    async (history: { role: "user" | "assistant"; content: string }[], bootstrap: boolean) => {
      const apiKey = vault.getApiKey();
      if (!apiKey) {
        throw new Error("Vault is locked");
      }
      const provider = vault.provider;
      const model = vault.model.trim() || DEFAULT_MODEL_BY_PROVIDER[provider];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-llm-api-key": apiKey,
        },
        body: JSON.stringify({
          promptId: session?.promptId,
          history,
          bootstrap,
          provider,
          model,
          preferredLanguage:
            typeof navigator !== "undefined" ? navigator.language : undefined,
        }),
      });

      const json = (await res.json()) as ChatApiResponse;
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      return json;
    },
    [session?.promptId, vault],
  );

  const runBootstrap = useCallback(async () => {
    if (!session) return;
    setSending(true);
    setChatError(null);
    try {
      const resp = await callChatApi([], true);
      const meta: AssistantMeta = {
        phase: resp.phase,
        session_complete: resp.sessionComplete,
        rubric: resp.rubric,
      };
      appendMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: resp.message,
        metadataJson: JSON.stringify(meta),
      });
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setSending(false);
    }
  }, [callChatApi, session, sessionId]);

  // Auto-bootstrap once for a newly created session with zero messages.
  useEffect(() => {
    if (!session) return;
    if (session.messages.length > 0) return;
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;
    if (!ensureUnlocked("bootstrap")) {
      // Allow re-triggering after cancel → unlock via header.
      bootstrapStartedRef.current = false;
      return;
    }
    void runBootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, vault.status]);

  async function send() {
    const text = input.trim();
    if (!text || sending || sessionComplete || !session) return;
    if (!ensureUnlocked("send")) return;

    setSending(true);
    setChatError(null);
    setInput("");

    const userMessageId = crypto.randomUUID();
    appendMessage(sessionId, {
      id: userMessageId,
      role: "user",
      content: text,
    });

    try {
      const history = [
        ...toHistory(session.messages),
        { role: "user" as const, content: text },
      ];
      const resp = await callChatApi(history, false);
      const meta: AssistantMeta = {
        phase: resp.phase,
        session_complete: resp.sessionComplete,
        rubric: resp.rubric,
      };
      appendMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: resp.message,
        metadataJson: JSON.stringify(meta),
      });
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (sessionComplete || sending) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void send();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function downloadExport() {
    if (!session) return;
    const transcript = session.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    const md = buildSessionMarkdown({
      title: session.title,
      promptSummary: prompt?.summary ?? "",
      createdAt: new Date(session.createdAt),
      transcript,
      rubric,
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${sessionId.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleDelete() {
    if (
      !globalThis.confirm(
        "Delete this session permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    storeDeleteSession(sessionId);
    router.push("/");
  }

  function onUnlocked() {
    const intent = pendingActionRef.current;
    pendingActionRef.current = null;
    if (intent === "bootstrap") {
      void runBootstrap();
    } else if (intent === "send") {
      const text = input.trim();
      if (text) void send();
    }
  }

  if (session === undefined) {
    return <SessionSkeleton />;
  }

  if (session === null) {
    return <Banner tone="error">Session not found in this browser.</Banner>;
  }

  const trackLabel = prompt ? CATEGORY_LABEL[prompt.category] : "Session";
  const messages = session.messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200/80 bg-zinc-50/95 pb-4 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/95">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {trackLabel}
            {prompt?.primaryLanguage && (
              <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-normal text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {prompt.primaryLanguage}
              </span>
            )}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {session.title}
          </h1>
          {prompt && (
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
              {prompt.candidateBrief}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={downloadExport}
            iconLeft={<Download className="h-4 w-4" aria-hidden />}
          >
            Export Markdown
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            iconLeft={<Trash2 className="h-4 w-4" aria-hidden />}
          >
            Delete session
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
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
            completion. Language follows your browser settings and mirrors your
            messages when you switch language.
          </p>
        </div>
        <div
          ref={scrollContainerRef}
          className="relative flex max-h-[min(70dvh,720px)] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role as "user" | "assistant"}>
              {m.content}
            </ChatMessage>
          ))}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
          {!atBottom && unreadCount > 0 && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="sticky bottom-2 mx-auto inline-flex items-center gap-1.5 self-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              aria-label={`${unreadCount} new messages — scroll to bottom`}
            >
              <ArrowDown className="h-3 w-3" aria-hidden />
              {unreadCount} new{unreadCount > 1 ? " messages" : " message"}
            </button>
          )}
        </div>
        {chatError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
            {chatError}
          </div>
        )}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={3}
              disabled={sending || sessionComplete}
              placeholder={
                sessionComplete
                  ? "Session complete — review the rubric or export."
                  : "Type your answer…"
              }
              className="min-h-20 flex-1 resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-inner outline-none focus:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <Button
              onClick={() => void send()}
              loading={sending}
              disabled={sending || sessionComplete || !input.trim()}
              iconLeft={
                sending ? undefined : <Send className="h-4 w-4" aria-hidden />
              }
              className="self-end"
            >
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
            <span className="hidden sm:inline">
              Enter to send · Shift+Enter new line · Ctrl or ⌘ + Enter to send ·{" "}
            </span>
            <span className="sm:hidden">
              Enter sends · Shift+Enter for newline ·{" "}
            </span>
            Focus returns here after load.
          </p>
        </div>
      </section>

      <UnlockDialog
        open={unlockOpen}
        onClose={() => {
          setUnlockOpen(false);
          pendingActionRef.current = null;
        }}
        onUnlocked={onUnlocked}
      />
    </div>
  );
}
