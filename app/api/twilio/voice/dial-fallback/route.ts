import { prisma } from "../../../../../lib/prisma";
import { xml, getBaseUrl, hangupTwiml, normPhone } from "../../../../../core/twilio/incoming";
import { verifyTwilioRequest } from "../../../../../core/twilio/verify";
import { buildAgentGreetingResponse } from "../../../../../core/twilio/agentGreeting";
import { notifyCriticalError } from "../../../../../core/monitoring/notifyError";

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
  const baseUrl = getBaseUrl(req);
  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    form.forEach((value, key) => { params[key] = value.toString(); });

    const to = (form.get("To") ?? "").toString();
    const callSid = (form.get("CallSid") ?? "").toString();
    const dialCallStatus = (form.get("DialCallStatus") ?? "").toString();

    const isValid = await verifyTwilioRequest(req, baseUrl, "/api/twilio/voice/dial-fallback", params);
    if (!isValid) {
      return new Response("Forbidden", { status: 403 });
    }

    // L'artisan a décroché lui-même et l'appel s'est terminé normalement : rien de plus à faire.
    if (dialCallStatus === "completed") {
      return xml(hangupTwiml(baseUrl, "Au revoir."));
    }

    const business = await findBusiness(to);
    if (!business) {
      return xml(hangupTwiml(baseUrl, "Ce numéro n'est pas encore configuré."));
    }

    // Personne n'a décroché (pas de réponse, occupé, échec) : l'agent Staro prend le relais.
    return xml(await buildAgentGreetingResponse(business, baseUrl, callSid));
  } catch (err) {
    await notifyCriticalError("Twilio voice/dial-fallback", err);
    return xml(hangupTwiml(baseUrl, "Une erreur est survenue. Merci de rappeler."));
  }
}
