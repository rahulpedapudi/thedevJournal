import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import { chatController } from "./chat.controller";

export const chatRouter = Router();
chatRouter.use(requiresAuth);

chatRouter.post("/", chatController);
