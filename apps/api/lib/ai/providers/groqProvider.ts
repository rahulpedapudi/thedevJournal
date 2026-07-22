import { Groq } from "groq-sdk";
import type { GroqMessage, AIProvider } from "../types";
import { logger } from "../../logger";

export class GroqProvider implements AIProvider {
  private client!: Groq;
  private model!: string;

  constructor(api_key: string, model: string) {
    this.client = new Groq({ apiKey: api_key });
    this.model = model;
  }

  async complete(messages: GroqMessage[]): Promise<string> {
    const startTime = Date.now();
    logger.info(
      { provider: "groq", model: this.model },
      "Sending completion request to Groq",
    );
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
      });
      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || "";
      logger.info(
        {
          provider: "groq",
          model: this.model,
          durationMs,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
        },
        "Groq completion succeeded",
      );
      return content;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logger.error(
        { provider: "groq", model: this.model, durationMs, error },
        "Groq completion failed",
      );
      throw error;
    }
  }

  // this is for chatbot, not for the note polishing
  async *stream(messages: GroqMessage[]): AsyncGenerator<string> {
    const startTime = Date.now();
    logger.info(
      { provider: "groq", model: this.model },
      "Initiating streaming request to Groq",
    );
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        stream: true,
        messages: messages,
      });
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta.content || "";
      }
      const durationMs = Date.now() - startTime;
      logger.info(
        { provider: "groq", model: this.model, durationMs },
        "Groq streaming completed",
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logger.error(
        { provider: "groq", model: this.model, durationMs, error },
        "Groq streaming failed",
      );
      throw error;
    }
  }
}
