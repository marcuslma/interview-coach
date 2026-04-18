"use client";

import { Check, Copy } from "lucide-react";
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

type Props = {
  role: "user" | "assistant";
  children: string;
};

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const text = preRef.current?.innerText ?? extractText(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — clipboard not available");
    }
  }

  return (
    <div className="group relative">
      <pre ref={preRef}>{children}</pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white/90 px-2 py-1 text-[11px] font-medium text-zinc-700 opacity-0 shadow-sm backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

export function ChatMessage({ role, children }: Props) {
  const isUser = role === "user";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const enter = mounted
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-2";

  return (
    <div
      className={`max-w-[min(100%,52rem)] rounded-lg px-4 py-3 text-sm leading-relaxed transition-all duration-200 ease-out ${enter} ${
        isUser
          ? "ml-auto bg-emerald-600 text-white"
          : "mr-auto border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100"
      }`}
    >
      {isUser ? (
        <p className="whitespace-pre-wrap">{children}</p>
      ) : (
        <div className="space-y-2 [&_code:not(.hljs)]:rounded [&_code:not(.hljs)]:bg-zinc-800/10 [&_code:not(.hljs)]:px-1 [&_code:not(.hljs)]:py-0.5 [&_code:not(.hljs)]:font-mono [&_code:not(.hljs)]:text-[0.85em] dark:[&_code:not(.hljs)]:bg-white/10 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:text-[0.85em] [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
            components={{
              pre: ({ children: preChildren }) => {
                const first = Children.toArray(preChildren)[0];
                if (isValidElement(first)) {
                  return <CodeBlock>{preChildren}</CodeBlock>;
                }
                return <pre>{preChildren}</pre>;
              },
            }}
          >
            {children}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
