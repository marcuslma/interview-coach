export type InterviewChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmProviderId = "openai" | "anthropic" | "google";

export type CompleteJsonInterviewParams = {
  model: string;
  temperature: number;
  messages: InterviewChatMessage[];
  /** BYOK: provided per request by the client. */
  apiKey: string;
};

export type InterviewLlmProvider = {
  id: LlmProviderId;
  completeJsonInterview: (
    params: CompleteJsonInterviewParams,
  ) => Promise<string>;
};
