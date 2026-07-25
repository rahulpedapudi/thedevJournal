import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { devNote, entryRevision } from "../../db/schemas";
import type { PatchNoteBody } from "./devnotes.types";
import { getUserSettings } from "../settings/settings.service";
import { getUserKeyByProvider } from "../userkeys/userkeys.service";
import { getProvider } from "../../../lib/ai/factory";
import { logger } from "../../../lib/logger";
import { AppError } from "../../lib/app-error";

import { diff_match_patch } from "diff-match-patch";

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

export async function applyDiffPatch(
  userId: string,
  noteId: string,
  patchStr: string,
  baseRevision: number,
) {
  const note = await getUserDevNote(userId, noteId);

  if (!note) {
    throw new AppError(404, "Note not found", { noteId });
  }

  if (note.revision !== baseRevision) {
    throw new AppError(409, "Revision mismatch — reload and retry", {
      expected: baseRevision,
      actual: note.revision,
    });
  }

  const dmp = new diff_match_patch();
  const patches = dmp.patch_fromText(patchStr);
  const [newContent, results] = dmp.patch_apply(patches, note.rawContent ?? "");

  if (results.includes(false)) {
    throw new AppError(422, "Patch failed to apply cleanly", { noteId });
  }

  const patched = await db
    .update(devNote)
    .set({
      rawContent: newContent,
      revision: note.revision + 1,
    })
    .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
    .returning();

  await db.insert(entryRevision).values({
    userId: userId,
    patch: patchStr,
    revision: note.revision,
  });

  if (patched.length === 0) {
    throw new AppError(404, "Note not found after update", { noteId });
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

export async function generatePolishedContent(
  userId: string,
  noteType: string,
  title: string,
  rawContent: string,
): Promise<string> {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  logger.info(
    {
      noteType: noteType,
      title: title,
      userId: userId,
    },
    "Generating polished content prompt",
  );

  const settings = await getUserSettings(userId);

  if (!settings?.defaultProvider) {
    throw new Error("No default provider set");
  }

  const apiKey = await getUserKeyByProvider(userId, settings?.defaultProvider);

  if (!apiKey) {
    throw new Error("No API key found");
  }

  const client = await getProvider(settings?.defaultProvider, apiKey?.key);

  const content = await client.complete([
    {
      content: `You are a professional developer and technical writer. Please polish the following ${noteType} titled "${title}" written on ${dateStr}. Ensure that the content is clear, concise, and well-structured. Here is the content:\n\n${rawContent}`,
      role: "user",
    },
  ]);

  return content;
}
