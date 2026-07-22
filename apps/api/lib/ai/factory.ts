import { GroqProvider } from "./providers/groqProvider";
import type { AIProvider } from "./types";

export function getProvider(): AIProvider {
  const provider = process.env.PROVIDER;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY is not configured");
  }

  switch (provider) {
    case "groq":
      return new GroqProvider(apiKey, "openai/gpt-oss-120b");

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
