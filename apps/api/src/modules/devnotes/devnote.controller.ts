import type { Request, Response, NextFunction } from "express";
import {
  createUserDevNote,
  getUserDevNote,
  getUserDevNotes,
  patchNote,
  deleteNote,
  generatePolishedContent,
  applyDiffPatch,
  getUserTrashNotes,
  emptyTrashNotes,
} from "./devnote.service";
import type {
  CreateDevNoteBody,
  PatchNoteBody,
  DevNoteParams,
  ApplyPatchBody,
} from "./devnotes.types";

import { logger } from "../../../lib/logger";


export async function getDevNotes(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id as string;
  try {
    const notes = await getUserDevNotes(userId);

    logger.info(
      { userId, count: notes?.length || 0 },
      "Retrieved user devnotes",
    );

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    logger.error({ error, userId }, "Failed to retrieve user devnotes");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getDevNoteByID(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  const devNoteId = req.params.id;
  const userId = req.user!.id;
  try {
    const note = await getUserDevNote(userId, devNoteId);

    if (!note) {
      logger.warn({ userId, devNoteId }, "Devnote not found");
      res.status(404).json({
        message: "Note not found",
      });
      return;
    }

    logger.info({ userId, devNoteId }, "Retrieved devnote by ID");

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    logger.error({ error, userId, devNoteId }, "Failed to get devnote by ID");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getTrashNotes(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user?.id as string;
  try {
    const notes = await getUserTrashNotes(userId);

    logger.info(
      { userId, count: notes?.length || 0 },
      "Retrieved user trash devnotes",
    );

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    logger.error({ error, userId }, "Failed to retrieve user trash devnotes");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function createDevNote(
  req: Request<{}, {}, CreateDevNoteBody>,
  res: Response,
) {
  const { title, rawContent } = req.body;
  const userId = req.user!.id;

  try {
    const note = await createUserDevNote(userId, title, rawContent);

    logger.info(
      { userId, noteId: note?.[0]?.id, title },
      "Created devnote successfully",
    );

    res.status(201).json({
      success: true,
      data: note?.[0] ?? note,
    });
  } catch (error) {
    logger.error({ error, userId, title }, "Failed to create devnote");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function patchDevNote(
  req: Request<DevNoteParams, {}, PatchNoteBody>,
  res: Response,
): Promise<void> {
  const noteId = req.params.id;
  const userId = req.user!.id;
  const data = req.body;

  try {
    logger.info(
      {
        noteId: noteId,
        userId: userId,
        fieldsToUpdate: Object.keys(data),
      },
      "Patching note",
    );

    const updateData: PatchNoteBody = {
      ...data,
      deletedAt: data.deletedAt
        ? new Date(data.deletedAt)
        : data.deletedAt === null
          ? null
          : undefined,
    };

    const note = await patchNote(userId, noteId, updateData);

    logger.info({ noteId, userId }, "Patched note successfully");

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    logger.error({ error, userId, noteId }, "Failed to patch note");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function applyDiffPatchController(
  req: Request<DevNoteParams, {}, ApplyPatchBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const noteId = req.params.id;
  const userId = req.user!.id;
  const { patchStr, baseRevision } = req.body;

  try {
    logger.info(
      { noteId, userId, baseRevision },
      "Applying diff patch to note",
    );

    const note = await applyDiffPatch(userId, noteId, patchStr, baseRevision);

    logger.info({ noteId, userId }, "Diff patch applied successfully");

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDevNote(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  const devNoteId = req.params.id;
  const userId = req.user!.id;
  const isPermanent = req.query.permanent === "true";

  try {
    await deleteNote(userId, devNoteId, isPermanent);

    logger.info(
      { devNoteId, userId, isPermanent },
      isPermanent ? "Permanently deleted note" : "Soft deleted note",
    );

    res.status(200).json({
      success: true,
      message: isPermanent ? "Note permanently deleted" : "Note moved to trash",
    });
  } catch (error) {
    logger.error({ error, userId, devNoteId }, "Failed to delete note");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function emptyTrashNotesController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;

  try {
    const deleted = await emptyTrashNotes(userId);

    logger.info(
      { userId, count: deleted.length },
      "Emptied trash successfully",
    );

    res.status(200).json({
      success: true,
      message: "Trash emptied successfully",
      count: deleted.length,
    });
  } catch (error) {
    logger.error({ error, userId }, "Failed to empty trash");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function polishDevNote(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  const devNoteId = req.params.id;
  const userId = req.user!.id;

  try {
    // Fetch the note
    const note = await getUserDevNote(userId, devNoteId);
    if (!note) {
      logger.warn({ userId, devNoteId }, "Devnote not found for polishing");
      res.status(404).json({
        message: "Note not found",
      });
      return;
    }

    // Set status to processing
    await patchNote(userId, devNoteId, { aiStatus: "processing" });

    logger.info(
      {
        noteId: devNoteId,
        userId: userId,
      },
      "Generating polished content",
    );

    // Generate polished content
    const enrichedContent = await generatePolishedContent(
      userId,
      note.noteType || "note",
      note.title || "Untitled",
      note.rawContent || "",
    );

    logger.info(
      {
        noteId: devNoteId,
        userId: userId,
        contentLength: enrichedContent.length,
      },
      "Generated polished content.. Saving note",
    );

    // Save notes
    const updated = await patchNote(userId, devNoteId, {
      aiStatus: "completed",
      enrichedContent: enrichedContent,
    });

    res.status(200).json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    logger.error({ error, userId, devNoteId }, "Failed to polish devnote");

    // Attempt to set status to failed
    try {
      await patchNote(userId, devNoteId, { aiStatus: "failed" });
    } catch (patchErr) {
      logger.error(
        { patchErr, userId, devNoteId },
        "Failed to mark note as failed after polish error",
      );
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
