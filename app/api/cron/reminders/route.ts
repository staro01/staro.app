import { prisma } from "../../../../lib/prisma";
import { sendSms } from "../../../../core/twilio/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protège l'endpoint : accepte soit un header Authorization (Vercel Cron),
// soit un paramètre ?secret= dans l'URL (services de cron externes sans support des headers).
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // pas configuré = pas de protection (à éviter en prod)

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 55 * 60000);
  const windowEnd = new Date(now.getTime() + 65 * 60000);

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
