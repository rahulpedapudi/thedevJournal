import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth-schema";
import { project } from "./project-schema";

export const devNote = pgTable("dev_note", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  projectId: text("project_id").references(() => project.id, {
    onDelete: "set null",
  }),

  title: text("title").default("Untitled"),

  rawContent: text("raw_content").notNull(),

  enrichedContent: text("enriched_content"),

  noteType: text("note_type", {
    enum: [
      "learning",
      "problem",
      "solution",
      "idea",
      "decision",
      "experiment",
      "question",
      "progress",
      "note",
    ],
  })
    .notNull()
    .default("note"),

  aiStatus: text("ai_status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
