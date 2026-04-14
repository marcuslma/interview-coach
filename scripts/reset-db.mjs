/**
 * Removes the SQLite database file(s) at DATABASE_PATH so the next push/dev run recreates them.
 * Usage: node scripts/reset-db.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { resolveDbPath } from "./resolve-db-path.mjs";

const abs = resolveDbPath();

for (const suffix of ["", "-wal", "-shm"]) {
  const p = abs + suffix;
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Removed ${p}`);
  }
}

const dir = path.dirname(abs);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log("Database file reset. Run `npm run db:push` to recreate the schema.");
