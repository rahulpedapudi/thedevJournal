import { db } from "../../db/db";
import { userSettings } from "../../db/schemas/usersettings-schema";
import { eq } from "drizzle-orm";
import type { PostSettings } from "./settings.types";

export async function getUserSettings(userId: string) {
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });
  return settings;
}

export async function postUserSettings(
  userId: string,
  { defaultProvider, customInstructions }: PostSettings,
) {
  const postedSettings = await db
    .insert(userSettings)
    .values({
      userId: userId,
      defaultProvider: defaultProvider,
      customInstructions: customInstructions,
    })
    .returning();
  return postedSettings;
}
