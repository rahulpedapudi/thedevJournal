import { db } from "../../db/db";
import { conversations, devNote } from "../../db/schemas";
import { messages } from "../../db/schemas";
import { and, asc, eq } from "drizzle-orm";
import { AppError } from "../../lib/app-error";

export async function getUserConversations(userId: string) {
  const userConversations = await db.query.conversations.findMany({
    where: and(
      eq(conversations.userId, userId),
      eq(conversations.isDeleted, false),
    ),
  });

  return userConversations;
}

export async function getUserConversationMessages(
  userId: string,
  conversationId: string,
  // if this service is used for getting message history for llm, use messsagesAsContext = true
  messagesAsContext?: boolean,
) {
  const userMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.userId, userId),
      eq(messages.conversationId, conversationId),
    ),
    orderBy: asc(messages.createdAt),
  });

  // for now, we're limiting the number of messages to 10
  if (userMessages && messagesAsContext) {
    return userMessages.slice(-10);
  }

  return userMessages;
}

export async function createUserConversation(
  userId: string,
  noteId: string | undefined,
) {
  const createdConvo = await db
    .insert(conversations)
    .values({
      userId,
    })
    .returning();

  // setting convId for a note if provided, else consider this as a global chat
  if (noteId) {
    await db
      .update(devNote)
      .set({
        conversationId: createdConvo[0]?.id,
      })
      .where(and(eq(devNote.userId, userId), eq(devNote.id, noteId)));
  }

  return createdConvo;
}

export async function patchUserConversation(
  userId: string,
  conversationId: string,
  title?: string,
) {
  const patched = await db
    .update(conversations)
    .set({ title })
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.id, conversationId),
      ),
    )
    .returning();

  if (patched.length === 0) {
    throw new AppError(404, "not found");
  }

  return patched;
}

export async function deleteUserConversation(
  userId: string,
  conversationId: string,
  permanent = false,
) {
  // hard delete - perma delete from db
  if (permanent) {
    const deleted = await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.id, conversationId),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      throw new AppError(404, "not found");
    }

    return deleted;
  }

  // soft delete
  const patched = await db
    .update(conversations)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.id, conversationId),
      ),
    )
    .returning();

  if (patched.length === 0) {
    throw new AppError(404, "not found");
  }

  return patched;
}
