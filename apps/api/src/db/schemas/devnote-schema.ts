import {
  boolean,
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth-schema";
import { project } from "./project-schema";
import { conversations } from "./conversation-schema";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const devNote = pgTable(
  "dev_note",
  {
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

    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),

    title: text("title").default("Untitled"),

    revision: integer("revision").default(1).notNull(),

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

    // function that converts text into a searchable vector
    // Postgres automatically calculates and updates the vector.
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`to_tsvector('english', coalesce(title, '') || ' ' || coalesce(raw_content, '') || ' ' || coalesce(enriched_content, ''))`,
    ),

    isDeleted: boolean("is_deleted").default(false).notNull(),

    deletedAt: timestamp("deleted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // creating index to speed up search queries
    index("notes_search_idx").using("gin", table.searchVector), // gin -> Generalized Inverted Index (standard for fts)
    index("notes_user_idx").on(table.userId),
  ],
);
