import {
  getEnvApiKeyForProvider,
  getInterviewModelForProvider,
  getLlmProviderId,
  type LlmProviderId,
} from "@/lib/llm/providers";
import {
  decryptSecret,
  getSettingsEncryptionKey,
} from "@/lib/settings/crypto";
import { getAppLlmSettingsRow } from "@/lib/settings/llm-store";

export function parseStoredLlmProvider(raw: string): LlmProviderId {
  const v = raw.toLowerCase().trim();
  if (v === "openai" || v === "anthropic" || v === "google") {
    return v;
  }
  return getLlmProviderId();
}

export type ResolvedInterviewLlmConfig = {
  providerId: LlmProviderId;
  model: string;
  apiKey: string;
};

export async function resolveInterviewLlmConfig(): Promise<ResolvedInterviewLlmConfig> {
  const row = await getAppLlmSettingsRow();
  if (!row) {
    const providerId = getLlmProviderId();
    return {
      providerId,
      model: getInterviewModelForProvider(providerId),
      apiKey: getEnvApiKeyForProvider(providerId),
    };
  }

  const providerId = parseStoredLlmProvider(row.llmProvider);
  const model =
    row.model.trim() || getInterviewModelForProvider(providerId);

  if (row.apiKeyEncrypted?.trim()) {
    const key = getSettingsEncryptionKey();
    if (!key) {
      throw new Error(
        "Stored API key cannot be decrypted: SETTINGS_ENCRYPTION_KEY is not set or changed",
      );
    }
    try {
      const apiKey = decryptSecret(row.apiKeyEncrypted, key);
      return { providerId, model, apiKey };
    } catch {
      throw new Error(
        "Could not decrypt stored API key. Verify SETTINGS_ENCRYPTION_KEY matches the value used when saving.",
      );
    }
  }

  return {
    providerId,
    model,
    apiKey: getEnvApiKeyForProvider(providerId),
  };
}
