"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  type LlmProviderId,
} from "@/lib/llm/providers";
import { clearSessions } from "@/lib/storage/client-store";
import { useVault } from "@/lib/settings/vault-context";

const PROVIDER_OPTIONS: { value: LlmProviderId; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google Gemini" },
];

export function SettingsForm() {
  const vault = useVault();

  if (vault.status === "empty") {
    return <EmptyState />;
  }

  if (vault.status === "locked") {
    return <LockedState />;
  }

  return <UnlockedState />;
}

/* ----------------------------- Empty state ----------------------------- */

function EmptyState() {
  const vault = useVault();
  const [provider, setProvider] = useState<LlmProviderId>(vault.provider);
  const [model, setModel] = useState(
    vault.model || DEFAULT_MODEL_BY_PROVIDER[vault.provider],
  );
  const [apiKey, setApiKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passphraseTooShort = passphrase.length > 0 && passphrase.length < 8;
  const passphraseMismatch =
    confirmPassphrase.length > 0 && confirmPassphrase !== passphrase;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!apiKey.trim()) {
      setError("Paste your API key.");
      return;
    }
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match.");
      return;
    }
    setLoading(true);
    try {
      await vault.setup({
        apiKey: apiKey.trim(),
        provider,
        model: model.trim(),
        passphrase,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Banner tone="info">
        No API key is stored on this device yet. Finish the setup below to
        begin practicing.
      </Banner>

      <ProviderAndModelFields
        provider={provider}
        model={model}
        onProviderChange={(p) => {
          setProvider(p);
          if (!model || model === DEFAULT_MODEL_BY_PROVIDER[provider]) {
            setModel(DEFAULT_MODEL_BY_PROVIDER[p]);
          }
        }}
        onModelChange={setModel}
      />

      <Field label="API key" htmlFor="api-key">
        <input
          id="api-key"
          type="password"
          autoComplete="off"
          className={inputClass}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            provider === "openai"
              ? "sk-…"
              : provider === "anthropic"
                ? "sk-ant-…"
                : "AIza…"
          }
        />
      </Field>

      <Field
        label="Passphrase"
        htmlFor="passphrase"
        hint="At least 8 characters. The passphrase encrypts your API key and is never transmitted anywhere — we cannot recover it for you."
      >
        <input
          id="passphrase"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
        {passphraseTooShort && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Minimum 8 characters.
          </p>
        )}
      </Field>

      <Field label="Confirm passphrase" htmlFor="passphrase-confirm">
        <input
          id="passphrase-confirm"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={confirmPassphrase}
          onChange={(e) => setConfirmPassphrase(e.target.value)}
        />
        {passphraseMismatch && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            Passphrases do not match.
          </p>
        )}
      </Field>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Encrypting…" : "Encrypt and save"}
      </button>
    </form>
  );
}

/* ----------------------------- Locked state ---------------------------- */

function LockedState() {
  const vault = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await vault.unlock(passphrase);
      if (!ok) {
        setError("Wrong passphrase. Try again or reset below.");
      } else {
        setPassphrase("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Banner tone="info">
        Your encrypted API key is stored in this browser. Enter your passphrase
        to unlock it for this session.
      </Banner>

      <form onSubmit={onUnlock} className="space-y-4">
        <Field label="Passphrase" htmlFor="unlock-pass">
          <input
            id="unlock-pass"
            type="password"
            autoComplete="current-password"
            autoFocus
            className={inputClass}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
        </Field>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || passphrase.length === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Unlocking…" : "Unlock"}
          </button>
          <button
            type="button"
            onClick={() => setShowReset((v) => !v)}
            className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Forgot passphrase?
          </button>
        </div>
      </form>

      {showReset && <ResetPanel onCancel={() => setShowReset(false)} />}
    </div>
  );
}

function ResetPanel({ onCancel }: { onCancel: () => void }) {
  const vault = useVault();
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      <p className="font-semibold">Reset forgotten passphrase</p>
      <p className="mt-2">
        Your passphrase is never transmitted anywhere, so we cannot recover it.
        Resetting wipes the encrypted API key from this browser. Your chat
        history is preserved. After resetting, you will paste a new API key and
        set a new passphrase.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (
              !globalThis.confirm(
                "Wipe the encrypted API key from this browser? Chat history stays.",
              )
            ) {
              return;
            }
            vault.reset();
            onCancel();
          }}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
        >
          Reset and re-onboard
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-amber-400 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Unlocked state --------------------------- */

