import { Groq } from "groq-sdk";
import type { LLMMessage, AIProvider, LLMResponse } from "../types";
import { logger } from "../../logger";

export class GroqProvider implements AIProvider {
  private client!: Groq;
  // private model!: string;

  constructor(api_key: string) {
    this.client = new Groq({ apiKey: api_key });
    // this.model = model;
  }

  async complete(
    messages: LLMMessage[],
    tools?: any,
    model?: string,
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const selectedModel = model || "openai/gpt-oss-120b";
    logger.info(
      { provider: "groq", model: selectedModel },
      "Sending completion request to Groq",
    );
    try {
      const response = await this.client.chat.completions.create({
        model: selectedModel,
        messages: messages as unknown as Groq.Chat.ChatCompletionMessageParam[],
        tools: tools || undefined,
      });

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || "";
      const toolCalls = response.choices[0]?.message.tool_calls;
      const finishReason = response.choices[0]?.finish_reason || "";

      logger.info(
        {
          provider: "groq",
          model: selectedModel,
          durationMs,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
        },
        "Groq completion succeeded",
      );

      return {
        msg: {
          role: "assistant",
          content: content,
          ...(toolCalls && toolCalls.length > 0 && { tool_calls: toolCalls }),
        },
        finish_reason: finishReason,
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;
      logger.error(
        { provider: "groq", model: selectedModel, durationMs, error },
        "Groq completion failed",
      );
      throw error;
    }
  }

  // this is for chatbot, not for the note polishing
  async *stream(messages: LLMMessage[], model?: string): AsyncGenerator<any> {
    const startTime = Date.now();
    const selectedModel = model || "openai/gpt-oss-120b";
    logger.info(
      { provider: "groq", model: selectedModel },
      "Initiating streaming request to Groq",
    );

    try {
      const stream = await this.client.chat.completions.create({
        model: selectedModel,
        stream: true,
        messages: messages as unknown as Groq.Chat.ChatCompletionMessageParam[],
      });

      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta.content || "";
      }

      const durationMs = Date.now() - startTime;

      logger.info(
        { provider: "groq", model: selectedModel, durationMs },
        "Groq streaming completed",
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logger.error(
        { provider: "groq", model: selectedModel, durationMs, error },
        "Groq streaming failed",
      );
      throw error;
    }
  }
}
