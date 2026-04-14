export type PracticeCategory =
  | "javascript"
  | "system_design"
  | "nodejs"
  | "typescript"
  | "nestjs"
  | "nextjs"
  | "software_architecture"
  | "design_patterns";

/** Default tab when `?track=` is omitted (clean URL). */
export const DEFAULT_TRACK_SLUG = "javascript";

/** URL query ?track=… slugs (default tab: javascript) */
export const TRACK_SLUGS: {
  slug: string;
  category: PracticeCategory;
}[] = [
  { slug: "javascript", category: "javascript" },
  { slug: "typescript", category: "typescript" },
  { slug: "nodejs", category: "nodejs" },
  { slug: "nestjs", category: "nestjs" },
  { slug: "nextjs", category: "nextjs" },
  { slug: "system_design", category: "system_design" },
  { slug: "software_architecture", category: "software_architecture" },
  { slug: "design_patterns", category: "design_patterns" },
];

export function categoryFromTrackParam(param: string | null): PracticeCategory {
  if (!param) {
    return "javascript";
  }

  const found = TRACK_SLUGS.find((t) => t.slug === param);
  return found?.category ?? "javascript";
}

export function trackSlugFromCategory(
  category: PracticeCategory,
): string {
  const found = TRACK_SLUGS.find((t) => t.category === category);
  return found?.slug ?? DEFAULT_TRACK_SLUG;
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
  javascript: "JavaScript",
  system_design: "System design",
  nodejs: "Node.js",
  typescript: "TypeScript",
  nestjs: "NestJS",
  nextjs: "Next.js",
  software_architecture: "Software architecture",
  design_patterns: "Design patterns",
};
