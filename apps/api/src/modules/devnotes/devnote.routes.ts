import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import {
  createDevNote,
  getDevNoteByID,
  getDevNotes,
  patchDevNote,
  deleteDevNote,
  polishDevNote,
  applyDiffPatchController,
  getTrashNotes,
  emptyTrashNotesController,
} from "./devnote.controller";

export const devNoteRoutes = Router();

devNoteRoutes.use(requiresAuth);

devNoteRoutes.get("/", getDevNotes);
devNoteRoutes.get("/trash", getTrashNotes);
devNoteRoutes.get("/:id", getDevNoteByID);

devNoteRoutes.post("/", createDevNote);
devNoteRoutes.patch("/:id", patchDevNote);
devNoteRoutes.patch("/:id/patch", applyDiffPatchController);

devNoteRoutes.delete("/trash", emptyTrashNotesController);
devNoteRoutes.delete("/:id", deleteDevNote);

devNoteRoutes.post("/:id/polish", polishDevNote);
