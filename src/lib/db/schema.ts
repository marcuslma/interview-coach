import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  /** Optional JSON: structured rubric or phase hint from assistant */
  metadataJson: text("metadata_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** Single-row LLM overrides (BYOK). API key stored encrypted when SETTINGS_ENCRYPTION_KEY is set. */
export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey(),
  llmProvider: text("llm_provider").notNull(),
  model: text("model").notNull(),
  apiKeyEncrypted: text("api_key_encrypted"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type SessionRow = typeof sessions.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type AppSettingsRow = typeof appSettings.$inferSelect;
