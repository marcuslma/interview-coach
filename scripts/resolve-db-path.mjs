import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function resolveDbPath() {
  const raw = process.env.DATABASE_PATH ?? "./data/interview-coach.db";
  const abs = path.isAbsolute(raw)
    ? raw
    : path.join(root, raw.replace(/^\.\//, ""));
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return abs;
}
