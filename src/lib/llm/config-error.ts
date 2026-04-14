/** True when the error indicates missing/invalid LLM credentials (HTTP 503). */
export function isLlmConfigurationErrorMessage(message: string): boolean {
  if (
    message.includes("OPENAI_API_KEY") ||
    message.includes("ANTHROPIC_API_KEY") ||
    message.includes("GOOGLE_API_KEY")
  ) {
    return true;
  }
  const lower = message.toLowerCase();
  if (lower.includes("api key")) {
    return true;
  }
  if (
    lower.includes("authentication") ||
    lower.includes("permission denied") ||
    lower.includes("invalid api key")
  ) {
    return true;
  }
  return false;
}
