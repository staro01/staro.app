import { prisma } from "../lib/prisma";
import { sendClientReport } from "./email/notify";

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
  if (business?.customerEmail) {
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
