import { prisma } from "../../lib/prisma";
import { encryptJson, decryptJson, isEncryptedPayload } from "../crypto/conversationCrypto";

export type Message = { role: "user" | "assistant"; content: string };

export async function loadHistory(externalId: string): Promise<Message[]> {
  const conv = await prisma.conversation.findUnique({ where: { externalId } });
  if (!conv?.messages) return [];

  const stored = conv.messages as unknown;

  if (isEncryptedPayload(stored)) {
    try {
      const msgs = decryptJson<Message[]>(stored);
      return Array.isArray(msgs) ? msgs : [];
    } catch (err) {
      console.error(`Échec déchiffrement conversation ${externalId}:`, err);
      return [];
    }
  }

  // Rétrocompatibilité : anciennes conversations stockées en clair avant migration
  return Array.isArray(stored) ? (stored as Message[]) : [];
}

export async function saveHistory(externalId: string, messages: Message[], businessId?: string) {
  const encrypted = encryptJson(messages);
  await prisma.conversation.upsert({
    where: { externalId },
    update: { messages: encrypted },
    create: { externalId, messages: encrypted, businessId },
  });
}
