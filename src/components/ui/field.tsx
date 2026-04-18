import type { ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

export const inputClass =
  "mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition-colors focus:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</p>
  );
}

export function FieldWarning({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
      {children}
    </p>
  );
}
