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

function getDb() {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const sqlite = new Database(resolveDbPath(), {
    timeout: 8000,
  });

  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 8000");
  const db = drizzle(sqlite, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.sqlite = sqlite;
    globalForDb.db = db;
  }

  return db;
}

export const db = getDb();
export { schema };
