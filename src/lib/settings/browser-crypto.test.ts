import { describe, expect, it } from "vitest";
import {
  decryptApiKey,
  encryptApiKey,
  randomSalt,
} from "./browser-crypto";

describe("browser-crypto", () => {
  it("round-trips an API key with the correct passphrase", async () => {
    const salt = randomSalt();
    const blob = await encryptApiKey("sk-test-1234", "hunter2", salt);
    const plain = await decryptApiKey(blob, "hunter2", salt);
    expect(plain).toBe("sk-test-1234");
  });

  it("returns null for the wrong passphrase", async () => {
    const salt = randomSalt();
    const blob = await encryptApiKey("sk-test-1234", "hunter2", salt);
    const plain = await decryptApiKey(blob, "wrong-passphrase", salt);
    expect(plain).toBeNull();
  });

  it("returns null for a tampered ciphertext", async () => {
    const salt = randomSalt();
    const blob = await encryptApiKey("sk-test-1234", "hunter2", salt);
    // Replace the first base64url character deterministically — any change
    // inside iv||ct||tag fails AES-GCM auth with overwhelming probability.
    const first = blob[0];
    const replacement = first === "A" ? "B" : "A";
    const tampered = replacement + blob.slice(1);
    const plain = await decryptApiKey(tampered, "hunter2", salt);
    expect(plain).toBeNull();
  });

  it("produces different ciphertexts on repeat encryption (random IV)", async () => {
    const salt = randomSalt();
    const a = await encryptApiKey("sk-test-1234", "hunter2", salt);
    const b = await encryptApiKey("sk-test-1234", "hunter2", salt);
    expect(a).not.toBe(b);
  });

  it("generates unique salts", () => {
    const s1 = randomSalt();
    const s2 = randomSalt();
    expect(s1).not.toBe(s2);
    expect(s1.length).toBeGreaterThan(0);
  });
});
