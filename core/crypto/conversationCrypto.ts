import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommandé pour GCM

function getKey(): Buffer {
  const b64 = process.env.CONVERSATION_ENCRYPTION_KEY;
  if (!b64) {
    throw new Error("CONVERSATION_ENCRYPTION_KEY non configurée.");
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("CONVERSATION_ENCRYPTION_KEY doit faire 32 octets (clé AES-256) une fois décodée.");
  }
  return key;
}

export type EncryptedPayload = {
  enc: true;
  iv: string;
  authTag: string;
  data: string;
};

export function encryptJson(value: unknown): EncryptedPayload {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    enc: true,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export function decryptJson<T = unknown>(payload: EncryptedPayload): T {
  const key = getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const encrypted = Buffer.from(payload.data, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return JSON.parse(decrypted.toString("utf8"));
}

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).enc === true &&
    typeof (value as any).iv === "string" &&
    typeof (value as any).authTag === "string" &&
    typeof (value as any).data === "string"
  );
}
