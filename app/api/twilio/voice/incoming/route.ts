import { prisma } from "../../../../../lib/prisma";
import { xml, getBaseUrl, hangupTwiml, gatherSay, normPhone, ringThenFallbackTwiml } from "../../../../../core/twilio/incoming";
import { verifyTwilioRequest } from "../../../../../core/twilio/verify";
import { notifyCriticalError } from "../../../../../core/monitoring/notifyError";
import { buildAgentGreetingResponse } from "../../../../../core/twilio/agentGreeting";
import { isOutsideHours, DaySchedule } from "../../../../../core/openingHours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARTISAN_VERTICALS = ["paysagiste", "plombier", "electricien", "chauffagiste", "garagiste"];
const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"];

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

function isDemoOrTestNumber(twilioNumber: string | null) {
  if (!twilioNumber) return false;
  const demoNumbers = [normPhone(process.env.DEMO_TWILIO_NUMBER), normPhone(process.env.TEST_TWILIO_NUMBER)].filter(Boolean);
  return demoNumbers.includes(twilioNumber);
}

export async function POST(req: Request) {
  const baseUrl = getBaseUrl(req);
  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    form.forEach((value, key) => { params[key] = value.toString(); });

    const to = (form.get("To") ?? "").toString();
    const callSid = (form.get("CallSid") ?? "").toString();

    const isValid = await verifyTwilioRequest(req, baseUrl, "/api/twilio/voice/incoming", params);
    if (!isValid) {
      return new Response("Forbidden", { status: 403 });
    }

    const business = await findBusiness(to);

    if (!business) {
      return xml(hangupTwiml(baseUrl, "Ce numéro n'est pas encore configuré. Merci de contacter l'établissement."));
    }

    if (business.vacationMode) {
      return xml(hangupTwiml(baseUrl, business.vacationMessage ?? "L'établissement est actuellement fermé. Merci de rappeler."));
    }

    // Verrou abonnement — le numéro démo/test (utilisé par l'équipe commerciale et
    // pour les tests internes) est explicitement exclu, il n'est jamais facturé.
    if (!isDemoOrTestNumber(business.twilioNumber)) {
      if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(business.subscriptionStatus ?? "")) {
        return xml(hangupTwiml(baseUrl, "Ce service est temporairement indisponible. Merci de contacter l'établissement directement."));
      }
    }

    // Mode "sonnerie d'abord" : uniquement pendant les horaires d'ouverture — en dehors,
    // l'agent répond directement pour ne pas déranger l'artisan sur son vrai téléphone.
    const openingHours = (business.openingHours as Record<string, DaySchedule> | null) ?? null;
    if (business.ringFirst && !isOutsideHours(new Date(), openingHours)) {
      const artisanPhone = normPhone(business.phone);
      if (artisanPhone) {
        const greeting = `Bonjour, vous êtes bien au ${business.name}. Un instant, je vous mets en relation.`;
        return xml(ringThenFallbackTwiml(baseUrl, artisanPhone, "/api/twilio/voice/dial-fallback", greeting));
      }
      // ringFirst activé mais pas de téléphone valide renseigné : on retombe sur l'agent direct
      // plutôt que de faire échouer l'appel silencieusement.
    }

    return xml(await buildAgentGreetingResponse(business, baseUrl, callSid));
  } catch (err) {
    await notifyCriticalError("Twilio voice/incoming", err);
    return xml(hangupTwiml(baseUrl, "Une erreur est survenue. Merci de rappeler."));
  }
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  return xml(gatherSay(baseUrl, "Bonjour, puis-je vous aider ?", "/api/twilio/voice/handle-speech"));
}
