import { NextResponse } from "next/server";
import { z } from "zod";
import { type HistoryMsg, runInterviewTurn } from "@/lib/llm/interviewer";
import { resolveLocaleHint } from "@/lib/locale";
import { getPromptById } from "@/lib/prompts";

/**
 * Stateless LLM proxy — no persistence, no BYOK storage on the server.
 *
 * Request contract:
 * - Body (JSON) with promptId + conversation history + provider/model.
 * - Header `x-llm-api-key` carries the API key; NEVER logged.
 * - `Origin`/`Referer` is validated against the host to deter cross-site abuse.
 *
 * Response returns the next turn (`message_markdown`, `phase`,
 * `session_complete`, `rubric`).
 */

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(32000),
});

const bodySchema = z
  .object({
    promptId: z.string().min(1).max(128),
    history: z.array(historyMessageSchema).max(200),
    bootstrap: z.boolean().optional(),
    provider: z.enum(["openai", "anthropic", "google"]),
    model: z.string().min(1).max(128),
    preferredLanguage: z.string().max(48).optional(),
  })
  .strict();

function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin ?? referer;
  if (!source) {
    // In dev tools / curl Origin can be absent. Reject rather than allow to
    // keep the server API unusable from non-browser clients by default.
    return false;
  }
  try {
    const url = new URL(source);
    return url.host === host;
  } catch {
    return false;
  }
}

function mapErrorToHttp(message: string): number {
  const lower = message.toLowerCase();
  if (
    lower.includes("api key") ||
    lower.includes("authentication") ||
    lower.includes("permission denied") ||
    lower.includes("invalid api key")
  ) {
    return 401;
  }
  return 500;
}

function sanitizeError(message: string): string {
  if (
    message.includes("Invalid interview turn JSON") ||
    message.includes("non-JSON output")
  ) {
    return "The interviewer response could not be processed. Please try sending your message again.";
  }
  return message;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: "Forbidden: cross-site request" },
      { status: 403 },
    );
  }

  const apiKey = req.headers.get("x-llm-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing x-llm-api-key header" },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { promptId, history, bootstrap, provider, model, preferredLanguage } =
    parsed.data;

  const practice = getPromptById(promptId);
  if (!practice) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  const localeHint = resolveLocaleHint(
    preferredLanguage,
    req.headers.get("accept-language"),
  );

  const conversation: HistoryMsg[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const turn = await runInterviewTurn(practice, conversation, {
      bootstrap,
      localeHint,
      providerId: provider,
      model,
      apiKey,
    });

    return NextResponse.json({
      message: turn.message_markdown,
      phase: turn.phase,
      sessionComplete: turn.session_complete,
      rubric: turn.rubric,
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Server error";
    const safe = sanitizeError(raw);
    const status = mapErrorToHttp(safe);
    return NextResponse.json({ error: safe }, { status });
  }
}
