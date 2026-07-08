import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { isAdminEmail } from "../../../../lib/admin";
import { normPhone } from "../../../../core/twilio/incoming";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const user = await currentUser();
  return isAdminEmail(user?.primaryEmailAddress?.emailAddress);
}

type Slot = "commercial" | "interne";

function getSlotNumber(slot: Slot) {
  const envVar = slot === "commercial" ? process.env.DEMO_TWILIO_NUMBER : process.env.TEST_TWILIO_NUMBER;
  const n = normPhone(envVar);
  if (!n) throw new Error(`${slot === "commercial" ? "DEMO_TWILIO_NUMBER" : "TEST_TWILIO_NUMBER"} non configuré`);
  return n;
}

function parseSlot(value: string | null): Slot {
  return value === "interne" ? "interne" : "commercial";
}

const RESET_FIELDS = {
  welcomeMessage: null,
  vacationMode: false,
  vacationMessage: null,
  currentPromos: null,
  allergensInfo: null,
};

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) return Response.json({ error: "Non autorisé" }, { status: 403 });

  try {
    const slot = parseSlot(req.nextUrl.searchParams.get("slot"));
    const number = getSlotNumber(slot);
    const business = await prisma.business.findFirst({
      where: { twilioNumber: number },
      include: { menuItems: true, services: true },
    });
    return Response.json(business);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) return Response.json({ error: "Non autorisé" }, { status: 403 });

  try {
    const body = await req.json();
    const slot = parseSlot(body.slot ?? null);
    const number = getSlotNumber(slot);

    const business = await prisma.business.upsert({
      where: { twilioNumber: number },
      update: {
        name: body.name,
        vertical: body.vertical,
        phone: body.phone,
        address: body.address,
        openingHours: body.openingHours,
        customerEmail: body.customerEmail,
        status: "active",
        ...RESET_FIELDS,
      },
      create: {
        twilioNumber: number,
        name: body.name,
        vertical: body.vertical,
        phone: body.phone,
        address: body.address,
        openingHours: body.openingHours,
        customerEmail: body.customerEmail,
        status: "active",
        ...RESET_FIELDS,
      },
    });

    await prisma.menuItem.deleteMany({ where: { businessId: business.id } });
    await prisma.service.deleteMany({ where: { businessId: business.id } });

    if (body.vertical === "coiffeur" && Array.isArray(body.services)) {
      await prisma.service.createMany({
        data: body.services
          .filter((s: any) => s.name?.trim())
          .map((s: any) => ({
            businessId: business.id,
            name: s.name,
            duration: Number(s.duration) || 30,
            price: Number(s.price) || 0,
          })),
      });
    }

    if (body.vertical === "pizzeria" && Array.isArray(body.menuItems)) {
      await prisma.menuItem.createMany({
        data: body.menuItems
          .filter((m: any) => m.name?.trim())
          .map((m: any) => ({
            businessId: business.id,
            category: m.category?.trim() || "Plats",
            name: m.name,
            price: Number(m.price) || 0,
          })),
      });
    }

    return Response.json(business);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 500 });
  }
}
