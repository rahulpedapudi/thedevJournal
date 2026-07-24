import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const masterKey = process.env.MASTER_ENCRYPTION_KEY;

if (!masterKey) {
  throw new Error("MASTER_ENCRYPTION_KEY is missing");
}

const key = Buffer.from(masterKey, "hex");

if (key.length !== 32) {
  throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(payload: string): string {
  const [iv, tag, encrypted] = payload.split(":");

  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted payload");
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
