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

// returns all the user dev notes (which are not deleted).
export async function getUserDevNotes(userId: string) {
  const notes = await db.query.devNote.findMany({
    where: and(eq(devNote.userId, userId), eq(devNote.isDeleted, false)),
    columns: {
      // not including enrichedContent cuz its not needed in the home page
      enrichedContent: false,
    },
  });
  return notes;
}

// returns user's trash notes
export async function getUserTrashNotes(userId: string) {
  const notes = await db.query.devNote.findMany({
    // querying db where devNote.isDeleted is true
    where: and(eq(devNote.userId, userId), eq(devNote.isDeleted, true)),
    columns: {
      enrichedContent: false,
    },
  });
  return notes;
}

// returns only single dev note with all the fields - detailed note view
export async function getUserDevNote(userId: string, devNoteId: string) {
  const note = await db.query.devNote.findFirst({
    where: and(
      eq(devNote.userId, userId),
      eq(devNote.isDeleted, false),
      eq(devNote.id, devNoteId),
    ),
  });
  return note;
}

// creates a devnote with default title as "Untitled"
export async function createUserDevNote(
  userId: string,
  title: string,
  rawContent: string,
) {
  // ! this creates a empty note in db, which i should probably fix
  // TODO: if the note is empty then dont create it in the db.
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

// patch function for editing note's metadata. not the actual note content.
// ! STRICLY USE THIS FOR EDITING METADATA ONLY : TITLE, DATE etc.
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
    throw new AppError(404, "id not found", { noteId });
  }

  return patched;
}

// diff-match-patch function to edit the actual note content.
export async function applyDiffPatch(
  userId: string,
  noteId: string,
  patchStr: string,
  baseRevision: number,
) {
  // getting the note entry.
  const note = await getUserDevNote(userId, noteId);

  if (!note) {
    throw new AppError(404, "Note not found", { noteId });
  }

  // the revision should match for editing. baseRevision is sent by the client.
  if (note.revision !== baseRevision) {
    throw new AppError(409, "Revision mismatch — reload and retry", {
      expected: baseRevision,
      actual: note.revision,
    });
  }

  // create diff_match_patch instance
  const dmp = new diff_match_patch();

  // creating the patches from the patchStr which was sent by the client.
  const patches = dmp.patch_fromText(patchStr);

  // applying the patches to the rawContent of the note.
  const [newContent, results] = dmp.patch_apply(patches, note.rawContent ?? "");

  // checking if patch was applied cleanly. if not, throw error.
  if (results.includes(false)) {
    throw new AppError(422, "Patch failed to apply cleanly", { noteId });
  }

  // updating note with newContent and new revision.
  const patched = await db
    .update(devNote)
    .set({
      rawContent: newContent,
      // revision is bumped on every successful patch
      revision: note.revision + 1,
    })
    .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
    .returning();

  // adding the patch to entryRevision for historical purposes.
  await db.insert(entryRevision).values({
    noteId: noteId,
    userId: userId,
    patch: patchStr,
    revision: note.revision,
  });

  if (patched.length === 0) {
    throw new AppError(404, "Note not found after update", { noteId });
  }

  return patched;
}

// delete note function
export async function deleteNote(
  userId: string,
  noteId: string,
  permanent = false, // if true then hard delete else soft delete
) {
  if (permanent) {
    // hard delete (deletes the entry from the database).
    const deleted = await db
      .delete(devNote)
      .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
      .returning();

    if (deleted.length === 0) {
      throw "id not found";
    }
    return deleted;
  }

  // soft delete (marks the note as deleted in the database).
  const deleted = await db
    .update(devNote)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)))
    .returning();

  if (deleted.length === 0) {
    throw "id not found";
  }

  return deleted;
}

// for permanently deleting all the notes in the trash.
export async function emptyTrashNotes(userId: string) {
  //! HARD DELETE
  const deleted = await db
    .delete(devNote)
    .where(and(eq(devNote.userId, userId), eq(devNote.isDeleted, true)))
    .returning();

  return deleted;
}

// generates polished content using LLM
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

  // getting user settings for knowing what llm provider to use.
  const settings = await getUserSettings(userId);

  if (!settings?.defaultProvider) {
    throw new AppError(404, "No default provider set");
  }

  // getting apiKey for that provider
  const apiKey = await getUserKeyByProvider(userId, settings?.defaultProvider);

  if (!apiKey) {
    throw new Error("No API key found");
  }

  // creating client for the provider.
  const client = await getProvider(settings?.defaultProvider, apiKey?.key);

  // plain llm call to just create polished content
  // TODO: I should do this better
  const content = await client.complete([
    {
      content: `You are a professional developer and technical writer. Please polish the following ${noteType} titled "${title}" written on ${dateStr}. Ensure that the content is clear, concise, and well-structured. Here is the content:\n\n${rawContent}`,
      role: "user",
    },
  ]);

  return content;
}
