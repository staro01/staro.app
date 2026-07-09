import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { isCronAuthorized } from "../../../../lib/cronAuth";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { sendClientReport } from "../../../../core/email/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h après création

    const abandoned = await prisma.business.findMany({
      where: {
        clerkUserId: { not: null },
        name: { startsWith: "Business " },
        createdAt: { lt: cutoff },
        onboardingReminderSentAt: null,
        OR: [
          { subscriptionStatus: null },
          { subscriptionStatus: "inactive" },
        ],
      },
    });

    let sent = 0;
    let failed = 0;
    const client = await clerkClient();

    for (const business of abandoned) {
      if (!business.clerkUserId) continue;
      try {
        const clerkUser = await client.users.getUser(business.clerkUserId);
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) continue;

        await sendClientReport(
          email,
          "Terminez la configuration de votre agent vocal Staro",
          `<p>Bonjour,</p>
           <p>Vous avez créé un compte Staro.app mais n'avez pas encore terminé la configuration de votre agent vocal.</p>
           <p>Ça ne prend que 2 minutes : <a href="https://www.staro.app/onboarding">Terminer ma configuration</a></p>
           <p>À bientôt,<br/>L'équipe Staro</p>`
        );

        await prisma.business.update({
          where: { id: business.id },
          data: { onboardingReminderSentAt: new Date() },
        });
        sent++;
      } catch (err) {
        console.error(`Échec relance onboarding pour business ${business.id}:`, err);
        failed++;
      }
    }

    return Response.json({ checked: abandoned.length, sent, failed });
  } catch (err) {
    await notifyCriticalError("Cron onboarding reminders", err);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
