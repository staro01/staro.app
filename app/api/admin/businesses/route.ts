import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { isAdminEmail } from "../../../../lib/admin";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return isAdminEmail(email);
}

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true, events: true } },
      conversations: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  const enriched = businesses.map((b) => ({
    ...b,
    lastActivityAt: b.conversations[0]?.createdAt ?? null,
    conversations: undefined,
  }));

  return Response.json(enriched);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const business = await prisma.business.create({
    data: {
      name: body.name,
      vertical: body.vertical ?? "pizzeria",
      twilioNumber: body.twilioNumber ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
    },
  });
  return Response.json(business);
}
