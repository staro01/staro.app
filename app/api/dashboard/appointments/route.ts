import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getBusiness() {
  const user = await currentUser();
  if (!user) return null;
  return prisma.business.findFirst({ where: { clerkUserId: user.id } });
}

export async function GET(req: NextRequest) {
  const business = await getBusiness();
  if (!business) return Response.json([], { status: 200 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const staffId = searchParams.get("staffId");
  const history = searchParams.get("history") === "true";

  const where: any = { businessId: business.id };

  if (history) {
    // Historique : tous statuts confondus (y compris annulés), les 90 derniers jours par défaut
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    where.startAt = { gte: ninetyDaysAgo };
  } else {
    where.status = { not: "cancelled" };
    if (date) {
      const s = new Date(date);
      s.setHours(0, 0, 0, 0);
      const e = new Date(date);
      e.setHours(23, 59, 59, 999);
      where.startAt = { gte: s, lte: e };
    } else if (start && end) {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      where.startAt = { gte: s, lte: e };
    }
  }
  if (staffId) where.staffId = staffId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, staff: true },
    orderBy: { startAt: history ? "desc" : "asc" },
    take: history ? 200 : undefined,
  });
  return Response.json(appointments);
}

export async function POST(req: NextRequest) {
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      serviceId: body.serviceId ?? null,
      staffId: body.staffId ?? null,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      status: "confirmed",
      notes: body.notes ?? null,
      externalRef: body.externalRef ?? null,
    },
    include: { service: true, staff: true },
  });
  return Response.json(appointment);
}
