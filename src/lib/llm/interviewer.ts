import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  CATEGORY_LABEL,
  type PracticeCategory,
  type PracticePrompt,
} from "@/lib/prompts/types";
import { type InterviewTurn, interviewTurnSchema } from "./schema";

const SYSTEM_PROMPT_DESIGN = `You are a senior staff engineer conducting a **system design interview**.
Your job is to simulate a realistic interview loop: ask clarifying questions, probe trade-offs, and occasionally challenge assumptions—without lecturing like a textbook.

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
- Rubric dimensions should cover: requirements & scope, capacity & estimation, data model & storage, reliability & ops, trade-offs & consistency (merge/split as needed).
- If uncertain about facts, state assumptions explicitly in message_markdown (do not invent product details not implied by the prompt).
- Keep tone professional, direct, and interview-realistic.`;

const CODE_PEDAGOGY = `**Pedagogy first:** Do not rush new exercises. After each answer: briefly explain **why** (define terms when needed), ask the candidate to justify **why** before a harder question or new snippet—unless they already explained the mechanism fully. Wrong answers: correct the mental model, then follow up.`;

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
    default: {
      const _x: never = category;
      return _x;
    }
  }
}

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

export function getInterviewModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
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
  options?: { bootstrap?: boolean },
): Promise<InterviewTurn> {
  const openai = getOpenAI();
  const model = getInterviewModel();

  const isDesign = prompt.category === "system_design";
  const systemPrompt = systemPromptForCategory(prompt.category);
  const contextBlock = isDesign
    ? buildDesignContext(prompt)
    : buildCodeContext(prompt);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Context for this session:\n${contextBlock}`,
    },
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

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty completion from model");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model returned non-JSON output");
  }

  const result = interviewTurnSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Invalid interview turn JSON: ${result.error.message}\nRaw: ${raw.slice(0, 2000)}`,
    );
  }

  return result.data;
}
