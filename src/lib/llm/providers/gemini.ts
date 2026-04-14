import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content } from "@google/generative-ai";
import type {
  CompleteJsonInterviewParams,
  InterviewLlmProvider,
} from "./types";

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  return key;
}

export function createGeminiProvider(): InterviewLlmProvider {
  return {
    id: "google",
    async completeJsonInterview(params: CompleteJsonInterviewParams) {
      const genAI = new GoogleGenerativeAI(getApiKey());
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
