import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import { createKey, getKeyByProvider, getKeys } from "./userkeys.controller";

export const userkeysRoutes = Router();
userkeysRoutes.use(requiresAuth);

userkeysRoutes.get("/", getKeys);
userkeysRoutes.get("/:provider", getKeyByProvider);

userkeysRoutes.post("/", createKey);
