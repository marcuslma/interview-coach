/**
 * Deletes all rows from sessions and messages (keeps schema).
 * Usage: node scripts/clear-db.mjs
 */
import Database from "better-sqlite3";
import { resolveDbPath } from "./resolve-db-path.mjs";

const abs = resolveDbPath();
const sqlite = new Database(abs);

sqlite.pragma("foreign_keys = ON");
sqlite.exec("DELETE FROM messages;");
sqlite.exec("DELETE FROM sessions;");
sqlite.close();

console.log(`Cleared all rows in ${abs}`);
