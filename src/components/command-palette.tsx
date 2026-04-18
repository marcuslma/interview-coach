"use client";

import { Command } from "cmdk";
import {
  BookOpen,
  Home,
  Lock,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/settings/vault-context";
import { CATEGORY_LABEL, TRACK_SLUGS } from "@/lib/prompts/types";

export function CommandPalette() {
  const router = useRouter();
  const vault = useVault();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "k" && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (ev.key === "Escape" && open) {
        ev.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  function go(path: string) {
    router.push(path);
    close();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command menu" className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
            <Search
              className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
              aria-hidden
            />
            <Command.Input
              autoFocus
              placeholder="Type a command or search tracks…"
              className="w-full bg-transparent py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No results.
            </Command.Empty>
            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400"
            >
              <PaletteItem
                icon={<Home className="h-4 w-4" aria-hidden />}
                onSelect={() => go("/")}
              >
                Go to home
              </PaletteItem>
              <PaletteItem
                icon={<SettingsIcon className="h-4 w-4" aria-hidden />}
                onSelect={() => go("/settings")}
              >
                Open settings
              </PaletteItem>
            </Command.Group>

            <Command.Group
              heading="Practice tracks"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400"
            >
              {TRACK_SLUGS.map((t) => (
                <PaletteItem
                  key={t.slug}
                  icon={<BookOpen className="h-4 w-4" aria-hidden />}
                  onSelect={() => go(`/?track=${t.slug}`)}
                >
                  {CATEGORY_LABEL[t.category]}
                </PaletteItem>
              ))}
            </Command.Group>

            {vault.status === "unlocked" && (
              <Command.Group
                heading="Vault"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400"
              >
                <PaletteItem
                  icon={<Lock className="h-4 w-4" aria-hidden />}
                  onSelect={() => {
                    vault.lock();
                    close();
                  }}
                >
                  Lock vault
                </PaletteItem>
              </Command.Group>
            )}
          </Command.List>
          <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>
              <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-900">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-900">
                Enter
              </kbd>{" "}
              select
            </span>
            <span>
              <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-900">
                Esc
              </kbd>{" "}
              close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function PaletteItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-700 aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:text-zinc-300 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
