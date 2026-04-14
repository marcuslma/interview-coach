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
export const DEFAULT_TRACK_SLUG = "system_design";

/** URL query ?track=… slugs (default tab: system_design) */
export const TRACK_SLUGS: {
  slug: string;
  category: PracticeCategory;
}[] = [
  { slug: "system_design", category: "system_design" },
  { slug: "javascript", category: "javascript" },
  { slug: "typescript", category: "typescript" },
  { slug: "software_architecture", category: "software_architecture" },
  { slug: "design_patterns", category: "design_patterns" },
  { slug: "nodejs", category: "nodejs" },
  { slug: "nestjs", category: "nestjs" },
  { slug: "nextjs", category: "nextjs" },
];

export function categoryFromTrackParam(param: string | null): PracticeCategory {
  if (!param) {
    return "system_design";
  }

  const found = TRACK_SLUGS.find((t) => t.slug === param);
  return found?.category ?? "system_design";
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
