import OpenAI from "openai";
import type {
  CompleteJsonInterviewParams,
  InterviewLlmProvider,
} from "./types";

export function createOpenAiProvider(): InterviewLlmProvider {
  return {
    id: "openai",
    async completeJsonInterview(params: CompleteJsonInterviewParams) {
      const apiKey = params.apiKey?.trim();
      if (!apiKey) {
        throw new Error("Missing OpenAI API key");
      }
      const openai = new OpenAI({ apiKey });
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
