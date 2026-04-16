import { DESIGN_PATTERNS_PROMPTS } from "./design-patterns-seed";
import { JAVASCRIPT_PROMPTS } from "./javascript-seed";
import { MONGODB_PROMPTS } from "./mongodb-seed";
import { NESTJS_PROMPTS } from "./nestjs-seed";
import { NEXTJS_PROMPTS } from "./nextjs-seed";
import { NODEJS_PROMPTS } from "./nodejs-seed";
import { POSTGRESQL_PROMPTS } from "./postgresql-seed";
import { REACT_PROMPTS } from "./react-seed";
import { SOFTWARE_ARCHITECTURE_PROMPTS } from "./software-architecture-seed";
import { SYSTEM_DESIGN_PROMPTS } from "./system-design-seed";
import type { PracticeCategory, PracticePrompt } from "./types";
import { TYPESCRIPT_PROMPTS } from "./typescript-seed";

const ALL_PROMPTS: PracticePrompt[] = [
  ...JAVASCRIPT_PROMPTS,
  ...SYSTEM_DESIGN_PROMPTS,
  ...NODEJS_PROMPTS,
  ...TYPESCRIPT_PROMPTS,
  ...SOFTWARE_ARCHITECTURE_PROMPTS,
  ...DESIGN_PATTERNS_PROMPTS,
  ...NESTJS_PROMPTS,
  ...NEXTJS_PROMPTS,
  ...REACT_PROMPTS,
  ...MONGODB_PROMPTS,
  ...POSTGRESQL_PROMPTS,
];

const byId = new Map(ALL_PROMPTS.map((p) => [p.id, p]));

export function listPrompts(): PracticePrompt[] {
  return ALL_PROMPTS;
}

export function listPromptsByCategory(
  category: PracticeCategory,
): PracticePrompt[] {
  return ALL_PROMPTS.filter((p) => p.category === category);
}

export function getPromptById(id: string): PracticePrompt | undefined {
  return byId.get(id);
}
