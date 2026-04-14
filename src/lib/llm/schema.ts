import { z } from "zod";

export const rubricDimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(1).max(10),
  comment: z.string(),
});

export const rubricSchema = z.object({
  overall_score: z.number().min(1).max(10),
  dimensions: z.array(rubricDimensionSchema).min(3),
  summary: z.string(),
  study_next: z.array(z.string()).min(1),
});

export const interviewPhaseSchema = z.enum([
  "clarification",
  "capacity",
  "api_data",
  "deep_dive",
  "warmup",
  "ordering",
  "semantics",
  "complexity",
  "wrap_up",
  "complete",
]);

export const interviewTurnSchema = z
  .object({
    message_markdown: z.string().min(1),
    phase: interviewPhaseSchema,
    session_complete: z.boolean(),
    rubric: rubricSchema.nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.session_complete) {
      if (val.phase !== "complete") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "phase must be complete when session_complete is true",
        });
      }

      if (val.rubric == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "rubric required when session_complete is true",
        });
      }
    } else if (val.rubric != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rubric must be null until session is complete",
      });
    }
  });

export type InterviewTurn = z.infer<typeof interviewTurnSchema>;
export type Rubric = z.infer<typeof rubricSchema>;
