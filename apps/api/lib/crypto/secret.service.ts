import { encrypt, decrypt } from "./crypto";

export class SecretService {
  encryptSecret(secret: string) {
    return encrypt(secret);
  }

  decryptSecret(secret: string) {
    return decrypt(secret);
  }
}

export const secretService = new SecretService();
