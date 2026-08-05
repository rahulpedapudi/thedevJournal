import { getProvider } from "../../../lib/ai/factory";
import type { LLMMessage } from "../../../lib/ai/types";
import { db } from "../../db/db";
import { messages } from "../../db/schemas";
import { AppError } from "../../lib/app-error";
import { runAgent } from "../agent/runtime";
import { getUserConversationMessages } from "../conversation/conversation.service";
import { getUserSettings } from "../settings/settings.service";
import { getUserKeyByProvider } from "../userkeys/userkeys.service";

import { logger } from "../../../lib/logger";
import { getUserDevNote } from "../devnotes/devnote.service";

async function _getUserCreds(userId: string) {
  const userSettings = await getUserSettings(userId);

  logger.info(
    {
      userSettings: userSettings,
    },
    "User settings found",
  );

  if (!userSettings) {
    throw new Error("User settings not found");
  }
  const apiKey = await getUserKeyByProvider(
    userId,
    userSettings.defaultProvider!,
  );

  logger.info(
    {
      apiKey: apiKey,
    },
    "API key found",
  );

  if (!apiKey) {
    throw new Error("API key not found");
  }

  return {
    provider: userSettings.defaultProvider!,
    apiKey: apiKey.key,
    // custom inst. are the instructions user wants the llm to follow.
    customInstructions: userSettings.customInstructions!,
  };
}

async function _getMessageHistory(
  userId: string,
  convId: string,
): Promise<LLMMessage[]> {
  logger.info(
    {
      userId: userId,
      conversationId: convId,
    },
    "Getting message history",
  );

  const messages = await getUserConversationMessages(userId, convId, true);

  logger.info(
    {
      messages: messages,
    },
    "Message history found",
  );

  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

async function _buildContext(
  userId: string,
  noteId: string | undefined,
  customInstructions: string,
) {
  if (!noteId) {
    return `User Custom Instructions: 
    - You must follow these rules
    ${customInstructions}`;
  }

  const note = await getUserDevNote(userId, noteId);

  return `Current Note Content: ${note?.rawContent}, Updated at: ${note?.updatedAt}
  
  User Custom Instructions: 
  - You must follow these rules
  ${customInstructions}
  `;
}

async function _saveMessage(
  userId: string,
  convId: string,
  message: LLMMessage,
) {
  try {
    logger.info(
      {
        message: message,
        convId: convId,
        userId: userId,
      },
      "Saving message",
    );

    await db.insert(messages).values({
      userId: userId,
      conversationId: convId,
      role: message.role,
      content: message.content,
    });
  } catch (error) {
    throw new AppError(
      500,
      `Failed to save in message in chat service ${error}`,
    );
  }
}

export async function handleChat(
  userId: string,
  prompt: string,
  convId: string,
  noteId?: string,
  // projectId?: string,
) {
  logger.info(
    {
      userId: userId,
      prompt: prompt,
      convId: convId,
      noteId: noteId,
    },
    "Handling chat",
  );

  const userCreds = await _getUserCreds(userId);

  const provider = await getProvider(userCreds.provider, userCreds.apiKey);
  const messages = await _getMessageHistory(userId, convId);
  const context = await _buildContext(
    userId,
    noteId || undefined,
    userCreds.customInstructions,
  );

  logger.info({ contextPassed: context }, "Agent Context");

  const userMessage: LLMMessage = {
    role: "user",
    content: prompt,
  };
  messages.push(userMessage);
  await _saveMessage(userId, convId, userMessage);

  const llmResponse = await runAgent(userId, provider, context, messages);

  await _saveMessage(userId, convId, {
    role: "assistant",
    content: llmResponse.response,
  });

  return llmResponse.response;
}
