import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

type AuditLogParams = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  businessId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        actorEmail: params.actorEmail ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        businessId: params.businessId ?? null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    // Un échec de log ne doit jamais casser l'action principale
    console.error("Échec enregistrement audit log:", err);
  }
}
