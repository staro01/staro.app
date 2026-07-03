import { prisma } from "../../lib/prisma";
import { parisLocalToUtc } from "../../lib/timezone";

export function extractAppointmentJson(text: string): Record<string, unknown> | null {
  const match = text.match(/<RDV_PRET>\s*([\s\S]*?)\s*<\/RDV_PRET>/);
  if (!match?.[1]) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

export function stripAppointmentBlock(text: string) {
  return text.replace(/<RDV_PRET>[\s\S]*?<\/RDV_PRET>/g, "").trim();
}

export async function saveAppointment(externalRef: string, businessId: string, data: Record<string, unknown>) {
  const serviceId = data.serviceId ? String(data.serviceId) : null;
  const staffId = data.staffId ? String(data.staffId) : null;
  const startAt = parisLocalToUtc(String(data.startAt));

  const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null;
  const duration = service?.duration ?? 30;
  const endAt = new Date(startAt.getTime() + duration * 60000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId,
      status: { not: "cancelled" },
      externalRef: { not: externalRef },
      ...(staffId ? { staffId } : {}),
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  const summary = `${service?.name ?? "RDV"} - ${String(data.customerName ?? "")}`;

  await prisma.appointment.upsert({
    where: { externalRef },
    update: {
      serviceId, staffId,
      customerName: String(data.customerName ?? ""),
      customerPhone: String(data.phone ?? ""),
      startAt, endAt,
      status: conflict ? "conflict" : "confirmed",
      notes: String(data.notes ?? ""),
    },
    create: {
      externalRef, businessId, serviceId, staffId,
      customerName: String(data.customerName ?? ""),
      customerPhone: String(data.phone ?? ""),
      startAt, endAt,
      status: conflict ? "conflict" : "confirmed",
      notes: String(data.notes ?? ""),
    },
  });

  return { conflict: !!conflict, summary };
}
