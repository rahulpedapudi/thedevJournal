import { sql } from "drizzle-orm";
import { user } from "./auth-schema";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userKeys = pgTable("user_keys", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  provider: text("provider").notNull(),

  encryptedKey: text("encrypted_key").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
