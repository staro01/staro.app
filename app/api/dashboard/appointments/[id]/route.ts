import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { NextRequest } from "next/server";
import { logAudit } from "../../../../../core/audit/log";

export const dynamic = "force-dynamic";

async function getBusiness() {
  const user = await currentUser();
  if (!user) return null;
  return prisma.business.findFirst({ where: { clerkUserId: user.id } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const existing = await prisma.appointment.findFirst({ where: { id, businessId: business.id } });
  if (!existing) return Response.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json();
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: body.status,
      notes: body.notes,
      staffId: body.staffId,
      startAt: body.startAt ? new Date(body.startAt) : undefined,
      endAt: body.endAt ? new Date(body.endAt) : undefined,
    },
    include: { service: true, staff: true },
  });

  const user = await currentUser();
  await logAudit({
    actorId: user?.id,
    actorEmail: user?.primaryEmailAddress?.emailAddress,
    action: "appointment.update",
    targetType: "appointment",
    targetId: id,
    businessId: business.id,
    metadata: { changes: body },
  });

  return Response.json(appointment);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const existing = await prisma.appointment.findFirst({ where: { id, businessId: business.id } });
  if (!existing) return Response.json({ error: "Introuvable" }, { status: 404 });

  await prisma.appointment.update({ where: { id }, data: { status: "cancelled" } });

  const user = await currentUser();
  await logAudit({
    actorId: user?.id,
    actorEmail: user?.primaryEmailAddress?.emailAddress,
    action: "appointment.cancel",
    targetType: "appointment",
    targetId: id,
    businessId: business.id,
  });

  return Response.json({ ok: true });
}
