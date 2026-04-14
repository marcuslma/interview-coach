import { NextResponse } from "next/server";
import { z } from "zod";
import { runInterviewTurn } from "@/lib/llm/interviewer";
import { resolveLocaleHint } from "@/lib/locale";
import { getPromptById } from "@/lib/prompts";
import {
  appendMessage,
  createSessionRecord,
  listSessions,
} from "@/lib/sessions/service";

const bodySchema = z.object({
  promptId: z.string().min(1),
  preferredLanguage: z.string().max(48).optional(),
});

export async function POST(req: Request) {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const practice = getPromptById(parsed.data.promptId);

  if (!practice) {
    return NextResponse.json({ error: "Unknown promptId" }, { status: 404 });
  }

  const localeHint = resolveLocaleHint(
    parsed.data.preferredLanguage,
    req.headers.get("accept-language"),
  );

  const sessionId = crypto.randomUUID();

  try {
    await createSessionRecord({
      id: sessionId,
      promptId: practice.id,
      title: practice.title,
    });

    const turn = await runInterviewTurn(practice, [], {
      bootstrap: true,
      localeHint,
    });

    const assistantMeta = JSON.stringify({
      phase: turn.phase,
      session_complete: turn.session_complete,
      rubric: turn.rubric,
    });

    await appendMessage({
      id: crypto.randomUUID(),
      sessionId,
      role: "assistant",
      content: turn.message_markdown,
      metadataJson: assistantMeta,
    });

    return NextResponse.json({
      sessionId,
      title: practice.title,
      promptId: practice.id,
      firstMessage: turn.message_markdown,
      phase: turn.phase,
      sessionComplete: turn.session_complete,
      rubric: turn.rubric,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    const status =
      msg.includes("OPENAI_API_KEY") || msg.includes("API key") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET() {
  const rows = await listSessions();
  return NextResponse.json({
    sessions: rows.map((s) => ({
      id: s.id,
      promptId: s.promptId,
      title: s.title,
      updatedAt: s.updatedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
