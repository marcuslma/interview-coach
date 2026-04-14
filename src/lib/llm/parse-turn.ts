import { interviewTurnSchema, type InterviewTurn } from "./schema";

export function parseInterviewTurnJson(raw: string): InterviewTurn {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model returned non-JSON output");
  }

  const result = interviewTurnSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid interview turn JSON: ${result.error.message}`);
  }

  return result.data;
}
