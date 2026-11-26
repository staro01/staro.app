import { prisma } from "../../../../lib/prisma";
import { isCronAuthorized } from "../../../../lib/cronAuth";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { logAudit } from "../../../../core/audit/log";
import { avecReessais } from "../../../../lib/reessaiBase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Les réessais peuvent durer jusqu'à ~35 s : on laisse 60 s à la fonction.
export const maxDuration = 60;

const RETENTION_DAYS = 90;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // La base Neon peut être en veille à cette heure : jusqu'à 3 nouveaux essais (3 s, 10 s, 20 s).
    const { resultat: result, essais } = await avecReessais(() =>
      prisma.conversation.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }),
    );

    await logAudit({
      action: "conversations.auto_cleanup",
      targetType: "conversation",
      metadata: { deletedCount: result.count, retentionDays: RETENTION_DAYS, cutoff: cutoff.toISOString(), essais },
    });

    return Response.json({ ok: true, deleted: result.count });
  } catch (err) {
    await notifyCriticalError("Nettoyage automatique des conversations (RGPD)", err);
    return Response.json({ error: "Erreur interne" }, { status: 500 });
  }
}
