import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { isAdminEmail } from "../../../../../lib/admin";
import { logAudit } from "../../../../../core/audit/log";
import { sendWelcomeEmail } from "../../../../../core/email/notify";
import { releaseTwilioNumber } from "../../../../../core/twilio/provision";
import { notifyCriticalError } from "../../../../../core/monitoring/notifyError";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return isAdminEmail(email);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 30 },
      conversations: { orderBy: { createdAt: "desc" }, take: 50, select: { id: true, createdAt: true, externalId: true } },
      appointments: { select: { externalRef: true } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { menuItems: true, events: true, conversations: true } },
    },
  });

  if (!business) return Response.json({ error: "Introuvable" }, { status: 404 });

  // Un appel est considéré "abouti" s'il a produit un Event (rapport/commande)
  // ou un Appointment (RDV coiffeur). Sinon : raccroché en cours, IA en boucle, etc.
  const eventRefs = new Set(business.events.map((e) => e.externalRef).filter(Boolean));
  const appointmentRefs = new Set(business.appointments.map((a) => a.externalRef).filter(Boolean));

  const abandonedCalls = business.conversations.filter(
    (c) => c.externalId && !eventRefs.has(c.externalId) && !appointmentRefs.has(c.externalId)
  );

  return Response.json({
    ...business,
    conversations: business.conversations.slice(0, 20),
    abandonedCallsCount: abandonedCalls.length,
    abandonedCallIds: abandonedCalls.map((c) => c.id),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const previous = await prisma.business.findUnique({ where: { id } });

  const business = await prisma.business.update({
    where: { id },
    data: {
      name: body.name,
      vertical: body.vertical,
      twilioNumber: body.twilioNumber,
      phone: body.phone,
      address: body.address,
      status: body.status,
    },
  });

  const justApproved = body.status === "approved" && previous?.status !== "approved";
  if (justApproved && business.clerkUserId) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(business.clerkUserId);
      const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      if (email) {
        await sendWelcomeEmail(email, business.name);
      }
    } catch (err) {
      console.error("Échec envoi email de bienvenue:", err);
    }
  }

  const user = await currentUser();
  await logAudit({
    actorId: user?.id,
    actorEmail: user?.primaryEmailAddress?.emailAddress,
    action: body.status === "approved" ? "business.approve" : "business.update",
    targetType: "business",
    targetId: id,
    businessId: id,
    metadata: { changes: body },
  });

  return Response.json(business);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const business = await prisma.business.findUnique({ where: { id } });

  // Libère le numéro Twilio AVANT suppression pour ne pas continuer à le payer
  // indéfiniment une fois le business supprimé de la base.
  if (business?.twilioNumber) {
    try {
      await releaseTwilioNumber(business.twilioNumber);
    } catch (err) {
      await notifyCriticalError("Libération numéro Twilio lors d'une suppression admin", err);
    }
  }

  const user = await currentUser();
  await logAudit({
    actorId: user?.id,
    actorEmail: user?.primaryEmailAddress?.emailAddress,
    action: "business.delete",
    targetType: "business",
    targetId: id,
    metadata: { twilioNumberReleased: business?.twilioNumber ?? null },
  });

  await prisma.business.delete({ where: { id } });
  return Response.json({ ok: true });
}
