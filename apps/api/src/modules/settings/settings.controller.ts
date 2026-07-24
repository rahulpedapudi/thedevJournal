import type { Request, Response } from "express";
import { getUserSettings, postUserSettings } from "./settings.service";
import type { PostSettings } from "./settings.types";

export async function getSettings(req: Request, res: Response) {
  const userId = req.user!.id;

  try {
    const settings = await getUserSettings(userId);

    res.status(200).json({
      message: "Settings retrieved successfully",
      data: settings ?? [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function postSettings(
  req: Request<{}, {}, PostSettings>,
  res: Response,
) {
  const userId = req.user!.id;

  try {
    const settingsPosted = await postUserSettings(userId, req.body);

    res.status(201).json({
      message: "Settings retrieved successfully",
      data: settingsPosted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
}
