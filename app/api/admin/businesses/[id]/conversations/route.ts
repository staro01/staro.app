import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../../../lib/prisma";
import { isAdminEmail } from "../../../../../../lib/admin";
import { decryptJson, isEncryptedPayload } from "../../../../../../core/crypto/conversationCrypto";
import { logAudit } from "../../../../../../core/audit/log";
import type { Message } from "../../../../../../core/ai/conversation";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return isAdminEmail(email);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || !isAdminEmail(user.primaryEmailAddress?.emailAddress ?? "")) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  const conversations = await prisma.conversation.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const decrypted = conversations.map((c) => {
    let messages: Message[] = [];
    try {
      const stored = c.messages as unknown;
      if (isEncryptedPayload(stored)) {
        messages = decryptJson<Message[]>(stored);
      } else if (Array.isArray(stored)) {
        messages = stored as Message[];
      }
    } catch (err) {
      console.error(`Échec déchiffrement conversation ${c.id}:`, err);
    }
    return { id: c.id, createdAt: c.createdAt, messages };
  });

  // Trace l'accès aux transcriptions dans les logs d'audit — accès à des
  // données personnelles sensibles, doit rester tracable.
  await logAudit({
    actorId: user.id,
    actorEmail: user.primaryEmailAddress?.emailAddress,
    action: "business.view_transcripts",
    targetType: "business",
    targetId: id,
    businessId: id,
  });

  return Response.json(decrypted);
}
