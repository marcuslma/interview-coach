/**
 * Browser-side store for chat sessions, messages, and LLM settings.
 *
 * Persistence:
 * - Primary: `localStorage` under a single JSON document keyed by STORAGE_KEY.
 * - Fallback: in-memory object when `localStorage` is unavailable (SSR, private
 *   mode, storage quota, etc.) so the app still boots without crashing.
 *
 * Snapshot caching:
 * - A module-scoped `cachedSnapshot` guarantees referential stability so
 *   `useSyncExternalStore` consumers do not re-render in a loop. Writes
 *   replace the cached reference; cross-tab events invalidate and re-read.
 *
 * Schema:
 * - Versioned; future migrations can upgrade older snapshots.
 * - Secrets (encrypted API key + salt) live under `settings`; the decrypted
 *   key NEVER touches this store.
 */
import type { LlmProviderId } from "@/lib/llm/providers";

const STORAGE_KEY = "interview-coach:v1";
const BROADCAST_CHANNEL = "interview-coach:v1";
export const SCHEMA_VERSION = 1;

export type StoredRole = "user" | "assistant";

export type StoredMessage = {
  id: string;
  role: StoredRole;
  content: string;
  /** Stringified assistant metadata: { phase, session_complete, rubric } */
  metadataJson: string | null;
  createdAt: string;
};

export type StoredSession = {
  id: string;
  promptId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
};

export type StoredSettings = {
  /** Selected LLM provider id (openai | anthropic | google). */
  provider: LlmProviderId;
  /** Selected model id; when empty, the app falls back to the provider default. */
  model: string;
  /** AES-GCM ciphertext (base64url(iv||ct||tag)) of the API key, or null. */
  encryptedApiKey: string | null;
  /** PBKDF2 salt (base64url), or null when `encryptedApiKey` is null. */
  salt: string | null;
};

export type StoreSnapshot = {
  version: number;
  sessions: StoredSession[];
  settings: StoredSettings;
};

const DEFAULT_SETTINGS: StoredSettings = {
  provider: "openai",
  model: "",
  encryptedApiKey: null,
  salt: null,
};

/**
 * Stable SSR snapshot. Both value and its `settings` child are module-level
 * constants so referential identity survives across renders.
 */
const SSR_SNAPSHOT: StoreSnapshot = Object.freeze({
  version: SCHEMA_VERSION,
  sessions: [],
  settings: Object.freeze({ ...DEFAULT_SETTINGS }) as StoredSettings,
}) as StoreSnapshot;

function emptySnapshot(): StoreSnapshot {
  return {
    version: SCHEMA_VERSION,
    sessions: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Returns true when running in a browser with a usable localStorage. */
function hasLocalStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const probeKey = "__ic_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shallow validator for a parsed snapshot. Runs on every load so a tampered or
 * partially-written payload degrades to a fresh empty snapshot instead of
 * throwing at the call site.
 */
function normalizeSnapshot(raw: unknown): StoreSnapshot {
  if (!raw || typeof raw !== "object") {
    return emptySnapshot();
  }
  const obj = raw as Record<string, unknown>;
  const version = typeof obj.version === "number" ? obj.version : 0;

  const sessions = Array.isArray(obj.sessions)
    ? (obj.sessions as StoredSession[]).filter(
        (s) => s && typeof s.id === "string" && Array.isArray(s.messages),
      )
    : [];

  const rawSettings = (obj.settings ?? {}) as Partial<StoredSettings>;
  const provider: LlmProviderId =
    rawSettings.provider === "anthropic" || rawSettings.provider === "google"
      ? rawSettings.provider
      : "openai";

  const settings: StoredSettings = {
    provider,
    model: typeof rawSettings.model === "string" ? rawSettings.model : "",
    encryptedApiKey:
      typeof rawSettings.encryptedApiKey === "string"
        ? rawSettings.encryptedApiKey
        : null,
    salt: typeof rawSettings.salt === "string" ? rawSettings.salt : null,
  };

  return { version: version || SCHEMA_VERSION, sessions, settings };
}

/** Last materialized snapshot. Referentially stable across reads. */
let cachedSnapshot: StoreSnapshot | null = null;
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL);
  }
  return channel;
}

function readFromStorage(): StoreSnapshot {
  if (!hasLocalStorage()) {
    return emptySnapshot();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptySnapshot();
    }
    return normalizeSnapshot(JSON.parse(raw));
  } catch {
    return emptySnapshot();
  }
}

