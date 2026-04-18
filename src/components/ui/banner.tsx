import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, string> = {
  info: "border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  error:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
};

export function Banner({
  tone = "info",
  children,
  role,
}: {
  tone?: Tone;
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
