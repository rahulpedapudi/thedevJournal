import { sql } from "drizzle-orm";
import { pgTable, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  title: text("title").default("Untitled").notNull(),

  // to indicate the scope of the conversation
  // workspace - global chat, note - note specific chat

  type: text("type", { enum: ["workspace", "note"] }).default("workspace"),

  isDeleted: boolean("is_deleted").default(false).notNull(),

  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
