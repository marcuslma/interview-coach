import type { PracticePrompt } from "./types";

export const TYPESCRIPT_PROMPTS: PracticePrompt[] = [
  {
    category: "typescript",
    id: "ts-narrowing-guards",
    title: "Narrowing & type guards",
    summary: "typeof, in, discriminated unions, truthy checks.",
    tags: ["types", "narrowing"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Predict types after guards, fix incorrect narrowing, explain why code does or does not compile.",
    evaluatorNotes:
      "Small snippets. Ask what type `x` is after each branch. Cover discriminated unions and exhaustiveness.",
  },
  {
    category: "typescript",
    id: "ts-generics-inference",
    title: "Generics & inference",
    summary: "Generic functions, constraints, default type params.",
    tags: ["generics", "inference"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Infer generic arguments, spot incorrect constraints, explain variance at a high level when relevant.",
    evaluatorNotes:
      "Avoid deep compiler internals. Ask to infer types or fix a generic signature.",
  },
  {
    category: "typescript",
    id: "ts-utility-mapped",
    title: "Utility & mapped types (lite)",
    summary: "Partial, Pick, Record, mapped types, keyof.",
    tags: ["utility-types", "mapped"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Read and write simple mapped types; know what built-in utilities do.",
    evaluatorNotes:
      "Ask to express a type transformation or explain what a utility does for a given shape.",
  },
  {
    category: "typescript",
    id: "ts-structural-typing",
    title: "Structural typing & compatibility",
    summary: "Excess property checks, optional props, readonly.",
    tags: ["types", "compatibility"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Explain assignability between object types and when excess property checks apply.",
    evaluatorNotes:
      "Use minimal interfaces. Ask why an assignment succeeds or fails.",
  },
  {
    category: "typescript",
    id: "ts-async-promise-types",
    title: "Promises & async in TS",
    summary: "Promise types, async return types, error typing.",
    tags: ["async", "types"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Infer return types of async functions, handle Promise unions, discuss Result-style patterns at high level.",
    evaluatorNotes:
      "Combine small async snippets with type questions—not only runtime order.",
  },
  {
    category: "typescript",
    id: "ts-satisfies-vs-const",
    title: "`satisfies` vs `as const` (modern TS)",
    summary: "Literal preservation vs assertion; when each helps.",
    tags: ["syntax", "types"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Choose between satisfies, as const, and type assertions for given goals.",
    evaluatorNotes:
      "If candidate uses older TS only, explain concepts without requiring latest version numbers.",
  },
];
