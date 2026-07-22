import type { Request, Response } from "express";
import { getUserProfile } from "./user.service";
import { logger } from "../../../lib/logger";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.params.id as string;
  try {
    const user = await getUserProfile(userId);

    if (!user) {
      logger.warn({ userId }, "User profile not found");
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    logger.info({ userId }, "Retrieved user profile successfully");
    res.status(200).json(user);
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user profile");
    res.status(500).json({ message: "Internal server error" });
  }
}
