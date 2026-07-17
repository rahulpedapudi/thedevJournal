import type { Request, Response } from "express";
import { getUserProfile } from "./user.service";

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await getUserProfile(req.params.id as string);

    if (!user) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
