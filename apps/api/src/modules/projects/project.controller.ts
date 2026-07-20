import type { Request, Response } from "express";
import { createUserProject, getUserProjects } from "./project.service";
import type { CreateProjectBody } from "./project.types";

import { logger } from "../../../lib/logger";

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const projects = await getUserProjects(req.user?.id as string);

    if (!projects) {
      res.status(404).json({
        message: "No Projects Found",
      });
    }

    res.status(200).json({
      success: "true",
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function createProject(
  req: Request<{}, {}, CreateProjectBody>,
  res: Response,
): Promise<void> {
  try {
    const { name, description } = req.body;
    const { id } = req.user!;

    logger.info(
      {
        userId: req.user!.id,
        projectName: name,
      },
      "Creating project",
    );

    const newProject = await createUserProject({
      userId: id,
      name: name,
      description: description,
    });

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error ${error}`,
    });
  }
}
