import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { sendSms } from "../../../../../core/twilio/sms";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getBusiness() {
  const user = await currentUser();
  if (!user) return null;
  return prisma.business.findFirst({ where: { clerkUserId: user.id } });
}

function normalizePhone(p?: string | null): string | null {
  if (!p) return null;
  const raw = p.trim().replace(/\s+/g, "");
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("33")) return `+${raw}`;
  if (raw.startsWith("0") && raw.length === 10) return `+33${raw.slice(1)}`;
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusiness();
  if (!business) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const previousEvent = await prisma.event.findFirst({ where: { id, businessId: business.id } });
  if (!previousEvent) return Response.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;

  // La note est fusionnée dans le JSON "data" existant plutôt que de l'écraser
  if (body.note !== undefined) {
    const existingData = (previousEvent.data as Record<string, unknown>) ?? {};
    updateData.data = { ...existingData, note: body.note };
  }

  const event = await prisma.event.update({ where: { id }, data: updateData });

  const justBecameReady = body.status === "ready" && previousEvent?.status !== "ready";
  if (justBecameReady && business.twilioNumber) {
    const toNumber = normalizePhone(event.customerPhone);
    if (toNumber) {
      try {
        const label = business.vertical === "coiffeur" ? "rendez-vous" : "commande";
        const message = `Bonjour ${event.customerName ?? ""}, votre ${label} chez ${business.name} est prête ! À très vite.`.trim();
        await sendSms(toNumber, message, business.twilioNumber);
      } catch (err) {
        console.error(`Échec envoi SMS "commande prête" pour event ${id}:`, err);
      }
    }
  }

  return Response.json(event);
}
