import type { Metadata } from "next";
import Link from "next/link";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings — Interview Coach",
  description:
    "Configure the LLM provider and encrypt your API key in this browser.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
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
          Pick an LLM provider and paste your own API key. The key is encrypted
          in this browser using a passphrase you choose (AES-256-GCM +
          PBKDF2-SHA256, 200k iterations). Nothing is stored on our servers; the
          passphrase never leaves this device.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
