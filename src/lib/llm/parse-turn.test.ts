import { describe, expect, it } from "vitest";
import { parseInterviewTurnJson } from "./parse-turn";

const validComplete = JSON.stringify({
  message_markdown: "Thanks for the session.",
  phase: "complete",
  session_complete: true,
  rubric: {
    overall_score: 7,
    dimensions: [
      { name: "Clarity", score: 7, comment: "Clear enough." },
      { name: "Depth", score: 6, comment: "Some gaps." },
      { name: "Trade-offs", score: 8, comment: "Good." },
    ],
    summary: "Solid performance.",
    study_next: ["Review X", "Practice Y"],
  },
});

const validMid = JSON.stringify({
  message_markdown: "What happens next?",
  phase: "warmup",
  session_complete: false,
  rubric: null,
});

describe("parseInterviewTurnJson", () => {
  it("accepts valid mid-session turn", () => {
    const t = parseInterviewTurnJson(validMid);
    expect(t.phase).toBe("warmup");
    expect(t.session_complete).toBe(false);
    expect(t.rubric).toBeNull();
  });

  it("accepts valid completed session with rubric", () => {
    const t = parseInterviewTurnJson(validComplete);
    expect(t.session_complete).toBe(true);
    expect(t.rubric?.overall_score).toBe(7);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseInterviewTurnJson("not json")).toThrow("non-JSON");
  });

  it("rejects JSON that fails schema", () => {
    const bad = JSON.stringify({
      message_markdown: "x",
      phase: "warmup",
      session_complete: true,
      rubric: null,
    });
    expect(() => parseInterviewTurnJson(bad)).toThrow(
      "Invalid interview turn JSON",
    );
  });
});
