import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getUser() {
  return await currentUser();
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json(null, { status: 404 });
  const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
  if (!business) return Response.json(null, { status: 404 });
  return Response.json(business);
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();

  const business = await prisma.business.upsert({
    where: { clerkUserId: user.id },
    update: {
      name: body.name,
      vertical: body.vertical,
      phone: body.phone,
      address: body.address,
      estimatedPrepTime: body.estimatedPrepTime,
      deliveryEnabled: body.deliveryEnabled,
      deliveryFee: body.deliveryFee,
      deliveryMinimum: body.deliveryMinimum,
      paymentMethods: body.paymentMethods,
      vacationMode: body.vacationMode,
      vacationMessage: body.vacationMessage,
      ringFirst: body.ringFirst,
      reportChannel: body.reportChannel,
      allergensInfo: body.allergensInfo,
      currentPromos: body.currentPromos,
      welcomeMessage: body.welcomeMessage,
      openingHours: body.openingHours,
      customerEmail: body.customerEmail,
    },
    create: {
      clerkUserId: user.id,
      vertical: body.vertical || "pizzeria",
      name: body.name ?? "Mon établissement",
      phone: body.phone,
      address: body.address,
      customerEmail: body.customerEmail,
    },
  });

  return Response.json(business);
}
