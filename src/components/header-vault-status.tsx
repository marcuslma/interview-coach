"use client";

import { Lock, LockOpen } from "lucide-react";
import { useVault } from "@/lib/settings/vault-context";

export function HeaderVaultStatus() {
  const vault = useVault();

  if (vault.status === "unlocked") {
    return (
      <button
        type="button"
        onClick={vault.lock}
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 px-2 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
        title="Lock the vault — clears the API key from memory"
      >
        <LockOpen className="h-3 w-3" aria-hidden />
        Lock
      </button>
    );
  }

  const label = vault.status === "empty" ? "API key not set" : "Locked";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      <Lock className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
