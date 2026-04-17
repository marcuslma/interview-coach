"use client";

import { useVault } from "@/lib/settings/vault-context";

export function HeaderVaultStatus() {
  const vault = useVault();

  if (vault.status === "unlocked") {
    return (
      <button
        type="button"
        onClick={vault.lock}
        className="rounded-md border border-emerald-300 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
        title="Lock the vault — clears the API key from memory"
      >
        Lock
      </button>
    );
  }

  const label = vault.status === "empty" ? "API key not set" : "Locked";
  return (
    <span className="rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      {label}
    </span>
  );
}
