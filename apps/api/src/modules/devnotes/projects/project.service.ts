import { eq } from "drizzle-orm";
import { db } from "../../../db/db";
import { project } from "../../../db/schemas/project-schema";

type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
};

export async function getUserProjects(userId: string) {
  const userProjects = await db.query.project.findMany({
    where: eq(project.userId, userId),
  });

  return userProjects;
}

export async function createUserProject(data: CreateProjectInput) {
  const [newProject] = await db
    .insert(project)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description,
      status: "active",
    })
    .returning();

  return newProject;
}
