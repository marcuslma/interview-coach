import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import { createOpenAiProvider } from "./openai";
import type { InterviewLlmProvider, LlmProviderId } from "./types";

export type {
  CompleteJsonInterviewParams,
  InterviewChatMessage,
  InterviewLlmProvider,
  LlmProviderId,
} from "./types";

export function getLlmProviderId(): LlmProviderId {
  const raw = (process.env.LLM_PROVIDER ?? "openai").toLowerCase().trim();
  if (raw === "anthropic" || raw === "google" || raw === "openai") {
    return raw;
  }
  return "openai";
}

export function getInterviewModelForProvider(id: LlmProviderId): string {
  switch (id) {
    case "openai":
      return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    case "anthropic":
      return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
    case "google":
      return process.env.GOOGLE_MODEL ?? "gemini-2.0-flash";
    default: {
      const _x: never = id;
      return _x;
    }
  }
}

export function getLlmProvider(): InterviewLlmProvider {
  const id = getLlmProviderId();
  switch (id) {
    case "openai":
      return createOpenAiProvider();
    case "anthropic":
      return createAnthropicProvider();
    case "google":
      return createGeminiProvider();
    default: {
      const _x: never = id;
      return _x;
    }
  }
}
