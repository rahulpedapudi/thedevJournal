import { Router } from "express";
import { requiresAuth } from "../../middleware/require-auth";
import { searchController } from "./search.controller";

export const searchRouter = Router();
searchRouter.use(requiresAuth);

searchRouter.get("/", searchController);
