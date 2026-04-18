import { Settings as SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/command-palette";
import { HeaderVaultStatus } from "@/components/header-vault-status";
import { ShortcutOverlay } from "@/components/shortcut-overlay";
import { VaultProvider } from "@/lib/settings/vault-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Coach",
  description:
    "Open-source interview practice: JavaScript, system design, Node.js, TypeScript, NestJS, Next.js — chat, rubric export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-[100svh] flex-col">
        <VaultProvider>
          <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link
                href="/"
                className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Interview Coach
              </Link>
              <div className="flex items-center gap-3">
                <HeaderVaultStatus />
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  <SettingsIcon className="h-3.5 w-3.5" aria-hidden />
                  Settings
                </Link>
                <span
                  className="text-xs text-zinc-500 dark:text-zinc-400"
                  title="Runs on your device or server; open-source (OSS) code you can inspect and self-host."
                >
                  Runs locally · Open source
                </span>
              </div>
            </div>
          </header>
          {children}
          <CommandPalette />
          <ShortcutOverlay />
          <Toaster
            position="bottom-right"
            theme="system"
            closeButton
            richColors
          />
        </VaultProvider>
      </body>
    </html>
  );
}
