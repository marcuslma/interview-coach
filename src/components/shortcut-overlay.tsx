"use client";

import { useEffect, useState } from "react";

type Shortcut = {
  keys: string[];
  description: string;
};

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "Global",
    items: [
      { keys: ["⌘", "+", "K"], description: "Open command palette" },
      { keys: ["Ctrl", "+", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show or hide this help" },
      { keys: ["Esc"], description: "Close dialogs and overlays" },
    ],
  },
  {
    group: "Prompt library",
    items: [
      { keys: ["←", "→"], description: "Navigate tracks" },
      { keys: ["↑", "↓"], description: "Navigate tracks" },
      { keys: ["1", "–", "9"], description: "Jump to track 1–9" },
      { keys: ["0"], description: "Jump to 10th track" },
    ],
  },
  {
    group: "Chat composer",
    items: [
      { keys: ["Enter"], description: "Send message" },
      { keys: ["Shift", "+", "Enter"], description: "New line" },
      { keys: ["⌘", "+", "Enter"], description: "Send message" },
      { keys: ["Ctrl", "+", "Enter"], description: "Send message" },
    ],
  },
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el.isContentEditable
  );
}

export function ShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape" && open) {
        ev.preventDefault();
        setOpen(false);
        return;
      }
      if (ev.key === "?" && !isTypingTarget(ev.target)) {
        ev.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-overlay-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="shortcut-overlay-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Close shortcuts"
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {SHORTCUTS.map((group) => (
            <section key={group.group}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {group.group}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {group.items.map((item, i) => (
                  <li
                    key={`${group.group}-${i}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.description}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-5 text-[11px] text-zinc-500 dark:text-zinc-400">
          Press{" "}
          <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 py-0.5 font-mono text-[10px] dark:border-zinc-700 dark:bg-zinc-900">
            ?
          </kbd>{" "}
          anywhere to toggle.
        </p>
      </div>
    </div>
  );
}
