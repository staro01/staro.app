import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { isOutsideHours, DaySchedule } from "../../../../core/openingHours";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json(null, { status: 401 });

  const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
  if (!business) return Response.json(null, { status: 404 });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const conversations = await prisma.conversation.findMany({
    where: { businessId: business.id, createdAt: { gte: startOfMonth } },
    select: { createdAt: true },
  });

  const openingHours = (business.openingHours as Record<string, DaySchedule> | null) ?? null;
  const outsideHoursCount = conversations.filter((c) => isOutsideHours(c.createdAt, openingHours)).length;

  return Response.json({
    totalCallsThisMonth: conversations.length,
    outsideHoursCount,
  });
}
