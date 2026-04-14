"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  role: "user" | "assistant";
  children: string;
};

export function ChatMessage({ role, children }: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`max-w-[min(100%,52rem)] rounded-lg px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "ml-auto bg-emerald-600 text-white"
          : "mr-auto border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100"
      }`}
    >
      {isUser ? (
        <p className="whitespace-pre-wrap">{children}</p>
      ) : (
        <div className="space-y-2 [&_code]:rounded [&_code]:bg-zinc-800/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] dark:[&_code]:bg-white/10 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
