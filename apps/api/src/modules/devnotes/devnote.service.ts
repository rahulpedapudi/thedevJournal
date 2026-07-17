import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { devNote } from "../../db/schemas";

export async function getUserDevNotes(userId: string) {
  const notes = await db.query.devNote.findMany({
    where: eq(devNote.id, userId),
  });
  return notes;
}
