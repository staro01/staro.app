import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getBusiness() {
  const user = await currentUser();
  if (!user) return null;
  return prisma.business.findFirst({ where: { clerkUserId: user.id } });
}

export async function GET() {
  const business = await getBusiness();
  if (!business) return Response.json([], { status: 200 });
  const items = await prisma.supplement.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.supplement.create({
    data: { businessId: business.id, name: body.name, price: body.price ?? 0, available: body.available ?? true },
  });
  return Response.json(item);
}
