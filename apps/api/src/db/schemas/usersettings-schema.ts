import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { sql } from "drizzle-orm";

export const userSettings = pgTable("user_settings", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  defaultProvider: text("default_provider", {
    enum: ["openrouter", "gemini", "groq"],
  }),

  customInstructions: varchar("custom_instructions", { length: 450 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
