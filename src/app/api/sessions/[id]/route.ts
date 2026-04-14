import { NextResponse } from "next/server";
import { getSessionWithMessages, deleteSession } from "@/lib/sessions/service";
import { getPromptById } from "@/lib/prompts";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await getSessionWithMessages(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const prompt = getPromptById(data.session.promptId);
  return NextResponse.json({
    session: {
      id: data.session.id,
      promptId: data.session.promptId,
      title: data.session.title,
      createdAt: data.session.createdAt.toISOString(),
      updatedAt: data.session.updatedAt.toISOString(),
    },
    prompt: prompt
      ? {
          id: prompt.id,
          category: prompt.category,
          title: prompt.title,
          summary: prompt.summary,
          candidateBrief: prompt.candidateBrief,
          tags: prompt.tags,
          primaryLanguage: prompt.primaryLanguage ?? null,
        }
      : null,
    messages: data.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      metadataJson: m.metadataJson,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const existing = await getSessionWithMessages(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteSession(id);
  return NextResponse.json({ ok: true });
}
