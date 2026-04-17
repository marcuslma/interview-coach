/**
 * Zero-knowledge encryption for the LLM API key.
 *
 * Design:
 * - Derive a 256-bit AES-GCM key from the user passphrase via
 *   PBKDF2-SHA-256 with 200_000 iterations and a random 128-bit salt.
 * - Encrypt the API key with AES-GCM (random 96-bit IV per encryption,
 *   128-bit auth tag). Output is `base64url(iv || ciphertext || tag)`.
 * - The passphrase is NEVER stored. `decryptApiKey` returns `null` if the
 *   auth tag fails (wrong passphrase or tampered blob).
 *
 * Runs in the browser via Web Crypto and in Node ≥20 for tests.
 */

const PBKDF2_ITERATIONS = 200_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;

function getCrypto(): Crypto {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto is not available in this environment");
  }
  return globalThis.crypto;
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    s += String.fromCharCode(bytes[i]!);
  }
  // btoa is available in modern browsers and in Node (via global).
  const b64 = btoa(s);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/** 128-bit salt, base64url-encoded for storage. */
export function randomSalt(): string {
  const bytes = new Uint8Array(new ArrayBuffer(SALT_BYTES));
  getCrypto().getRandomValues(bytes);
  return toBase64Url(bytes);
}

function utf8Bytes(s: string): Uint8Array<ArrayBuffer> {
  const arr = new TextEncoder().encode(s);
  const buf = new ArrayBuffer(arr.byteLength);
  const out = new Uint8Array(buf);
  out.set(arr);
  return out;
}

async function deriveKey(
  passphrase: string,
  saltB64: string,
): Promise<CryptoKey> {
  const subtle = getCrypto().subtle;
  const baseKey = await subtle.importKey(
    "raw",
    utf8Bytes(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64Url(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptApiKey(
  apiKey: string,
  passphrase: string,
  saltB64: string,
): Promise<string> {
  const subtle = getCrypto().subtle;
  const key = await deriveKey(passphrase, saltB64);
  const iv = new Uint8Array(new ArrayBuffer(IV_BYTES));
  getCrypto().getRandomValues(iv);
  const cipherBuf = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    utf8Bytes(apiKey),
  );
  const cipher = new Uint8Array(cipherBuf);
  const combined = new Uint8Array(
    new ArrayBuffer(iv.byteLength + cipher.byteLength),
  );
  combined.set(iv, 0);
  combined.set(cipher, iv.byteLength);
  return toBase64Url(combined);
}

/**
 * Returns the decrypted API key, or `null` when decryption fails (wrong
 * passphrase, tampered blob, or malformed input).
 */
export async function decryptApiKey(
  blobB64: string,
  passphrase: string,
  saltB64: string,
): Promise<string | null> {
  try {
    const subtle = getCrypto().subtle;
    const key = await deriveKey(passphrase, saltB64);
    const combined = fromBase64Url(blobB64);
    if (combined.byteLength <= IV_BYTES) {
      return null;
    }
    const iv = combined.subarray(0, IV_BYTES);
    const cipher = combined.subarray(IV_BYTES);
    const plainBuf = await subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher,
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    return null;
  }
}
