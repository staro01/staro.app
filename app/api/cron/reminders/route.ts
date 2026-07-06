import { prisma } from "../../../../lib/prisma";
import { sendSms } from "../../../../core/twilio/sms";
import { isCronAuthorized } from "../../../../lib/cronAuth";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { withRetry } from "../../../../lib/withRetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 55 * 60000);
    const windowEnd = new Date(now.getTime() + 65 * 60000);

    const appointments = await withRetry(() =>
      prisma.appointment.findMany({
        where: {
          status: { in: ["confirmed"] },
          reminderSentAt: null,
          startAt: { gte: windowStart, lte: windowEnd },
        },
        include: { service: true, business: true },
      })
    );

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
        await withRetry(() =>
          prisma.appointment.update({
            where: { id: appt.id },
            data: { reminderSentAt: new Date() },
          })
        );
        sent++;
      } catch (err) {
        console.error(`Échec envoi SMS pour RDV ${appt.id}:`, err);
        failed++;
      }
    }

    return Response.json({ checked: appointments.length, sent, failed });
  } catch (err) {
    await notifyCriticalError("Cron reminders", err);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
