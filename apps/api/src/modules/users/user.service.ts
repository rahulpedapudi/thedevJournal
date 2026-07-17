import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { user } from "../../db/schemas/auth-schema";

export async function getUserProfile(userId: string) {
  const foundUser = await db.query.user.findFirst({
    where: eq(user?.id, userId),
  });

  if (!foundUser) {
    throw new Error("User not found");
  }

  return foundUser;
}