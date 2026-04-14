import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { LlmProviderId } from "@/lib/llm/providers";

export const APP_SETTINGS_ROW_ID = "default";

export async function getAppLlmSettingsRow() {
  const rows = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.id, APP_SETTINGS_ROW_ID))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertAppLlmSettings(input: {
  llmProvider: LlmProviderId;
  model: string;
  apiKeyEncrypted: string | null;
}) {
  const now = new Date();
  const existing = await getAppLlmSettingsRow();
  if (!existing) {
    await db.insert(schema.appSettings).values({
      id: APP_SETTINGS_ROW_ID,
      llmProvider: input.llmProvider,
      model: input.model,
      apiKeyEncrypted: input.apiKeyEncrypted,
      updatedAt: now,
    });
    return;
  }
  await db
    .update(schema.appSettings)
    .set({
      llmProvider: input.llmProvider,
      model: input.model,
      apiKeyEncrypted: input.apiKeyEncrypted,
      updatedAt: now,
    })
    .where(eq(schema.appSettings.id, APP_SETTINGS_ROW_ID));
}

export async function deleteAppLlmSettings() {
  await db
    .delete(schema.appSettings)
    .where(eq(schema.appSettings.id, APP_SETTINGS_ROW_ID));
}
