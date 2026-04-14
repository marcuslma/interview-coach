import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content } from "@google/generative-ai";
import { getEnvApiKeyForProvider } from "./env-keys";
import type {
  CompleteJsonInterviewParams,
  InterviewLlmProvider,
} from "./types";

export function createGeminiProvider(): InterviewLlmProvider {
  return {
    id: "google",
    async completeJsonInterview(params: CompleteJsonInterviewParams) {
      const apiKey = params.apiKey?.trim() || getEnvApiKeyForProvider("google");
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemParts: string[] = [];
      const contents: Content[] = [];
      for (const m of params.messages) {
        if (m.role === "system") {
          systemParts.push(m.content);
          continue;
        }
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
      const model = genAI.getGenerativeModel({
        model: params.model,
        systemInstruction: systemParts.join("\n\n") || undefined,
        generationConfig: {
          temperature: params.temperature,
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent({
        contents,
      });
      const raw = result.response.text();
      if (!raw?.trim()) {
        throw new Error("Empty completion from Gemini");
      }
      return raw;
    },
  };
}
