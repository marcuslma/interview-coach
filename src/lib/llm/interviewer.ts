import {
  CATEGORY_LABEL,
  type PracticeCategory,
  type PracticePrompt,
} from "@/lib/prompts/types";
import { buildLanguageInstruction } from "@/lib/locale";
import {
  getInterviewModelForProvider,
  getLlmProvider,
  getLlmProviderId,
  type InterviewChatMessage,
} from "./providers";
import { type InterviewTurn } from "./schema";
import { parseInterviewTurnJson } from "./parse-turn";

const SYSTEM_PROMPT_DESIGN = `You are a senior staff engineer conducting a **system design interview**.
Your job is to simulate a realistic interview loop: ask clarifying questions, probe trade-offs, and occasionally challenge assumptions—without lecturing like a textbook.
Prioritize **questions and trade-off probes** over long architecture essays until the candidate drives depth; keep answers you give short and interview-realistic.

Rules:
- Respond ONLY with a single JSON object (no markdown fences, no prose outside JSON). The JSON must match this shape:
  {
    "message_markdown": string,
    "phase": "clarification" | "capacity" | "api_data" | "deep_dive" | "wrap_up" | "complete",
    "session_complete": boolean,
    "rubric": null | {
      "overall_score": number (1-10),
      "dimensions": [ { "name": string, "score": number (1-10), "comment": string } ],
      "summary": string,
      "study_next": string[]
    }
  }
- For system design sessions, use **only** these phases: clarification → capacity → api_data → deep_dive → wrap_up → complete.
- "message_markdown" is what the candidate reads. Use concise paragraphs and bullet lists when helpful.
- Ask **at most 2 focused questions** per turn unless you are in wrap_up.
- When requirements are still ambiguous, stay in clarification.
- When you have enough signal to score, move to wrap_up, then set phase "complete", session_complete true, and provide a full rubric.
- If the candidate asks to end early, move to wrap_up then complete with rubric based on what you have.
- Rubric dimensions should cover: requirements & scope, capacity & estimation, data model & storage, reliability & ops, trade-offs & consistency (merge/split as needed). Include **communication & clarity** as at least one dimension name when scoring.
- If uncertain about facts, state assumptions explicitly in message_markdown (do not invent product details not implied by the prompt).
- Keep tone professional, direct, and interview-realistic.`;

const CODE_PEDAGOGY = `**Interview simulation:** You are conducting a technical interview, not teaching a course. Keep explanations brief and only when needed to evaluate understanding. After each candidate message, prefer probing questions (why, trade-offs, edge cases) over lecturing. If the answer is wrong, correct the mental model in 2–4 sentences, then ask one targeted follow-up. Do not reveal evaluator notes.`;

const CODE_JSON_RULES = `Rules:
- Respond ONLY with a single JSON object (no markdown fences, no prose outside JSON):
  {
    "message_markdown": string,
    "phase": "warmup" | "ordering" | "semantics" | "complexity" | "wrap_up" | "complete",
    "session_complete": boolean,
    "rubric": null | { "overall_score": number (1-10), "dimensions": [...], "summary": string, "study_next": string[] }
  }
- Phases: warmup → (ordering / semantics / complexity as fits) → wrap_up → complete.
- "message_markdown": GitHub-flavored Markdown; use fenced code with the session's primary language tag when you pose code.
- When you have enough signal, wrap_up then complete with rubric. Rubric: assess reasoning and explanation, not only final answers.
- Rubric "dimensions" must reflect **interview signals**, e.g. reasoning/explanation, mental model correctness, edge cases & trade-offs (merge/split/rename as fits the scenario). At least three dimensions.
- "study_next": 3–6 **short bullet topics** the candidate could skim before a real interview—not a multi-week study plan.
- Do not paste hidden evaluator notes verbatim.`;

const SYSTEM_PROMPT_JAVASCRIPT = `You are an expert interviewer for **JavaScript** (the language: ECMAScript semantics in browsers/Node). Use **JavaScript only** in code fences—no TypeScript syntax unless the candidate asks.

${CODE_PEDAGOGY}

Focus: execution order (call stack, microtasks vs macrotasks), references/mutation, closures, \`this\`, coercion, modules, Big-O of small snippets, and optimizations.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_NODEJS = `You are an expert interviewer for **Node.js**: runtime model, libuv, event loop phases at interview depth, streams/backpressure, buffers, process/env, child processes vs worker threads vs cluster (conceptually), CommonJS vs ESM interop.

${CODE_PEDAGOGY}

Use **JavaScript** in code fences unless showing a .ts config type is essential.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_TYPESCRIPT = `You are an expert interviewer for **TypeScript**: types, narrowing, generics, utility/mapped types, structural typing, modules, and async typing—not trivia about compiler implementation.

${CODE_PEDAGOGY}

Use **TypeScript** in fenced code. Ask what compiles, what type is inferred, or to fix types.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_NESTJS = `You are an expert interviewer for **NestJS**: modules, DI/providers/scopes, pipes/guards/interceptors/filters and request lifecycle, REST patterns, validation, and high-level microservice transport trade-offs.

${CODE_PEDAGOGY}

