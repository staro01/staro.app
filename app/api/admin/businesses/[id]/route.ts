import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { isAdminEmail } from "../../../../../lib/admin";
import { logAudit } from "../../../../../core/audit/log";
import { sendWelcomeEmail } from "../../../../../core/email/notify";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return isAdminEmail(email);
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

  const user = await currentUser();
  await logAudit({
    actorId: user?.id,
    actorEmail: user?.primaryEmailAddress?.emailAddress,
    action: "business.delete",
    targetType: "business",
    targetId: id,
  });

  await prisma.business.delete({ where: { id } });
  return Response.json({ ok: true });
}
