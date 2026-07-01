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
  
  const where: any = { businessId: business.id, status: { not: "cancelled" } };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.startAt = { gte: start, lte: end };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, staff: true },
    orderBy: { startAt: "asc" },
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
