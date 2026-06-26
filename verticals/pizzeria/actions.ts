import { prisma } from "../../lib/prisma";

export function extractOrderJson(text: string): Record<string, unknown> | null {
  const match = text.match(/<COMMANDE_PRETE>\s*([\s\S]*?)\s*<\/COMMANDE_PRETE>/);
  if (!match?.[1]) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

export function stripOrderBlock(text: string) {
  return text.replace(/<COMMANDE_PRETE>[\s\S]*?<\/COMMANDE_PRETE>/g, "").trim();
}

export async function saveOrder(externalRef: string, businessId: string, data: Record<string, unknown>) {
  type Item = { name?: string; qty?: number; note?: string };
  const items = Array.isArray(data.items) ? (data.items as Item[]) : [];
  const summary = items.map(it => `${it.qty ?? 1}x ${it.name ?? "?"}${it.note ? ` (${it.note})` : ""}`).join(", ");

  await prisma.event.upsert({
    where: { externalRef },
    update: {
      status: "confirmed",
      customerName: String(data.customerName ?? ""),
      customerPhone: String(data.phone ?? ""),
      summary,
      data: {
        type: String(data.type ?? "TAKEAWAY"),
        address: String(data.address ?? ""),
        items,
        total: Number(data.total ?? 0),
      },
    },
    create: {
      externalRef,
      businessId,
      type: "order",
      status: "confirmed",
      customerName: String(data.customerName ?? ""),
      customerPhone: String(data.phone ?? ""),
      summary,
      data: {
        type: String(data.type ?? "TAKEAWAY"),
        address: String(data.address ?? ""),
        items,
        total: Number(data.total ?? 0),
      },
    },
  });
}
