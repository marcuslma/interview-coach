import { describe, expect, it } from "vitest";
import { decryptSecret, deriveSettingsKey, encryptSecret } from "./crypto";

describe("settings crypto", () => {
  it("round-trips secrets", () => {
    const key = deriveSettingsKey("test-passphrase-unique");
    const enc = encryptSecret("sk-test-secret", key);
    expect(decryptSecret(enc, key)).toBe("sk-test-secret");
  });
});
