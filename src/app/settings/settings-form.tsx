"use client";

import { useMemo, useState, type FormEvent } from "react";
import { KeyRound, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Banner,
  Button,
  Field,
  FieldError,
  FieldWarning,
  inputClass,
} from "@/components/ui";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  type LlmProviderId,
} from "@/lib/llm/providers";
import { clearSessions } from "@/lib/storage/client-store";
import { useVault } from "@/lib/settings/vault-context";

const PROVIDER_OPTIONS: { value: LlmProviderId; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Claude (Anthropic)" },
  { value: "google", label: "Google Gemini" },
];

const MODEL_OPTIONS_BY_PROVIDER: Record<
  LlmProviderId,
  { value: string; label: string }[]
> = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o mini" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  google: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
};

function getDefaultModelForProvider(provider: LlmProviderId): string {
  return MODEL_OPTIONS_BY_PROVIDER[provider][0]?.value;
}

function getValidModelForProvider(provider: LlmProviderId, model: string): string {
  const hasModel = MODEL_OPTIONS_BY_PROVIDER[provider].some(
    (option) => option.value === model,
  );
  return hasModel ? model : getDefaultModelForProvider(provider);
}

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
  const [model, setModel] = useState(() =>
    getValidModelForProvider(vault.provider, vault.model),
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
        model,
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
          setModel(getDefaultModelForProvider(p));
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
          <FieldWarning>Minimum 8 characters.</FieldWarning>
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
          <FieldError>Passphrases do not match.</FieldError>
        )}
      </Field>

      {error && <FieldError>{error}</FieldError>}

      <Button type="submit" loading={loading} disabled={loading}>
        {loading ? "Encrypting…" : "Encrypt and save"}
      </Button>
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
        {error && <FieldError>{error}</FieldError>}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || passphrase.length === 0}
          >
            {loading ? "Unlocking…" : "Unlock"}
          </Button>
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
  const [confirmation, setConfirmation] = useState("");
  const canReset = confirmation.trim() === "DELETE";
  return (
    <Banner tone="warning">
      <p className="font-semibold">Reset forgotten passphrase</p>
      <p className="mt-2">
        Your passphrase is never transmitted anywhere, so we cannot recover it.
        Resetting wipes the encrypted API key from this browser. Your chat
        history is preserved. After resetting, you will paste a new API key and
        set a new passphrase.
      </p>
      <div className="mt-3">
        <Field
          label={
            <>
              Type <code className="rounded bg-amber-100 px-1 font-mono text-[12px] dark:bg-amber-900/50">DELETE</code> to confirm
            </>
          }
          htmlFor="reset-confirmation"
        >
          <input
            id="reset-confirmation"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="dangerSolid"
          size="sm"
          disabled={!canReset}
          onClick={() => {
            vault.reset();
            setConfirmation("");
            onCancel();
          }}
        >
          Reset and re-onboard
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Banner>
  );
}

/* ---------------------------- Unlocked state --------------------------- */

function UnlockedState() {
  const vault = useVault();
  const [provider, setProvider] = useState<LlmProviderId>(vault.provider);
  const [model, setModel] = useState(() =>
    getValidModelForProvider(vault.provider, vault.model),
  );

  const nonSecretDirty = useMemo(
    () =>
      provider !== vault.provider ||
      model !== getValidModelForProvider(vault.provider, vault.model),
    [provider, model, vault.provider, vault.model],
  );

  function saveNonSecret() {
    vault.updateNonSecret({ provider, model });
    toast.success("Settings saved");
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
            setModel(getDefaultModelForProvider(p));
          }}
          onModelChange={setModel}
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={saveNonSecret} disabled={!nonSecretDirty}>
            Save
          </Button>
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
          <Button
            variant="secondary"
            iconLeft={<Lock className="h-4 w-4" aria-hidden />}
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
          >
            Lock vault
          </Button>
          <Button
            variant="danger"
            iconLeft={<KeyRound className="h-4 w-4" aria-hidden />}
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
          >
            Remove API key
          </Button>
          <Button
            variant="danger"
            iconLeft={<Trash2 className="h-4 w-4" aria-hidden />}
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
          >
            Delete all sessions
          </Button>
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
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
        toast.success("Passphrase updated");
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
        {error && <FieldError>{error}</FieldError>}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || next.length === 0}
          >
            {loading ? "Re-encrypting…" : "Update passphrase"}
          </Button>
        </div>
      </form>
    </section>
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
        label="Model"
        htmlFor="model-select"
        hint={`Default suggested: ${DEFAULT_MODEL_BY_PROVIDER[provider]}`}
      >
        <select
          id="model-select"
          className={inputClass}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {MODEL_OPTIONS_BY_PROVIDER[provider].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
