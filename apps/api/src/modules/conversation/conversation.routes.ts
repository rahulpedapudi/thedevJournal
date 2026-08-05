import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import {
  createConversation,
  deleteConversation,
  getConversationMessages,
  getConversations,
  updateConversation,
} from "./conversation.controller";

export const conversationRouter = Router();

conversationRouter.use(requiresAuth);

conversationRouter.get("/", getConversations);
conversationRouter.post("/", createConversation);

conversationRouter.get("/:id/messages", getConversationMessages);

conversationRouter.patch("/:id", updateConversation);
conversationRouter.delete("/:id", deleteConversation);
