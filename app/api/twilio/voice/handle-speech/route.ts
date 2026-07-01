import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { xml, getBaseUrl, hangupTwiml, gatherSay, normPhone } from "../../../../../core/twilio/incoming";
import { loadHistory, saveHistory } from "../../../../../core/ai/conversation";
import { askClaude } from "../../../../../core/ai/claude";
import { buildPizzeriaPrompt } from "../../../../../verticals/pizzeria/prompt";
import { extractOrderJson, stripOrderBlock, saveOrder } from "../../../../../verticals/pizzeria/actions";

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

    // Charger menu + suppléments
    const menuItems = await prisma.menuItem.findMany({
      where: { businessId: business.id },
      orderBy: { category: "asc" },
    });

    const supplements = await prisma.supplement.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    });

    // Menu vide
    if (menuItems.length === 0) {
      return xml(hangupTwiml(baseUrl, "Notre système de commande n'est pas encore configuré. Merci de nous appeler directement."));
    }

    // Choisir le prompt selon le vertical
    let system = "";
    if (business.vertical === "pizzeria") {
      system = buildPizzeriaPrompt(business, menuItems, supplements);
    } else {
      system = buildPizzeriaPrompt(business, menuItems, supplements); // fallback
    }

    const history = await loadHistory(callSid);
    history.push({ role: "user", content: speech || "[silence]" });

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
