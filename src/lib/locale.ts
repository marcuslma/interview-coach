/** BCP 47-ish tag from Accept-Language (first entry). Defaults to `en`. */
export function parseAcceptLanguage(header: string | null): string {
  if (!header?.trim()) {
    return "en";
  }
  const first = header.split(",")[0]?.trim() ?? "";
  const tag = first.split(";")[0]?.trim() ?? "";
  if (!tag || !isReasonableLocaleTag(tag)) {
    return "en";
  }
  return tag;
}

const LOCALE_TAG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]+)*$/;

function isReasonableLocaleTag(s: string): boolean {
  return s.length <= 32 && LOCALE_TAG.test(s);
}

/** Prefer explicit client hint; fall back to Accept-Language. */
export function resolveLocaleHint(
  preferredFromBody: string | undefined | null,
  acceptLanguageHeader: string | null,
): string {
  const trimmed = preferredFromBody?.trim();
  if (trimmed && isReasonableLocaleTag(trimmed)) {
    return trimmed;
  }
  return parseAcceptLanguage(acceptLanguageHeader);
}

/** Human-readable label for prompts (English meta-instructions). */
export function describeLocaleForPrompt(locale: string): string {
  try {
    const [lang, region] = locale.split("-");
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    const langName = dn.of(lang) ?? lang;
    if (region && /^[A-Z]{2}$/i.test(region)) {
      const rn = new Intl.DisplayNames(["en"], { type: "region" });
      const regionName = rn.of(region.toUpperCase());
      if (regionName) {
        return `${langName} (${regionName})`;
      }
    }
    return langName;
  } catch {
    return locale;
  }
}

/** Extra system message: default language + mirror candidate language. */
export function buildLanguageInstruction(locale: string): string {
  const label = describeLocaleForPrompt(locale);
  return `## Interview language (natural language)
- Default language for \`message_markdown\`, rubric fields (\`summary\`, dimension \`name\`/\`comment\`, \`study_next\` lines), and any prose you add: **${label}**.
- If the candidate's **latest** message is clearly written in a **different** natural language, write this turn in **that** language instead (mirror the candidate).
- Code fences, identifiers, and established English technical terms may remain in English when typical in technical interviews.
- JSON keys and structure are fixed; only string *values* follow the rules above.`;
}
