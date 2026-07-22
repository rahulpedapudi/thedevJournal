import type { Request, Response } from "express";
import { createUserProject, getUserProjects } from "./project.service";
import type { CreateProjectBody } from "./project.types";

import { logger } from "../../../../lib/logger";

export async function getProjects(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id as string;
  try {
    const projects = await getUserProjects(userId);

    if (!projects) {
      logger.warn({ userId }, "No projects found for user");
      res.status(404).json({
        message: "No Projects Found",
      });
      return;
    }

    logger.info(
      { userId, count: projects.length },
      "Retrieved user projects successfully",
    );

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user projects");
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function createProject(
  req: Request<{}, {}, CreateProjectBody>,
  res: Response,
): Promise<void> {
  const { name, description } = req.body;
  const { id: userId } = req.user!;

  try {
    logger.info(
      {
        userId,
        projectName: name,
      },
      "Creating project",
    );

    const newProject = await createUserProject({
      userId,
      name,
      description,
    });

    logger.info(
      {
        userId,
        projectId: newProject?.id,
        projectName: name,
      },
      "Project created successfully",
    );

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    logger.error(
      { error, userId, projectName: name },
      "Failed to create project",
    );
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
