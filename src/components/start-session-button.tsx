"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FieldError } from "@/components/ui";
import { getPromptById } from "@/lib/prompts";
import { createSession } from "@/lib/storage/client-store";

export function StartSessionButton({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setLoading(true);
    setError(null);

    try {
      const prompt = getPromptById(promptId);
      if (!prompt) {
        setError("Unknown prompt");
        return;
      }

      const sessionId = crypto.randomUUID();
      createSession({ id: sessionId, promptId, title: prompt.title });
      router.push(`/session/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={onClick} loading={loading} disabled={loading}>
        {loading ? "Starting…" : "Start session"}
      </Button>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
