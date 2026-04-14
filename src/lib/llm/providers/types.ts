export type InterviewChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmProviderId = "openai" | "anthropic" | "google";

export type CompleteJsonInterviewParams = {
  model: string;
  temperature: number;
  messages: InterviewChatMessage[];
  /** When set, used instead of the matching environment variable. */
  apiKey?: string;
};

export type InterviewLlmProvider = {
  id: LlmProviderId;
  completeJsonInterview: (
    params: CompleteJsonInterviewParams,
  ) => Promise<string>;
};
