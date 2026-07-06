import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { isAdminEmail } from "../../../../../lib/admin";
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
  return Response.json(business);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await prisma.business.delete({ where: { id } });
  return Response.json({ ok: true });
}
