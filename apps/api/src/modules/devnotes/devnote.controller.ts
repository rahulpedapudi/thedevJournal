import type { Request, Response } from "express";
import { getUserDevNotes } from "./devnote.service";


export async function getDevNotes(req: Request, res: Response): Promise<void> {
  try {
    const notes = await getUserDevNotes(req.user?.id as string);

    res.status(200).json({
      success: "true",
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}
