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
  const staff = await prisma.staff.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });
  return Response.json(staff);
}

export async function POST(req: NextRequest) {
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const member = await prisma.staff.create({
    data: { businessId: business.id, name: body.name, available: body.available ?? true },
  });
  return Response.json(member);
}
