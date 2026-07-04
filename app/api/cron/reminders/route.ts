import { prisma } from "../../../../lib/prisma";
import { sendSms } from "../../../../core/twilio/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protège l'endpoint : seul Vercel Cron (avec le bon secret) peut le déclencher
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // pas configuré = pas de protection (à éviter en prod)
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 55 * 60000); // 55 min
  const windowEnd = new Date(now.getTime() + 65 * 60000);   // 65 min
  // Fenêtre de 10 min autour de "1h avant" pour couvrir l'intervalle entre deux exécutions du cron

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["confirmed"] },
      reminderSentAt: null,
      startAt: { gte: windowStart, lte: windowEnd },
    },
    include: { service: true, business: true },
  });

  let sent = 0;
  let failed = 0;

  for (const appt of appointments) {
    if (!appt.customerPhone || !appt.business.twilioNumber) continue;

    const timeStr = appt.startAt.toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
    });

    const businessLabel = appt.business.vertical === "coiffeur" ? "salon" : "établissement";
    const serviceLabel = appt.service?.name ? ` (${appt.service.name})` : "";
    const message = `Rappel : votre rendez-vous${serviceLabel} au ${businessLabel} ${appt.business.name} est à ${timeStr}, dans 1h. À bientôt !`;

    try {
      // Le numéro client doit être au format international pour Twilio
      const toNumber = appt.customerPhone.startsWith("+")
        ? appt.customerPhone
        : appt.customerPhone.startsWith("0")
          ? `+33${appt.customerPhone.slice(1)}`
          : `+${appt.customerPhone}`;

      await sendSms(toNumber, message, appt.business.twilioNumber);
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`Échec envoi SMS pour RDV ${appt.id}:`, err);
      failed++;
    }
  }

  return Response.json({ checked: appointments.length, sent, failed });
}
