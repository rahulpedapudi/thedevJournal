import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import { getSettings, postSettings } from "./settings.controller";

export const settingsRoutes = Router();
settingsRoutes.use(requiresAuth);

settingsRoutes.get("/", getSettings);
settingsRoutes.post("/", postSettings);
