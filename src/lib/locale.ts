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

type HistoryRole = "user" | "assistant";
type HistoryLikeMessage = { role: HistoryRole; content: string };

const PT_HINTS = [
  " voce ",
  " você ",
  " pode ",
  " nao ",
  " não ",
  " para ",
  " com ",
  " uma ",
  " que ",
  " essa ",
  " esse ",
  " sobre ",
  " melhor ",
  " como ",
  " estou ",
  " obrigado ",
  " obrigada ",
  " idioma ",
];

const ES_HINTS = [
  " usted ",
  " ustedes ",
  " para ",
  " con ",
  " una ",
  " que ",
  " como ",
  " estoy ",
  " gracias ",
  " idioma ",
];

const EN_HINTS = [
  " the ",
  " and ",
  " with ",
  " for ",
  " this ",
  " that ",
  " can ",
  " could ",
  " should ",
  " please ",
];

function scoreHints(haystack: string, hints: readonly string[]): number {
  let score = 0;
  for (const hint of hints) {
    if (haystack.includes(hint)) score += 1;
  }
  return score;
}

function inferLanguageTagFromText(text: string): string | null {
  const normalized = ` ${text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()} `;

  if (normalized.trim().length < 3) {
    return null;
  }

  const hasPortugueseAccent = /[ãõçáéíóúâêôà]/i.test(normalized);
  const hasSpanishAccent = /[ñáéíóú¿¡]/i.test(normalized);

  const ptScore = scoreHints(normalized, PT_HINTS) + (hasPortugueseAccent ? 2 : 0);
  const esScore = scoreHints(normalized, ES_HINTS) + (hasSpanishAccent ? 2 : 0);
  const enScore = scoreHints(normalized, EN_HINTS);

  if (ptScore >= esScore + 1 && ptScore >= enScore + 1 && ptScore >= 2) {
    return "pt-BR";
  }
  if (esScore >= ptScore + 1 && esScore >= enScore + 1 && esScore >= 2) {
    return "es-ES";
  }
  if (enScore >= ptScore + 1 && enScore >= esScore + 1 && enScore >= 2) {
    return "en";
  }
  return null;
}

/**
 * Prefer the latest user message language when confidently detected.
 * Fall back to provided locale hint if detection is ambiguous.
 */
export function resolveConversationLocale(
  localeHint: string,
  history: HistoryLikeMessage[],
): string {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const msg = history[i];
    if (msg.role !== "user") continue;
    const inferred = inferLanguageTagFromText(msg.content);
    if (inferred) return inferred;
    break;
  }
  return localeHint;
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
- Use **${label}** for this answer's natural language output.
- If the candidate's latest message is clearly in another language, mirror the candidate and use that language for this answer.
- This rule is strict and applies to every track/topic (JavaScript, NestJS, React, etc.).
- Code fences, identifiers, and established English technical terms may remain in English when typical in technical interviews.
- JSON keys and structure are fixed; only string *values* follow the rules above.`;
}
