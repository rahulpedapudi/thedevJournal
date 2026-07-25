import { eq, and } from "drizzle-orm";
import { db } from "../../db/db";
import { secretService } from "../../../lib/crypto/secret.service";
import { userKeys } from "../../db/schemas";

export async function createUserKey(
  userId: string,
  provider: string,
  key: string,
) {
  const encrypted_key = secretService.encryptSecret(key);

  const existingKey = await db.query.userKeys.findFirst({
    where: and(eq(userKeys.userId, userId), eq(userKeys.provider, provider)),
  });

  if (existingKey) {
    const updatedKey = await db
      .update(userKeys)
      .set({
        encryptedKey: encrypted_key,
      })
      .where(eq(userKeys.id, existingKey.id))
      .returning();

    return updatedKey[0];
  }

  const createdKey = await db
    .insert(userKeys)
    .values({
      userId,
      provider,
      encryptedKey: encrypted_key,
    })
    .returning();

  return createdKey[0];
}

export async function getUserKeys(userId: string) {
  const keys = await db
    .select()
    .from(userKeys)
    .where(eq(userKeys.userId, userId));

  const decryptedKeys = keys.map((key) => {
    return {
      id: key.id,
      userId: key.userId,
      provider: key.provider,
      key: secretService.decryptSecret(key.encryptedKey),
      //   key: key.encryptedKey,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    };
  });

  return decryptedKeys;
}

export async function getUserKeyByProvider(userId: string, provider: string) {
  const key = await db.query.userKeys.findFirst({
    where: and(eq(userKeys.userId, userId), eq(userKeys.provider, provider)),
  });

  if (!key) {
    return null;
  }

  return {
    provider: key.provider,
    key: secretService.decryptSecret(key.encryptedKey),
  };
}
