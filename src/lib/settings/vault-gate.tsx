"use client";

/**
 * UnlockDialog — modal asking for the passphrase to decrypt the API key.
 *
 * Renders in one of two shapes:
 * - Inline gate: when a page requires the vault unlocked to operate.
 * - Controlled dialog: shown on demand (e.g. when sending a chat message
 *   while vault.status !== "unlocked").
 */
import { Check } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Field, FieldError, inputClass } from "@/components/ui";
import { useVault } from "./vault-context";

export function UnlockDialog({
  open,
  onClose,
  onUnlocked,
}: {
  open: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
}) {
  const vault = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await vault.unlock(passphrase);
      if (!ok) {
        setError("Wrong passphrase. Try again or reset below.");
        return;
      }
      setPassphrase("");
      setSucceeded(true);
      setTimeout(() => {
        setSucceeded(false);
        onUnlocked?.();
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        {succeeded && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/90 dark:bg-zinc-950/90"
            aria-live="polite"
          >
            <span className="inline-flex h-14 w-14 animate-[pulse_0.6s_ease-out] items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Check className="h-7 w-7" aria-hidden />
            </span>
          </div>
        )}
        <h2
          id="unlock-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Unlock API key
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your passphrase to decrypt the API key stored in this browser.
          The passphrase never leaves your device.
        </p>
        <div className="mt-4">
          <Field label="Passphrase" htmlFor="unlock-dialog-passphrase">
            <input
              id="unlock-dialog-passphrase"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        {error ? (
          <div role="alert">
            <FieldError>{error}</FieldError>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href="/settings"
            className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={onClose}
          >
            Forgot passphrase?
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={loading || passphrase.length === 0}
            >
              {loading ? "Unlocking…" : "Unlock"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
