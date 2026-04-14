import type { Metadata } from "next";
import Link from "next/link";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings — Interview Coach",
  description: "Configure LLM provider and optional encrypted API key storage.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <Link
          href="/"
          className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Back to home
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          LLM settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Override provider and model for this installation. To persist an API
          key in SQLite, set a long random{" "}
          <code className="rounded bg-zinc-200 px-1 font-mono text-xs dark:bg-zinc-800">
            SETTINGS_ENCRYPTION_KEY
          </code>{" "}
          in the server environment (used only to encrypt secrets at rest).
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
