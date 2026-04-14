import type { LlmProviderId } from "./types";

export function getEnvApiKeyForProvider(id: LlmProviderId): string {
  switch (id) {
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      return key;
    }
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) {
        throw new Error("ANTHROPIC_API_KEY is not set");
      }
      return key;
    }
    case "google": {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) {
        throw new Error("GOOGLE_API_KEY is not set");
      }
      return key;
    }
    default: {
      const _x: never = id;
      return _x;
    }
  }
}
