import OpenAI from "openai";
import type {
  CompleteJsonInterviewParams,
  InterviewLlmProvider,
} from "./types";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return key;
}

export function createOpenAiProvider(): InterviewLlmProvider {
  return {
    id: "openai",
    async completeJsonInterview(params: CompleteJsonInterviewParams) {
      const openai = new OpenAI({ apiKey: getApiKey() });
      const completion = await openai.chat.completions.create({
        model: params.model,
        temperature: params.temperature,
        response_format: { type: "json_object" },
        messages: params.messages,
      });
      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error("Empty completion from model");
      }
      return raw;
    },
  };
}
