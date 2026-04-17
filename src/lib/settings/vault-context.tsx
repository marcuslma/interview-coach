"use client";

/**
 * Vault — manages the LLM API key lifecycle on the client.
 *
 * Status machine:
 *   empty    → no encrypted key stored → user must onboard (setup)
 *   locked   → encrypted key present, not yet unlocked this session
 *   unlocked → decrypted key in memory (via ref, never persisted)
 *
 * The decrypted key is kept in a React ref (not state) so it never becomes
 * part of any serialized render tree; a numeric `unlockedAt` in state is what
 * triggers re-renders when status transitions happen.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { LlmProviderId } from "@/lib/llm/providers";
import {
  clearEncryptedKey,
  getServerSnapshot,
  getSettings,
  getSnapshot,
  subscribe as subscribeStore,
  updateSettings,
  type StoredSettings,
} from "@/lib/storage/client-store";
import {
  decryptApiKey,
  encryptApiKey,
  randomSalt,
} from "@/lib/settings/browser-crypto";

export type VaultStatus = "empty" | "locked" | "unlocked";

export type VaultContextValue = {
  status: VaultStatus;
  provider: LlmProviderId;
  model: string;
  /** Only available when status === "unlocked". */
  getApiKey: () => string | null;
  setup: (input: {
    apiKey: string;
    provider: LlmProviderId;
    model: string;
    passphrase: string;
  }) => Promise<void>;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  reset: () => void;
  updateNonSecret: (patch: {
    provider?: LlmProviderId;
    model?: string;
  }) => void;
  /** Re-encrypts the existing API key with a new passphrase. Requires unlocked. */
  changePassphrase: (newPassphrase: string) => Promise<boolean>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

function detectStatus(settings: StoredSettings): "empty" | "locked" {
  return settings.encryptedApiKey && settings.salt ? "locked" : "empty";
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const apiKeyRef = useRef<string | null>(null);

  // Subscribe to the shared snapshot and derive `settings` from it. The store
  // caches the snapshot reference so React's Object.is check is stable.
  const snapshot = useSyncExternalStore(
    (onChange) => {
      const unsub = subscribeStore(() => {
        const s = getSettings();
        // If the encrypted blob was wiped (e.g. reset from another tab or
        // the Settings page), drop the in-memory plaintext key too.
        if (!s.encryptedApiKey && apiKeyRef.current) {
          apiKeyRef.current = null;
          setUnlocked(false);
        }
        onChange();
      });
      return unsub;
    },
    getSnapshot,
    getServerSnapshot,
  );
  const settings = snapshot.settings;

  const status: VaultStatus = useMemo(() => {
    // `unlocked` is only true while `apiKeyRef.current` holds the plaintext
    // key; the subscribe callback above resets both together.
    if (unlocked) return "unlocked";
    return detectStatus(settings);
  }, [settings, unlocked]);

  const getApiKey = useCallback(() => apiKeyRef.current, []);

  const setup = useCallback<VaultContextValue["setup"]>(async (input) => {
    const salt = randomSalt();
    const encryptedApiKey = await encryptApiKey(
      input.apiKey,
      input.passphrase,
      salt,
    );
    apiKeyRef.current = input.apiKey;
    updateSettings({
      provider: input.provider,
      model: input.model,
      encryptedApiKey,
      salt,
    });
    setUnlocked(true);
  }, []);

  const unlock = useCallback<VaultContextValue["unlock"]>(async (passphrase) => {
    const current = getSettings();
    if (!current.encryptedApiKey || !current.salt) {
      return false;
    }
    const plain = await decryptApiKey(
      current.encryptedApiKey,
      passphrase,
      current.salt,
    );
    if (!plain) {
      return false;
    }
    apiKeyRef.current = plain;
    setUnlocked(true);
    return true;
  }, []);

  const lock = useCallback<VaultContextValue["lock"]>(() => {
    apiKeyRef.current = null;
    setUnlocked(false);
  }, []);

  const reset = useCallback<VaultContextValue["reset"]>(() => {
    apiKeyRef.current = null;
    clearEncryptedKey();
    setUnlocked(false);
  }, []);

  const updateNonSecret = useCallback<VaultContextValue["updateNonSecret"]>(
    (patch) => {
      updateSettings(patch);
    },
    [],
  );

  const changePassphrase = useCallback<VaultContextValue["changePassphrase"]>(
    async (newPassphrase) => {
      const plain = apiKeyRef.current;
      if (!plain) return false;
      const salt = randomSalt();
      const encryptedApiKey = await encryptApiKey(
        plain,
        newPassphrase,
        salt,
      );
      updateSettings({ encryptedApiKey, salt });
      return true;
    },
    [],
  );

  const value = useMemo<VaultContextValue>(
    () => ({
      status,
      provider: settings.provider,
      model: settings.model,
      getApiKey,
      setup,
      unlock,
      lock,
      reset,
      updateNonSecret,
      changePassphrase,
    }),
    [
      status,
      settings,
      getApiKey,
      setup,
      unlock,
      lock,
      reset,
      updateNonSecret,
      changePassphrase,
    ],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error("useVault must be used inside <VaultProvider>");
  }
  return ctx;
}
