import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { getEnvApiKeyForProvider } from "./env-keys";
import type {
  CompleteJsonInterviewParams,
  InterviewLlmProvider,
} from "./types";

function toAnthropicMessages(
  messages: CompleteJsonInterviewParams["messages"],
): { system: string; messages: MessageParam[] } {
  const systemParts: string[] = [];
  const rest: MessageParam[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(m.content);
      continue;
    }
    rest.push({ role: m.role, content: m.content });
  }
  return {
    system: systemParts.join("\n\n"),
    messages: rest,
  };
}

export function createAnthropicProvider(): InterviewLlmProvider {
  return {
    id: "anthropic",
    async completeJsonInterview(params: CompleteJsonInterviewParams) {
      const apiKey = params.apiKey?.trim() || getEnvApiKeyForProvider("anthropic");
      const client = new Anthropic({ apiKey });
      const { system, messages } = toAnthropicMessages(params.messages);
      const response = await client.messages.create({
        model: params.model,
        max_tokens: 8192,
        temperature: params.temperature,
        system,
        messages,
      });
      const block = response.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") {
        throw new Error("Empty completion from Anthropic");
      }
      return block.text;
    },
  };
}