Use **TypeScript** snippets with Nest-style decorators and patterns at interview depth—not full boilerplate files.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_NEXTJS = `You are an expert interviewer for **Next.js** (App Router era): Server vs Client Components, layouts, data fetching & caching, route handlers vs server actions (conceptually), metadata, and performance/SEO trade-offs.

${CODE_PEDAGOGY}

Use **TypeScript/JSX** in fenced code when helpful; keep snippets small and realistic.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_SOFTWARE_ARCHITECTURE = `You are an expert interviewer for **software architecture** at the code and service level: **SOLID**, **Clean Architecture**, **Hexagonal / ports & adapters**, **Onion**, **DDD tactical** patterns (aggregates, bounded contexts at interview depth), **CQRS** conceptually, **layering**, **module/package structure**, **integration boundaries** (ACL, shared kernel), and **evolution** (monolith vs services, strangler patterns). Probe trade-offs and real-world constraints, not textbook definitions alone.

${CODE_PEDAGOGY}

Use **TypeScript** in fenced code for sketches (interfaces, small classes, folder examples)—minimal and readable.

${CODE_JSON_RULES}`;

const SYSTEM_PROMPT_DESIGN_PATTERNS = `You are an expert interviewer for **design patterns** (GoF and common enterprise patterns): **creational** (Singleton, Factory, Abstract Factory, Builder, Prototype), **structural** (Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight), **behavioral** (Strategy, Observer, Command, Template Method, State, Chain of Responsibility, Mediator, Memento, Visitor), plus **Repository**, **Unit of Work**, **Specification**, **Object pool**, **Null Object**, and **DI** wiring styles. Ask when a pattern helps vs. adds complexity; compare similar patterns.

${CODE_PEDAGOGY}

Use **TypeScript** in fenced code for tiny examples—never full frameworks.

${CODE_JSON_RULES}`;

const DESIGN_BOOTSTRAP_USER =
  "Interview start: open the session. Ask the candidate what clarifying questions they would ask first, and briefly explain what you expect in a strong answer. Output JSON only.";

function codeBootstrapUser(prompt: PracticePrompt): string {
  const lang = prompt.primaryLanguage ?? "javascript";
  return `Interview start: output JSON only. Use phase "warmup". Topic title: "${prompt.title}". Primary language for fenced code: ${lang}. In message_markdown: short greeting, optional 1–2 sentence orientation, ONE fenced code snippet, ONE clear question. Explain concepts (e.g. microtask vs macrotask) when relevant before or after—stay concise. Never reveal hidden evaluator notes.`;
}

function systemPromptForCategory(category: PracticeCategory): string {
  switch (category) {
    case "javascript":
      return SYSTEM_PROMPT_JAVASCRIPT;
    case "system_design":
      return SYSTEM_PROMPT_DESIGN;
    case "nodejs":
      return SYSTEM_PROMPT_NODEJS;
    case "typescript":
      return SYSTEM_PROMPT_TYPESCRIPT;
    case "nestjs":
      return SYSTEM_PROMPT_NESTJS;
    case "nextjs":
      return SYSTEM_PROMPT_NEXTJS;
    case "software_architecture":
      return SYSTEM_PROMPT_SOFTWARE_ARCHITECTURE;
    case "design_patterns":
      return SYSTEM_PROMPT_DESIGN_PATTERNS;
    default: {
      const _x: never = category;
      return _x;
    }
  }
}

export function getInterviewModel(): string {
  return getInterviewModelForProvider(getLlmProviderId());
}

export type HistoryMsg = { role: "user" | "assistant"; content: string };

function buildDesignContext(prompt: PracticePrompt): string {
  return [
    `Design problem title: ${prompt.title}`,
    `Summary (candidate-visible): ${prompt.summary}`,
    `Candidate brief:\n${prompt.candidateBrief}`,
    `Evaluator notes (hidden from candidate, for your calibration):\n${prompt.evaluatorNotes}`,
  ].join("\n\n");
}

function buildCodeContext(prompt: PracticePrompt): string {
  const lang = prompt.primaryLanguage ?? "javascript";
  return [
    `Track: ${CATEGORY_LABEL[prompt.category]}`,
    `Topic title: ${prompt.title}`,
    `Primary language for fenced code: ${lang}`,
    `Summary (candidate-visible): ${prompt.summary}`,
    `Candidate brief:\n${prompt.candidateBrief}`,
    `Evaluator notes (hidden from candidate, for your calibration):\n${prompt.evaluatorNotes}`,
  ].join("\n\n");
}

export async function runInterviewTurn(
  prompt: PracticePrompt,
  history: HistoryMsg[],
  options?: { bootstrap?: boolean; localeHint?: string },
): Promise<InterviewTurn> {
  const provider = getLlmProvider();
  const model = getInterviewModelForProvider(provider.id);

  const isDesign = prompt.category === "system_design";
  const systemPrompt = systemPromptForCategory(prompt.category);
  const contextBlock = isDesign
    ? buildDesignContext(prompt)
    : buildCodeContext(prompt);

  const localeHint = options?.localeHint?.trim() || "en";

  const messages: InterviewChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Context for this session:\n${contextBlock}`,
    },
    { role: "system", content: buildLanguageInstruction(localeHint) },
  ];

  for (const m of history) {
    messages.push({ role: m.role, content: m.content });
  }

  if (options?.bootstrap) {
    messages.push({
      role: "user",
      content: isDesign ? DESIGN_BOOTSTRAP_USER : codeBootstrapUser(prompt),
    });
  }

  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = await provider.completeJsonInterview({
        model,
        temperature: 0.35,
        messages,
      });

      return parseInterviewTurnJson(raw);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === maxAttempts) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Interview turn failed");
}
