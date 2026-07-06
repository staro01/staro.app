import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { isAdminEmail } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return isAdminEmail(email);
}

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { business: { select: { name: true } } },
  });

  return Response.json(logs);
}
