import { describe, expect, it } from "vitest";
import {
  describeLocaleForPrompt,
  parseAcceptLanguage,
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
