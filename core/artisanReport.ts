import { prisma } from "../lib/prisma";
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

export type ArtisanMetier = "plombier" | "electricien" | "paysagiste" | "chauffagiste";

const METIER_LABELS: Record<ArtisanMetier, string> = {
  plombier: "Plombier",
  electricien: "Électricien",
  paysagiste: "Paysagiste",
  chauffagiste: "Chauffagiste",
};

export function extractReportJson(text: string): Record<string, unknown> | null {
  const match = text.match(/<RAPPORT_DEMANDE>\s*([\s\S]*?)\s*<\/RAPPORT_DEMANDE>/);
  if (!match?.[1]) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

export function stripReportBlock(text: string) {
  return text.replace(/<RAPPORT_DEMANDE>[\s\S]*?<\/RAPPORT_DEMANDE>/g, "").trim();
}

// Heuristique simple : avant 17h (Paris) → "avant la fin de journée", sinon → "dans la matinée".
// Ne dépend pas des horaires d'ouverture du commerce (pas structurées de façon fiable pour l'instant).
export function getCallbackWindow(): string {
  const hourParis = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", hour12: false, timeZone: "Europe/Paris" }).format(new Date())
  );
  return hourParis < 17 ? "avant la fin de journée" : "dans la matinée";
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
  const notifyByArtisanSms = (tier === "pro" || tier === "premium") && artisanPhone && business?.twilioNumber;

  if (notifyByArtisanSms) {
    try {
      const smsText = `Nouvelle demande (${METIER_LABELS[metier]}) : ${customerName || "Client"} — ${phone}. ${summary}${address ? ` — ${address}` : ""}`;
      await sendSms(artisanPhone!, smsText, business!.twilioNumber!);
    } catch (err) {
      console.error(`Échec envoi SMS récap artisan pour ${externalRef}:`, err);
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
