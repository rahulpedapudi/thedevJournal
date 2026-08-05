import type { Request, Response } from "express";
import {
  createUserConversation,
  deleteUserConversation,
  getUserConversationMessages,
  getUserConversations,
  patchUserConversation,
} from "./conversation.service";
import type { PatchConversationBody } from "./conversation.types";

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;

    const conversations = await getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}

export async function getConversationMessages(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    const messages = await getUserConversationMessages(userId, id);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}

export async function createConversation(
  req: Request<{}, {}, {}, { noteId?: string }>,
  res: Response,
) {
  try {
    const userId = req.user?.id!;

    const { noteId } = req.query;

    const created = await createUserConversation(userId, noteId || undefined);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}

export async function updateConversation(
  req: Request<{ id: string }, {}, PatchConversationBody>,
  res: Response,
) {
  try {
    const userId = req.user?.id!;
    const { title } = req.body;
    const { id } = req.params;

    const patched = await patchUserConversation(userId, id, title);

    res.status(200).json({
      success: true,
      data: patched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}

export async function deleteConversation(
  req: Request<{ id: string }, {}, {}, { permanent?: string }>,
  res: Response,
) {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const { permanent } = req.query;

    const deleted = await deleteUserConversation(
      userId,
      id,
      permanent === "true",
    );

    res.status(200).json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}
