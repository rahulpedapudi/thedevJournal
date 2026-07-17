import { sql } from "drizzle-orm";
import { user } from "./auth-schema";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull().default("Untitled Project"),

  description: text("description"),

  status: text("status", {
    enum: ["active", "archived"],
  })
    .notNull()
    .default("active"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
