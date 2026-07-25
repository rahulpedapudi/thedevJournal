import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { sql } from "drizzle-orm";

export const entryRevision = pgTable("entry_revision", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  patch: text("patch").notNull(),

  revision: integer("revision").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
