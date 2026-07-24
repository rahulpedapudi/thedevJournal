import { Router } from "express";
import { createProject, getProjects, patchProject } from "./project.controller";
import { requiresAuth } from "../../middleware/require-auth";

export const projectRoutes = Router();

projectRoutes.use(requiresAuth);

projectRoutes.get("/", getProjects);
projectRoutes.post("/", createProject);
projectRoutes.patch("/:id", patchProject);
// projectRoutes.delete("/:id");
