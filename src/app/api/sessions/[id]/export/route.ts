import { NextResponse } from "next/server";
import { getSessionWithMessages } from "@/lib/sessions/service";
import { getPromptById } from "@/lib/prompts";
import { buildSessionMarkdown } from "@/lib/export/markdown";
import type { Rubric } from "@/lib/llm/schema";

type RouteContext = { params: Promise<{ id: string }> };

function safeParseRubric(json: string | null): Rubric | null {
  if (!json) {
    return null;
  }
  try {
    const o = JSON.parse(json) as { rubric?: Rubric; session_complete?: boolean };
    if (o.session_complete && o.rubric) {
      return o.rubric;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await getSessionWithMessages(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prompt = getPromptById(data.session.promptId);
  const transcript = data.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  let rubric: Rubric | null = null;
  for (let i = data.messages.length - 1; i >= 0; i--) {
    const m = data.messages[i];
    if (m.role === "assistant" && m.metadataJson) {
      rubric = safeParseRubric(m.metadataJson);
      if (rubric) {
        break;
      }
    }
  }

  const md = buildSessionMarkdown({
    title: data.session.title,
    promptSummary: prompt?.summary ?? "",
    createdAt: data.session.updatedAt,
    transcript,
    rubric,
  });

  const filename = `session-${id.slice(0, 8)}.md`;

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
