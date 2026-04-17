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

/** Default model for each provider, exposed so clients can pre-fill the UI. */
export const DEFAULT_MODEL_BY_PROVIDER: Record<LlmProviderId, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  google: "gemini-2.0-flash",
};

export function getLlmProviderById(id: LlmProviderId): InterviewLlmProvider {
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
