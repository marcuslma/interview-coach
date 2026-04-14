import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function createSessionRecord(input: {
  id: string;
  promptId: string;
  title: string;
}) {
  const now = new Date();
  await db.insert(schema.sessions).values({
    id: input.id,
    promptId: input.promptId,
    title: input.title,
    createdAt: now,
    updatedAt: now,
  });
}

export async function appendMessage(input: {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  metadataJson?: string | null;
}) {
  await db.insert(schema.messages).values({
    id: input.id,
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
    metadataJson: input.metadataJson ?? null,
    createdAt: new Date(),
  });
  await db
    .update(schema.sessions)
    .set({ updatedAt: new Date() })
    .where(eq(schema.sessions.id, input.sessionId));
}

export async function deleteSession(sessionId: string) {
  await db
    .delete(schema.messages)
    .where(eq(schema.messages.sessionId, sessionId));
  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}

export async function listSessions() {
  return db
    .select()
    .from(schema.sessions)
    .orderBy(desc(schema.sessions.updatedAt));
}

export async function getSessionWithMessages(sessionId: string) {
  const session = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, sessionId))
    .limit(1);
  if (session.length === 0) {
    return null;
  }
  const msgs = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.sessionId, sessionId))
    .orderBy(schema.messages.createdAt);
  return { session: session[0], messages: msgs };
}
