import { NextResponse } from "next/server";
import { z } from "zod";
import { type HistoryMsg, runInterviewTurn } from "@/lib/llm/interviewer";
import { getPromptById } from "@/lib/prompts";
import {
  appendMessage,
  getSessionWithMessages,
} from "@/lib/sessions/service";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1).max(32000),
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionId, userMessage } = parsed.data;

  const data = await getSessionWithMessages(sessionId);
  if (!data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const practice = getPromptById(data.session.promptId);
  if (!practice) {
    return NextResponse.json({ error: "Prompt missing" }, { status: 500 });
  }

  const lastAssistant = [...data.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (lastAssistant) {
    try {
      const meta = lastAssistant.metadataJson
        ? JSON.parse(lastAssistant.metadataJson)
        : null;
      if (meta?.session_complete) {
        return NextResponse.json(
          { error: "Session already completed" },
          { status: 409 },
        );
      }
    } catch {
      /* ignore */
    }
  }

  await appendMessage({
    id: crypto.randomUUID(),
    sessionId,
    role: "user",
    content: userMessage,
  });

  const history: HistoryMsg[] = [];
  for (const m of data.messages) {
    if (m.role === "user" || m.role === "assistant") {
      history.push({ role: m.role, content: m.content });
    }
  }
  history.push({ role: "user", content: userMessage });

  try {
    const turn = await runInterviewTurn(practice, history);

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
      message: turn.message_markdown,
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
