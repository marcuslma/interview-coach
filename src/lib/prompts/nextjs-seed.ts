import type { PracticePrompt } from "./types";

export const NEXTJS_PROMPTS: PracticePrompt[] = [
  {
    category: "nextjs",
    id: "next-app-router-layouts",
    title: "App Router: layouts & nesting",
    summary: "layout.tsx, template, loading, error boundaries.",
    tags: ["app-router", "layouts"],
    primaryLanguage: "typescript",
    candidateBrief:
      "How nested layouts compose, what re-renders when, where to fetch.",
    evaluatorNotes:
      "Contrast layout vs page. Ask about partial rendering and error.tsx boundaries.",
  },
  {
    category: "nextjs",
    id: "next-server-client-components",
    title: "Server vs Client Components",
    summary: "When to use 'use client', boundaries, serializable props.",
    tags: ["rsc", "client"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Decide server vs client for UI pieces; know what cannot cross the boundary.",
    evaluatorNotes:
      "Ask about hooks in client-only components and passing callbacks. Keep Next 13+ App Router mental model.",
  },
  {
    category: "nextjs",
    id: "next-data-fetching-cache",
    title: "Fetching, caching & revalidation",
    summary: "fetch cache, revalidatePath/Tag, static vs dynamic routes.",
    tags: ["cache", "data"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Choose caching strategy for a dashboard vs personalized page.",
    evaluatorNotes:
      "Discuss stale data vs freshness. Mention route segment config at high level.",
  },
  {
    category: "nextjs",
    id: "next-metadata-seo",
    title: "Metadata & SEO (App Router)",
    summary: "generateMetadata, OG tags, dynamic routes.",
    tags: ["seo", "metadata"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Expose correct titles and social previews for dynamic blog posts.",
    evaluatorNotes:
      "Ask how to avoid duplicate metadata in nested layouts.",
  },
  {
    category: "nextjs",
    id: "next-api-route-handlers",
    title: "Route Handlers & Server Actions (lite)",
    summary: "When to use POST handler vs server action.",
    tags: ["api", "server-actions"],
    primaryLanguage: "typescript",
    candidateBrief:
      "Design a form submit flow with validation and revalidation.",
    evaluatorNotes:
      "Security: never trust client. Mention CSRF considerations briefly for cookie sessions.",
  },
];
