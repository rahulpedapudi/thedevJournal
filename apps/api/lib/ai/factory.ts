import { GroqProvider } from "./providers/groqProvider";
import type { AIProvider } from "./types";
import { getUserKeyByProvider } from "../../src/modules/userkeys/userkeys.service";

export async function getProvider(
  provider: "groq" | "gemini" | "openrouter",
  apiKey: string,
): Promise<AIProvider> {
  switch (provider) {
    case "groq":
      if (!apiKey) {
        throw new Error("API_KEY is not configured");
      }
      return new GroqProvider(apiKey, "openai/gpt-oss-120b");

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
