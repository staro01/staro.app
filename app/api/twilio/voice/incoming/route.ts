import { prisma } from "../../../../../lib/prisma";
import { xml, getBaseUrl, hangupTwiml, gatherSay, normPhone } from "../../../../../core/twilio/incoming";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findBusiness(to: string) {
  const normalized = normPhone(to);
  const raw = (to ?? "").trim().replace(/\s+/g, "");
  if (normalized) {
    const b = await prisma.business.findFirst({ where: { twilioNumber: normalized } });
    if (b) return b;
  }
  if (raw) {
    const b = await prisma.business.findFirst({ where: { twilioNumber: raw } });
    if (b) return b;
  }
  return null;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const to = (form.get("To") ?? "").toString();
  const callSid = (form.get("CallSid") ?? "").toString();
  const baseUrl = getBaseUrl(req);

  const business = await findBusiness(to);

  if (!business) {
    return xml(hangupTwiml(baseUrl, "Ce numéro n'est pas encore configuré. Merci de contacter l'établissement."));
  }

  if (business.vacationMode) {
    return xml(hangupTwiml(baseUrl, business.vacationMessage ?? "L'établissement est actuellement fermé. Merci de rappeler."));
  }

  const defaultGreet = business.vertical === "coiffeur"
    ? `Bonjour, salon ${business.name}, que puis-je faire pour vous ?`
    : `Bonjour, pizzeria ${business.name}, puis-je prendre votre commande ?`;

  const greet = business.welcomeMessage?.trim() ? business.welcomeMessage.trim() : defaultGreet;

  if (callSid) {
    await prisma.conversation.upsert({
      where: { externalId: callSid },
      update: {},
      create: { externalId: callSid, businessId: business.id, messages: [{ role: "assistant", content: greet }] },
    });
  }

  return xml(gatherSay(baseUrl, greet, "/api/twilio/voice/handle-speech"));
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  return xml(gatherSay(baseUrl, "Bonjour, puis-je vous aider ?", "/api/twilio/voice/handle-speech"));
}
