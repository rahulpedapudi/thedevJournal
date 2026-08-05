import type { AIProvider } from "../../../../lib/ai/types";
import { buildSystemPrompt } from "./prompt";
import { type LLMMessage } from "../../../../lib/ai/types";
import { executeTool, availableTools } from "../tools";
import { logger } from "../../../../lib/logger";

export async function runAgent(
  userId: string,
  client: AIProvider,
  context: string,
  messages: LLMMessage[],
): Promise<{ response: string }> {
  logger.info(
    {
      messages: messages,
    },
    "Starting Agent Loop with messages.....",
  );

  const MAX_ITERATIONS = 10;

  const message_history: LLMMessage[] = [
    { role: "system", content: buildSystemPrompt(context) },
    ...messages,
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    logger.info(
      {
        iterations: i + 1,
      },
      "Running iteration",
    );

    const response = await client.complete(message_history, availableTools);

    const assistantMessage = response.msg;

    logger.info(
      {
        assitant_message: assistantMessage,
      },
      "Assistant Message",
    );

    const toolCalls = assistantMessage.tool_calls;

    logger.info(
      {
        tool_calls: toolCalls,
      },
      "Tool Calls",
    );

    // Push the full assistant message (including tool_calls) into history
    message_history.push(assistantMessage);

    // If there are no tool calls, the model is done — return the final response
    if (!toolCalls || toolCalls.length === 0) {
      return {
        response: assistantMessage.content || "",
      };
    }

    // Execute each tool and append the results to history
    for (const tool of toolCalls) {
      logger.info(
        {
          tool_name: tool.function.name,
          tool_args: tool.function.arguments,
        },
        "Executing tool",
      );

      const toolResult = await executeTool(
        tool.function.name,
        JSON.parse(tool.function.arguments),
        userId,
      );

      logger.info(
        {
          tool_name: tool.function.name,
          tool_args: tool.function.arguments,
          tool_result: toolResult,
        },
        "Tool Result",
      );

      message_history.push({
        role: "tool",
        tool_call_id: tool.id,
        content:
          typeof toolResult === "string"
            ? toolResult
            : JSON.stringify(toolResult),
      });
    }
  }

  // If we exhaust all iterations, return the last assistant message
  const lastAssistant = message_history
    .filter((m) => m.role === "assistant")
    .pop();

  return {
    response:
      lastAssistant?.content ||
      "I wasn't able to complete the task within the allowed steps.",
  };
}
