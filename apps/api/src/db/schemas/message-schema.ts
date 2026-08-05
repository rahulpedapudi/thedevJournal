import { sql } from "drizzle-orm";
import { pgTable, timestamp, text, boolean, index } from "drizzle-orm/pg-core";
import { conversations } from "./conversation-schema";
import { user } from "./auth-schema";

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),

    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    conversationId: text("conversation_id")
      .references(() => conversations.id, {
        onDelete: "cascade",
      })
      .notNull(),

    role: text("role", {
      enum: ["user", "assistant", "tool", "system"],
    }).notNull(),

    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("message_conversation_idx").on(table.conversationId)],
);
