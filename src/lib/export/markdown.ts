import type { Rubric } from "@/lib/llm/schema";

export function buildSessionMarkdown(input: {
  title: string;
  promptSummary: string;
  createdAt: Date;
  transcript: { role: string; content: string }[];
  rubric: Rubric | null;
}): string {
  const lines: string[] = [];
  lines.push(`# ${input.title}`);
  lines.push("");
  lines.push(`_Exported at ${input.createdAt.toISOString()}_`);
  lines.push("");
  lines.push("## Brief");
  lines.push(input.promptSummary);
  lines.push("");

  lines.push("## Transcript");
  lines.push("");
  for (const m of input.transcript) {
    const label = m.role === "assistant" ? "Interviewer" : "You";
    lines.push(`### ${label}`);
    lines.push("");
    lines.push(m.content.trim());
    lines.push("");
  }

  if (input.rubric) {
    lines.push("## Rubric");
    lines.push("");
    lines.push(`**Overall:** ${input.rubric.overall_score}/10`);
    lines.push("");
    lines.push(input.rubric.summary);
    lines.push("");
    for (const d of input.rubric.dimensions) {
      lines.push(`- **${d.name}** (${d.score}/10): ${d.comment}`);
    }
    lines.push("");
    lines.push("### Study next");
    lines.push("");
    for (const s of input.rubric.study_next) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
