import { prisma } from "../../../../lib/prisma";
import { sendAdminBackup } from "../../../../core/email/notify";
import { isCronAuthorized } from "../../../../lib/cronAuth";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [businesses, menuItems, supplements, events, conversations, staff, services, appointments] =
      await Promise.all([
        prisma.business.findMany(),
        prisma.menuItem.findMany(),
        prisma.supplement.findMany(),
        prisma.event.findMany(),
        prisma.conversation.findMany(),
        prisma.staff.findMany(),
        prisma.service.findMany(),
        prisma.appointment.findMany(),
      ]);

    const data = {
      exportedAt: new Date().toISOString(),
      businesses,
      menuItems,
      supplements,
      events,
      conversations,
      staff,
      services,
      appointments,
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `staro-backup-${new Date().toISOString().slice(0, 10)}.json`;

    await sendAdminBackup(filename, json);

    return Response.json({
      ok: true,
      sizeBytes: json.length,
      counts: {
        businesses: businesses.length,
        menuItems: menuItems.length,
        supplements: supplements.length,
        events: events.length,
        conversations: conversations.length,
        staff: staff.length,
        services: services.length,
        appointments: appointments.length,
      },
    });
  } catch (err) {
    await notifyCriticalError("Sauvegarde quotidienne (cron/backup)", err);
    return Response.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }
}
