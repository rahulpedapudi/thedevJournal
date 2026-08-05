import type { Response, Request } from "express";
import type { ChatRequestBody } from "./chat.types";
import { createUserConversation } from "../conversation/conversation.service";
import { handleChat } from "./chat.service";
import { logger } from "../../../lib/logger";

export async function chatController(
  req: Request<{}, ChatRequestBody>,
  res: Response,
) {
  const userId = req.user?.id!;
  const { prompt, projectId, noteId, conversationId } = req.body;

  logger.info(
    {
      prompt: prompt,
      conversationId: conversationId,
    },
    "Chat request received",
  );

  let convId = conversationId;
  if (!conversationId) {
    logger.info(
      {
        userId: userId,
      },
      "No conversation id provided creating new one",
    );
    const newConvo = await createUserConversation(userId, noteId);
    convId = newConvo?.[0]?.id!;

    logger.info(
      {
        conversationId: convId,
      },
      "New conversation created",
    );
  }

  const response = await handleChat(userId, prompt, convId, noteId);

  try {
    res.status(200).json({
      success: true,
      data: response,
      conversationId: convId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error - ${error}`,
    });
  }
}
