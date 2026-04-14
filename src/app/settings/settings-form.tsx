"use client";

import { useCallback, useEffect, useState } from "react";

type SettingsPayload = {
  source: "env" | "database";
  provider: string;
  model: string;
  hasStoredApiKey: boolean;
  encryptionKeyConfigured: boolean;
};

export function SettingsForm() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as SettingsPayload;
      setData(json);
      setProvider(json.provider);
      setModel(json.model);
      setApiKey("");
    } catch {
      setLoadError("Could not load settings.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setSubmitError(null);
    setPending(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSubmitError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      await load();
    } finally {
      setPending(false);
    }
  }

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Active configuration source:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {data.source === "database" ? "database (overrides .env)" : ".env only"}
        </span>
        . API keys are never sent to the browser; only this server stores them.
      </p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void post({
            provider,
            model,
            ...(apiKey.trim() !== "" ? { apiKey } : {}),
          });
        }}
      >
        <div>
          <label
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="provider"
          >
            Provider
          </label>
          <select
            id="provider"
            className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google Gemini</option>
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="model"
          >
            Model id
          </label>
          <input
            id="model"
            type="text"
            className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. gpt-4o-mini"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Leave blank to use the default for the selected provider.
          </p>
        </div>
        <div>
          <label
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="apiKey"
          >
            API key (optional)
          </label>
          <input
            id="apiKey"
            type="password"
            className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              data.hasStoredApiKey
                ? "Leave empty to keep stored key"
                : "Paste key to store encrypted in SQLite"
            }
            autoComplete="off"
          />
          {!data.encryptionKeyConfigured && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Set{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                SETTINGS_ENCRYPTION_KEY
              </code>{" "}
              on the server to enable storing a key in the database.
            </p>
          )}
        </div>
        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={pending || !data.hasStoredApiKey}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => void post({ clearApiKey: true })}
          >
            Remove stored API key
          </button>
          <button
            type="button"
            disabled={pending || data.source !== "database"}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            onClick={() => {
              if (
                !globalThis.confirm(
                  "Remove all saved LLM settings and fall back to .env?",
                )
              ) {
                return;
              }
              void post({ clear: true });
            }}
          >
            Reset all saved settings
          </button>
        </div>
      </form>
    </div>
  );
}
