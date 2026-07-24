import { getUserKeyByProvider } from "../../src/modules/userkeys/userkeys.service";
import { GroqProvider } from "./providers/groqProvider";
import type { AIProvider } from "./types";

export async function getProvider(userId: string): Promise<AIProvider> {
  const provider = process.env.PROVIDER;

  switch (provider) {
    case "groq":
      const api_key = await getUserKeyByProvider(userId, "groq");
      if (!api_key) {
        throw new Error("API_KEY is not configured");
      }
      return new GroqProvider(api_key.key, "openai/gpt-oss-120b");

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
