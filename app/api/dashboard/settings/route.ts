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
  if (!business) return Response.json(null, { status: 404 });
  return Response.json(business);
}

export async function PATCH(req: NextRequest) {
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      name: body.name,
      phone: body.phone,
      address: body.address,
      estimatedPrepTime: body.estimatedPrepTime,
      deliveryEnabled: body.deliveryEnabled,
      deliveryFee: body.deliveryFee,
      deliveryMinimum: body.deliveryMinimum,
      paymentMethods: body.paymentMethods,
      vacationMode: body.vacationMode,
      vacationMessage: body.vacationMessage,
      allergensInfo: body.allergensInfo,
      currentPromos: body.currentPromos,
      welcomeMessage: body.welcomeMessage,
      openingHours: body.openingHours,
    },
  });
  return Response.json(updated);
}
