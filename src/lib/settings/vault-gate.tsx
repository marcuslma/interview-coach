"use client";

/**
 * UnlockDialog — modal asking for the passphrase to decrypt the API key.
 *
 * Renders in one of two shapes:
 * - Inline gate: when a page requires the vault unlocked to operate.
 * - Controlled dialog: shown on demand (e.g. when sending a chat message
 *   while vault.status !== "unlocked").
 */
import Link from "next/link";
import { useState, type FormEvent } from "react";
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
      onUnlocked?.();
      onClose();
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
        className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-xl"
      >
        <h2 id="unlock-title" className="text-lg font-semibold">
          Unlock API key
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Enter your passphrase to decrypt the API key stored in this browser.
          The passphrase never leaves your device.
        </p>
        <label className="mt-4 block text-sm">
          <span className="text-neutral-300">Passphrase</span>
          <input
            type="password"
            autoFocus
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        {error ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href="/settings"
            className="text-xs text-neutral-400 underline hover:text-neutral-200"
            onClick={onClose}
          >
            Forgot passphrase?
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || passphrase.length === 0}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Unlocking…" : "Unlock"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