function UnlockedState() {
  const vault = useVault();
  const [provider, setProvider] = useState<LlmProviderId>(vault.provider);
  const [model, setModel] = useState(
    vault.model || DEFAULT_MODEL_BY_PROVIDER[vault.provider],
  );
  const [saved, setSaved] = useState(false);

  const nonSecretDirty = useMemo(
    () =>
      provider !== vault.provider ||
      (model.trim() || DEFAULT_MODEL_BY_PROVIDER[provider]) !==
        (vault.model || DEFAULT_MODEL_BY_PROVIDER[vault.provider]),
    [provider, model, vault.provider, vault.model],
  );

  function saveNonSecret() {
    vault.updateNonSecret({ provider, model: model.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      <Banner tone="success">
        Vault unlocked. Your API key is decrypted in memory for this browser
        tab. Use <em>Lock</em> any time to clear it from memory.
      </Banner>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Provider & model
        </h2>
        <ProviderAndModelFields
          provider={provider}
          model={model}
          onProviderChange={(p) => {
            setProvider(p);
            if (!model || model === DEFAULT_MODEL_BY_PROVIDER[provider]) {
              setModel(DEFAULT_MODEL_BY_PROVIDER[p]);
            }
          }}
          onModelChange={setModel}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveNonSecret}
            disabled={!nonSecretDirty}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Save
          </button>
          {saved && (
            <span className="self-center text-xs text-emerald-700 dark:text-emerald-400">
              Saved.
            </span>
          )}
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <ChangePassphrasePanel />

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Danger zone
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (
                !globalThis.confirm(
                  "Lock the vault? The API key will be removed from memory; you will need your passphrase to unlock again.",
                )
              ) {
                return;
              }
              vault.lock();
            }}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Lock vault
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !globalThis.confirm(
                  "Remove the encrypted API key from this browser? Chat history stays. You will need to paste a new key afterwards.",
                )
              ) {
                return;
              }
              vault.reset();
            }}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Remove API key
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !globalThis.confirm(
                  "Delete ALL chat sessions from this browser? This cannot be undone.",
                )
              ) {
                return;
              }
              clearSessions();
            }}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Delete all sessions
          </button>
        </div>
      </section>
    </div>
  );
}

function ChangePassphrasePanel() {
  const vault = useVault();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (next.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passphrases do not match.");
      return;
    }
    setLoading(true);
    try {
      const ok = await vault.changePassphrase(next);
      if (!ok) {
        setError("Could not change passphrase. Please try again.");
      } else {
        setNext("");
        setConfirm("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Change passphrase
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="New passphrase" htmlFor="new-passphrase">
          <input
            id="new-passphrase"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="Confirm new passphrase" htmlFor="new-passphrase-confirm">
          <input
            id="new-passphrase-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || next.length === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Re-encrypting…" : "Update passphrase"}
          </button>
          {saved && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              Updated.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

/* ---------------------------- Shared pieces ---------------------------- */

const inputClass =
  "mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function ProviderAndModelFields({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: {
  provider: LlmProviderId;
  model: string;
  onProviderChange: (p: LlmProviderId) => void;
  onModelChange: (m: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Provider" htmlFor="provider-select">
        <select
          id="provider-select"
          className={inputClass}
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as LlmProviderId)}
        >
          {PROVIDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Model id"
        htmlFor="model-input"
        hint={`Leave blank to use ${DEFAULT_MODEL_BY_PROVIDER[provider]}`}
      >
        <input
          id="model-input"
          type="text"
          autoComplete="off"
          className={`${inputClass} font-mono`}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder={DEFAULT_MODEL_BY_PROVIDER[provider]}
        />
      </Field>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "info" | "success";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
      : "border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${toneClass}`}>
      {children}
    </div>
  );
}
