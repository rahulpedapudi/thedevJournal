import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { devNote } from "../../db/schemas";
import type { PatchNoteBody } from "./devnotes.types";
import { de } from "zod/v4/locales";

// TODO: I should probably only return which is necessary instead of whole raw content for every each note.
export async function getUserDevNotes(userId: string) {
  const notes = await db.query.devNote.findMany({
    where: eq(devNote.userId, userId),
  });
  return notes;
}

// returns only single dev note with all the fields
export async function getUserDevNote(userId: string, devNoteId: string) {
  const note = await db.query.devNote.findFirst({
    where: and(eq(devNote.userId, userId), eq(devNote.id, devNoteId)),
  });
  return note;
}

// when the user is creating a new note, i should return the ID of the note, and the client adds the params, (note/:id) so i can send patch requests once the id is present.
export async function createUserDevNote(
  userId: string,
  title: string,
  rawContent: string,
) {
  const newNote = await db
    .insert(devNote)
    .values({
      userId: userId,
      title: title,
      rawContent: rawContent,
    })
    .returning();

  return newNote;
}

export async function patchNote(
  userId: string,
  noteId: string,
  body: PatchNoteBody,
) {
  const patched = await db
    .update(devNote)
    .set(body)
    .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
    .returning();

  if (patched.length === 0) {
    throw "id not found";
  }

  return patched;
}

export async function deleteNote(userId: string, noteId: string) {
  const deleted = await db
    .delete(devNote)
    .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
    .returning();

  if (deleted.length === 0) {
    throw "id not found";
  }

  return deleted;
}

