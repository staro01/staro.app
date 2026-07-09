import { prisma } from "../../../../lib/prisma";
import { isCronAuthorized } from "../../../../lib/cronAuth";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { logAudit } from "../../../../core/audit/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 90;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.conversation.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    await logAudit({
      action: "conversations.auto_cleanup",
      targetType: "conversation",
      metadata: { deletedCount: result.count, retentionDays: RETENTION_DAYS, cutoff: cutoff.toISOString() },
    });

    return Response.json({ ok: true, deleted: result.count });
  } catch (err) {
    await notifyCriticalError("Nettoyage automatique des conversations (RGPD)", err);
    return Response.json({ error: "Erreur interne" }, { status: 500 });
  }
}
