import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { xml, getBaseUrl, hangupTwiml, gatherSay, normPhone } from "../../../../../core/twilio/incoming";
import { loadHistory, saveHistory } from "../../../../../core/ai/conversation";
import { askClaude } from "../../../../../core/ai/claude";
import { buildPizzeriaPrompt } from "../../../../../verticals/pizzeria/prompt";
import { extractOrderJson, stripOrderBlock, saveOrder } from "../../../../../verticals/pizzeria/actions";
import { buildCoiffeurPrompt } from "../../../../../verticals/coiffeur/prompt";
import { extractAppointmentJson, stripAppointmentBlock, saveAppointment } from "../../../../../verticals/coiffeur/actions";

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

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  try {
    const form = await req.formData();
    const speech = ((form.get("SpeechResult") ?? "") as string).trim();
    const callSid = ((form.get("CallSid") ?? "") as string).toString();
    const to = ((form.get("To") ?? "") as string).toString();

    const business = await findBusiness(to);
    if (!business) return xml(hangupTwiml(baseUrl, "Ce numéro n'est pas configuré."));

    const history = await loadHistory(callSid);
    history.push({ role: "user", content: speech || "[silence]" });

    if (business.vertical === "coiffeur") {
      const services = await prisma.service.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });
      const staff = await prisma.staff.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });

      if (services.length === 0) {
        return xml(hangupTwiml(baseUrl, "Notre système de prise de rendez-vous n'est pas encore configuré. Merci de nous appeler directement."));
      }

      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      const upcomingAppointments = await prisma.appointment.findMany({
        where: { businessId: business.id, status: { not: "cancelled" }, startAt: { lte: in7Days } },
      });

      const system = buildCoiffeurPrompt(business, services, staff, upcomingAppointments);
      const claudeText = await askClaude(system, history);
      history.push({ role: "assistant", content: claudeText });

      const apptData = extractAppointmentJson(claudeText);
      if (apptData) {
        const { conflict } = await saveAppointment(callSid, business.id, apptData);
        if (conflict) {
          const retryText = "Ce créneau vient d'être pris, pouvez-vous choisir un autre horaire ?";
          history.push({ role: "assistant", content: retryText });
          await saveHistory(callSid, history, business.id);
          return xml(gatherSay(baseUrl, retryText, "/api/twilio/voice/handle-speech"));
        }
        await saveHistory(callSid, history, business.id);
        const confirmText = stripAppointmentBlock(claudeText) || "Votre rendez-vous est bien enregistré. Merci et à bientôt !";
        return xml(hangupTwiml(baseUrl, confirmText));
      }

      await saveHistory(callSid, history, business.id);
      return xml(gatherSay(baseUrl, claudeText, "/api/twilio/voice/handle-speech"));
    }

    // Vertical pizzeria (par défaut)
    const menuItems = await prisma.menuItem.findMany({ where: { businessId: business.id }, orderBy: { category: "asc" } });
    const supplements = await prisma.supplement.findMany({ where: { businessId: business.id }, orderBy: { name: "asc" } });

    if (menuItems.length === 0) {
      return xml(hangupTwiml(baseUrl, "Notre système de commande n'est pas encore configuré. Merci de nous appeler directement."));
    }

    const system = buildPizzeriaPrompt(business, menuItems, supplements);
    const claudeText = await askClaude(system, history);
    history.push({ role: "assistant", content: claudeText });
    await saveHistory(callSid, history, business.id);

    const orderData = extractOrderJson(claudeText);
    if (orderData) {
      await saveOrder(callSid, business.id, orderData);
      const confirmText = stripOrderBlock(claudeText) || "Votre commande est bien enregistrée. Merci et à bientôt !";
      return xml(hangupTwiml(baseUrl, confirmText));
    }

    return xml(gatherSay(baseUrl, claudeText, "/api/twilio/voice/handle-speech"));
  } catch (err) {
    console.error("handle-speech error:", err);
    return xml(hangupTwiml(baseUrl, "Une erreur est survenue. Merci de rappeler."));
  }
}