function persist(snap: StoreSnapshot): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    // Quota exceeded or blocked — keep the in-memory snapshot anyway.
  }
}

function ensureSnapshot(): StoreSnapshot {
  if (cachedSnapshot) return cachedSnapshot;
  cachedSnapshot = readFromStorage();
  return cachedSnapshot;
}

/**
 * Commit a new snapshot: update the cache, persist, and fan out.
 * Accepts a producer so callers can derive from the current snapshot safely.
 */
function commit(next: StoreSnapshot, broadcast = true): void {
  cachedSnapshot = next;
  persist(next);
  notifyListeners();
  if (broadcast) {
    getChannel()?.postMessage({ type: "store:update" });
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      // Never let one broken subscriber block the others.
    }
  }
}

function attachCrossTabListenersOnce(): void {
  if (typeof window === "undefined") {
    return;
  }
  if ((attachCrossTabListenersOnce as unknown as { attached?: boolean }).attached) {
    return;
  }
  (attachCrossTabListenersOnce as unknown as { attached?: boolean }).attached = true;

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    // Another tab wrote — re-materialize and notify.
    cachedSnapshot = readFromStorage();
    notifyListeners();
  });

  const ch = getChannel();
  if (ch) {
    ch.addEventListener("message", (e) => {
      if ((e.data as { type?: string } | null)?.type !== "store:update") {
        return;
      }
      cachedSnapshot = readFromStorage();
      notifyListeners();
    });
  }
}

export function subscribe(listener: Listener): () => void {
  attachCrossTabListenersOnce();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* ----------------------------- Public API ----------------------------- */

/**
 * Stable snapshot for `useSyncExternalStore`. The returned reference changes
 * only when `commit()` runs (local write or cross-tab event).
 */
export function getSnapshot(): StoreSnapshot {
  if (typeof window === "undefined") return SSR_SNAPSHOT;
  return ensureSnapshot();
}

/** Server snapshot — stable module constant, safe for SSR hydration. */
export function getServerSnapshot(): StoreSnapshot {
  return SSR_SNAPSHOT;
}

export function listSessions(): StoredSession[] {
  const { sessions } = getSnapshot();
  return [...sessions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getSession(id: string): StoredSession | null {
  return getSnapshot().sessions.find((s) => s.id === id) ?? null;
}

export function createSession(input: {
  id: string;
  promptId: string;
  title: string;
}): StoredSession {
  const now = new Date().toISOString();
  const session: StoredSession = {
    id: input.id,
    promptId: input.promptId,
    title: input.title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  const current = ensureSnapshot();
  const next: StoreSnapshot = {
    ...current,
    sessions: [session, ...current.sessions],
  };
  commit(next);
  return session;
}

export function appendMessage(
  sessionId: string,
  message: {
    id: string;
    role: StoredRole;
    content: string;
    metadataJson?: string | null;
  },
): StoredSession | null {
  const current = ensureSnapshot();
  const idx = current.sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) {
    return null;
  }
  const now = new Date().toISOString();
  const stored: StoredMessage = {
    id: message.id,
    role: message.role,
    content: message.content,
    metadataJson: message.metadataJson ?? null,
    createdAt: now,
  };
  const session = current.sessions[idx];
  const updated: StoredSession = {
    ...session,
    updatedAt: now,
    messages: [...session.messages, stored],
  };
  const next: StoreSnapshot = {
    ...current,
    sessions: [
      updated,
      ...current.sessions.slice(0, idx),
      ...current.sessions.slice(idx + 1),
    ],
  };
  commit(next);
  return updated;
}

export function deleteSession(id: string): void {
  const current = ensureSnapshot();
  const next: StoreSnapshot = {
    ...current,
    sessions: current.sessions.filter((s) => s.id !== id),
  };
  commit(next);
}

export function getSettings(): StoredSettings {
  return getSnapshot().settings;
}

export function updateSettings(
  patch: Partial<StoredSettings>,
): StoredSettings {
  const current = ensureSnapshot();
  const settings: StoredSettings = { ...current.settings, ...patch };
  const next: StoreSnapshot = { ...current, settings };
  commit(next);
  return settings;
}

/** Wipes every session (keeps settings). Used by "clear history". */
export function clearSessions(): void {
  const current = ensureSnapshot();
  const next: StoreSnapshot = { ...current, sessions: [] };
  commit(next);
}

/** Wipes the encrypted key + salt but keeps provider/model and sessions. */
export function clearEncryptedKey(): StoredSettings {
  return updateSettings({ encryptedApiKey: null, salt: null });
}
