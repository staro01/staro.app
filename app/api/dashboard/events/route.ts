import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

async function getBusiness() {
  const user = await currentUser();
  if (!user) return null;
  return prisma.business.findFirst({ where: { clerkUserId: user.id } });
}

export async function GET() {
  const business = await getBusiness();
  if (!business) return Response.json([], { status: 200 });
  const events = await prisma.event.findMany({
    where: { businessId: business.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json(events);
}
