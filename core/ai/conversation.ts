import { prisma } from "../../lib/prisma";

export type Message = { role: "user" | "assistant"; content: string };

export async function loadHistory(externalId: string): Promise<Message[]> {
  const conv = await prisma.conversation.findUnique({ where: { externalId } });
  if (!conv?.messages) return [];
  const msgs = conv.messages as Message[];
  return Array.isArray(msgs) ? msgs : [];
}

export async function saveHistory(externalId: string, messages: Message[], businessId?: string) {
  await prisma.conversation.upsert({
    where: { externalId },
    update: { messages },
    create: { externalId, messages, businessId },
  });
}
