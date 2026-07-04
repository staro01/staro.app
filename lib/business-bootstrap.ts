import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { sendAdminNotification } from "../core/email/notify";

export async function ensureBusinessForCurrentUser(vertical = "pizzeria") {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress ?? null;

  const existing = await prisma.business.findUnique({ where: { clerkUserId: user.id } });
  if (existing) return existing;

  const business = await prisma.business.create({
    data: {
      clerkUserId: user.id,
      vertical,
      status: "pending",
      name: email ? `Business ${email}` : `Business ${user.id.slice(0, 6)}`,
    },
  });

  sendAdminNotification(
    "Nouvelle inscription Staro.app en attente",
    `Un nouveau compte vient de s'inscrire et attend ton approbation.\n\nEmail : ${email ?? "inconnu"}\nVertical : ${vertical}\nID business : ${business.id}\n\nVa sur https://www.staro.app/admin pour l'approuver.`
  ).catch(() => {});

  return business;
}
