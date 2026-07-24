import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { project } from "../../db/schemas/project-schema";
import type { PatchProjectBody } from "./project.types";

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

export async function patchUserProject(
  userId: string,
  projectId: string,
  data: PatchProjectBody,
) {
  const patched = await db
    .update(project)
    .set(data)
    .where(and(eq(project.userId, userId), eq(project.id, projectId)))
    .returning();

  if (patched.length === 0) {
    throw "Project not found";
  }

  return patched;
}

// TODO: Implement soft-delete
export async function deleteUserProject(userId: string, projectId: string) {
  const deleted = await db
    .delete(project)
    .where(and(eq(project.userId, userId), eq(project.id, projectId)))
    .returning();

  if (deleted.length === 0) {
    throw "Project not found";
  }

  return deleted;
}
