import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getInterviewModelForProvider,
  getLlmProviderId,
  type LlmProviderId,
} from "@/lib/llm/providers";
import { encryptSecret, getSettingsEncryptionKey } from "@/lib/settings/crypto";
import {
  deleteAppLlmSettings,
  getAppLlmSettingsRow,
  upsertAppLlmSettings,
} from "@/lib/settings/llm-store";
import { parseStoredLlmProvider } from "@/lib/settings/interview-llm-config";

const postSchema = z.object({
  clear: z.boolean().optional(),
  clearApiKey: z.boolean().optional(),
  provider: z.enum(["openai", "anthropic", "google"]).optional(),
  model: z.string().max(512).optional(),
  /** Empty string clears stored key; omitted leaves stored key unchanged. */
  apiKey: z.string().max(8192).optional(),
});

export async function GET() {
  const row = await getAppLlmSettingsRow();
  const encryptionKeyConfigured = !!getSettingsEncryptionKey();
  const envProvider = getLlmProviderId();

  if (!row) {
    return NextResponse.json({
      source: "env" as const,
      provider: envProvider,
      model: getInterviewModelForProvider(envProvider),
      hasStoredApiKey: false,
      encryptionKeyConfigured,
    });
  }

  return NextResponse.json({
    source: "database" as const,
    provider: parseStoredLlmProvider(row.llmProvider),
    model: row.model,
    hasStoredApiKey: !!row.apiKeyEncrypted?.trim(),
    encryptionKeyConfigured,
  });
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;

  if (body.clear) {
    await deleteAppLlmSettings();
    return NextResponse.json({ ok: true });
  }

  if (body.clearApiKey) {
    const row = await getAppLlmSettingsRow();
    if (!row) {
      return NextResponse.json(
        { error: "No saved settings to update" },
        { status: 400 },
      );
    }
    await upsertAppLlmSettings({
      llmProvider: parseStoredLlmProvider(row.llmProvider),
      model: row.model,
      apiKeyEncrypted: null,
    });
    return NextResponse.json({ ok: true });
  }

  if (!body.provider) {
    return NextResponse.json(
      { error: "provider is required (unless using clear or clearApiKey)" },
      { status: 400 },
    );
  }

  const provider = body.provider as LlmProviderId;
  const modelTrim = (body.model ?? "").trim();
  const model =
    modelTrim || getInterviewModelForProvider(provider);

  const existing = await getAppLlmSettingsRow();
  let apiKeyEncrypted: string | null = existing?.apiKeyEncrypted ?? null;

  if (body.apiKey !== undefined) {
    if (body.apiKey.trim() === "") {
      apiKeyEncrypted = null;
    } else {
      const key = getSettingsEncryptionKey();
      if (!key) {
        return NextResponse.json(
          {
            error:
              "Set SETTINGS_ENCRYPTION_KEY in the environment to store an API key in the database",
          },
          { status: 501 },
        );
      }
      apiKeyEncrypted = encryptSecret(body.apiKey.trim(), key);
    }
  }

  await upsertAppLlmSettings({
    llmProvider: provider,
    model,
    apiKeyEncrypted,
  });

  return NextResponse.json({ ok: true });
}
