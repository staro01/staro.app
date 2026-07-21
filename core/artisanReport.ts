import { prisma } from "../lib/prisma";
import { notifyCriticalError } from "./monitoring/notifyError";
import { sendClientReport } from "./email/notify";
import { sendSms } from "./twilio/sms";
import { normPhone } from "./twilio/incoming";

// Le champ subscriptionPlan est stocké au format "tier_frequence" (ex: "pro_monthly").
// À partir du palier Pro, l'artisan reçoit le récap par SMS plutôt que par email —
// plus pratique pour quelqu'un sur un chantier qui consulte son téléphone, pas ses mails.
function getPlanTier(subscriptionPlan?: string | null): "essentiel" | "pro" | "premium" | null {
  if (!subscriptionPlan) return null;
  const tier = subscriptionPlan.split("_")[0];
  if (tier === "essentiel" || tier === "pro" || tier === "premium") return tier;
  return null;
}

export type ArtisanMetier = "plombier" | "electricien" | "paysagiste" | "chauffagiste" | "garagiste";

const METIER_LABELS: Record<ArtisanMetier, string> = {
  plombier: "Plombier",
  electricien: "Électricien",
  paysagiste: "Paysagiste",
  chauffagiste: "Chauffagiste",
  garagiste: "Garage automobile",
};

export function extractReportJson(text: string): Record<string, unknown> | null {
  const match = text.match(/<RAPPORT_DEMANDE>\s*([\s\S]*?)\s*<\/RAPPORT_DEMANDE>/);
  if (!match?.[1]) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

export function stripReportBlock(text: string) {
  return text.replace(/<RAPPORT_DEMANDE>[\s\S]*?<\/RAPPORT_DEMANDE>/g, "").trim();
}

export function getCallbackWindow(): string {
  return "le plus tôt possible";
}

export function getPersonalCallInstruction(businessName: string, reportBlockName: string): string {
  return `Si l'appelant demande explicitement à parler à ${businessName} en tant que personne (ami, famille, proche) et non pour un besoin lié à l'activité, ne lance pas le déroulé habituel. Demande : "Voulez-vous que je vous transfère ?" Si oui, dis "Je vous transfère tout de suite." puis termine IMMÉDIATEMENT ta réponse par le marqueur <TRANSFERT_HUMAIN/>, sans rien ajouter d'autre après. Si non, demande si tu peux prendre un message, note-le brièvement, remercie et raccroche poliment sans produire de bloc ${reportBlockName}.`;
}

export async function saveArtisanRequestAndNotify(
  externalRef: string,
  businessId: string,
  metier: ArtisanMetier,
  data: Record<string, unknown>
) {
  const customerName = String(data.customerName ?? "");
  const phone = String(data.phone ?? "");
  const address = String(data.address ?? "");
  const problem = String(data.problem ?? "");
  const since = String(data.since ?? "");
  const availability = String(data.availability ?? "");
  const summary = String(data.summary ?? problem);

  await prisma.event.upsert({
    where: { externalRef },
    update: {
      status: "new",
      type: "demande_intervention",
      customerName,
      customerPhone: phone,
      summary,
      data: { metier, address, problem, since, availability },
    },
    create: {
      externalRef,
      businessId,
      type: "demande_intervention",
      status: "new",
      customerName,
      customerPhone: phone,
      summary,
      data: { metier, address, problem, since, availability },
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });

  // SMS de récap au client final — le rassure que sa demande a bien été prise en compte.
  if (phone && business?.twilioNumber) {
    try {
      const toNumber = normPhone(phone);
      if (toNumber) {
        await sendSms(
          toNumber,
          `Votre demande a bien été transmise à ${business.name}. Vous serez recontacté(e) sous peu.`,
          business.twilioNumber
        );
      }
    } catch (err) {
      console.error(`Échec envoi SMS récap client pour ${externalRef}:`, err);
    }
  }

  const tier = getPlanTier(business?.subscriptionPlan);
  const artisanPhone = business?.phone ? normPhone(business.phone) : null;
  // Le choix SMS/email n'est disponible qu'à partir du palier Pro — un compte Essentiel
  // reste forcé sur email, quelle que soit la valeur stockée en base (garde-fou).
  const wantsSms = (tier === "pro" || tier === "premium") && business?.reportChannel === "sms";
  const notifyByArtisanSms = wantsSms && artisanPhone && business?.twilioNumber;

  if (notifyByArtisanSms) {
    try {
      const smsText = `Nouvelle demande (${METIER_LABELS[metier]}) : ${customerName || "Client"} — ${phone}. ${summary}${address ? ` — ${address}` : ""}`;
      await sendSms(artisanPhone!, smsText, business!.twilioNumber!);
    } catch (err) {
      await notifyCriticalError(`Échec envoi SMS récap artisan pour ${externalRef}`, err);
      // Filet de sécurité : si le SMS échoue, on retombe sur l'email pour ne pas perdre la demande.
      if (business?.customerEmail) {
        await sendClientReport(
          business.customerEmail,
          `Nouvelle demande — ${customerName || "client"} — ${METIER_LABELS[metier]}`,
          `<p>Un client a appelé concernant : <strong>${summary}</strong></p>
           <ul>
             <li><strong>Client</strong> : ${customerName} — ${phone}</li>
             <li><strong>Adresse d'intervention</strong> : ${address || "non précisée"}</li>
             <li><strong>Problème</strong> : ${problem}</li>
             <li><strong>Depuis quand</strong> : ${since || "non précisé"}</li>
             <li><strong>Disponibilités indiquées</strong> : ${availability || "non précisées"}</li>
           </ul>`
        );
      }
    }
  } else if (business?.customerEmail) {
    const html = `
      <p>Un client a appelé concernant : <strong>${summary}</strong></p>
      <ul>
        <li><strong>Client</strong> : ${customerName} — ${phone}</li>
        <li><strong>Adresse d'intervention</strong> : ${address || "non précisée"}</li>
        <li><strong>Problème</strong> : ${problem}</li>
        <li><strong>Depuis quand</strong> : ${since || "non précisé"}</li>
        <li><strong>Disponibilités indiquées</strong> : ${availability || "non précisées"}</li>
      </ul>
    `;
    await sendClientReport(
      business.customerEmail,
      `Nouvelle demande — ${customerName || "client"} — ${METIER_LABELS[metier]}`,
      html
    );
  }
}
