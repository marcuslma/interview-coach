import { describe, expect, it } from "vitest";
import {
  describeLocaleForPrompt,
  parseAcceptLanguage,
  resolveConversationLocale,
  resolveLocaleHint,
} from "./locale";

describe("parseAcceptLanguage", () => {
  it("returns first language tag", () => {
    expect(parseAcceptLanguage("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt-BR");
  });

  it("defaults to en when missing", () => {
    expect(parseAcceptLanguage(null)).toBe("en");
    expect(parseAcceptLanguage("")).toBe("en");
  });
});

describe("resolveLocaleHint", () => {
  it("prefers body over header", () => {
    expect(resolveLocaleHint("de-DE", "en-US")).toBe("de-DE");
  });

  it("falls back to Accept-Language", () => {
    expect(resolveLocaleHint(undefined, "fr-FR,fr;q=0.9")).toBe("fr-FR");
  });
});

describe("describeLocaleForPrompt", () => {
  it("returns a non-empty label", () => {
    expect(describeLocaleForPrompt("en").length).toBeGreaterThan(0);
    expect(describeLocaleForPrompt("pt-BR").length).toBeGreaterThan(0);
  });
});

describe("resolveConversationLocale", () => {
  it("prefers latest user language when Portuguese is detected", () => {
    const resolved = resolveConversationLocale("en", [
      { role: "assistant", content: "Let's continue." },
      { role: "user", content: "Pode explicar melhor essa parte sobre closures?" },
    ]);
    expect(resolved).toBe("pt-BR");
  });

  it("prefers latest user language when English is detected", () => {
    const resolved = resolveConversationLocale("pt-BR", [
      { role: "assistant", content: "Claro, vamos continuar." },
      {
        role: "user",
        content: "Can you give me one more example with promises and async await?",
      },
    ]);
    expect(resolved).toBe("en");
  });

  it("falls back to hint when language detection is ambiguous", () => {
    const resolved = resolveConversationLocale("pt-BR", [
      { role: "assistant", content: "..." },
      { role: "user", content: "ok" },
    ]);
    expect(resolved).toBe("pt-BR");
  });
});
