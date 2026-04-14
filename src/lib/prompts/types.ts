export type PracticeCategory =
  | "javascript_fundamentals"
  | "system_design"
  | "nodejs"
  | "typescript"
  | "nestjs"
  | "nextjs";

/** URL query ?track=… slugs (default: javascript) */
export const TRACK_SLUGS: {
  slug: string;
  category: PracticeCategory;
}[] = [
  { slug: "javascript", category: "javascript_fundamentals" },
  { slug: "system_design", category: "system_design" },
  { slug: "nodejs", category: "nodejs" },
  { slug: "typescript", category: "typescript" },
  { slug: "nestjs", category: "nestjs" },
  { slug: "nextjs", category: "nextjs" },
];

export function categoryFromTrackParam(param: string | null): PracticeCategory {
  if (!param || param === "javascript") {
    return "javascript_fundamentals";
  }
  const found = TRACK_SLUGS.find((t) => t.slug === param);
  return found?.category ?? "javascript_fundamentals";
}

export function trackSlugFromCategory(
  category: PracticeCategory,
): string {
  const found = TRACK_SLUGS.find((t) => t.category === category);
  return found?.slug ?? "javascript";
}

export type PracticePrompt = {
  id: string;
  category: PracticeCategory;
  title: string;
  summary: string;
  tags: string[];
  /** Primary language for fenced code blocks */
  primaryLanguage?: string;
  candidateBrief: string;
  evaluatorNotes: string;
};

/** @deprecated use PracticePrompt */
export type DesignPrompt = PracticePrompt;

export const CATEGORY_LABEL: Record<PracticeCategory, string> = {
  javascript_fundamentals: "JavaScript fundamentals",
  system_design: "System design",
  nodejs: "Node.js",
  typescript: "TypeScript",
  nestjs: "NestJS",
  nextjs: "Next.js",
};
