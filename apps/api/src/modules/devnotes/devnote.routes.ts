import { Router } from "express";

export const devNoteRoutes = Router();

devNoteRoutes.get("/");
devNoteRoutes.get("/:id");

devNoteRoutes.post("/");
devNoteRoutes.patch("/:id");

devNoteRoutes.delete("/:id");
