import { Router } from "express";
import { createProject, getProjects } from "./project.controller";
import { requiresAuth } from "../../../middleware/require-auth";

export const projectRoutes = Router();

projectRoutes.use(requiresAuth);

projectRoutes.get("/", getProjects);

projectRoutes.post("/", createProject);
