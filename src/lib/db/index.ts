import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function resolveDbPath(): string {
  const raw = process.env.DATABASE_PATH ?? "./data/interview-coach.db";
  const abs = path.isAbsolute(raw)
    ? raw
    : path.join(process.cwd(), raw.replace(/^\.\//, ""));

  const dir = path.dirname(abs);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return abs;
}

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle>;
};

/** Create tables if missing (e.g. fresh clone without `npm run db:push`). */
function ensureSqliteTables(sqlite: Database.Database) {
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id text PRIMARY KEY NOT NULL,
      prompt_id text NOT NULL,
      title text NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id text PRIMARY KEY NOT NULL,
      session_id text NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role text NOT NULL,
      content text NOT NULL,
      metadata_json text,
      created_at integer NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id text PRIMARY KEY NOT NULL,
      llm_provider text NOT NULL,
      model text NOT NULL,
      api_key_encrypted text,
      updated_at integer NOT NULL
    );
  `);
}

function getDb() {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const sqlite = new Database(resolveDbPath(), {
    timeout: 8000,
  });

  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 8000");
  ensureSqliteTables(sqlite);
  const db = drizzle(sqlite, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.sqlite = sqlite;
    globalForDb.db = db;
  }

  return db;
}

export const db = getDb();
export { schema };
