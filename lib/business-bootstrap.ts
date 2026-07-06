import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { sendAdminNotification } from "../core/email/notify";

export async function ensureBusinessForCurrentUser(vertical = "pizzeria") {
  const user = await currentUser();
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? null;

  const existing = await prisma.business.findUnique({ where: { clerkUserId: user.id } });
  if (existing) return existing;

  // Réclamation : si un paiement Stripe a déjà été effectué avec cet email, on rattache ce compte
  if (email) {
    const paidBusiness = await prisma.business.findFirst({
      where: {
        customerEmail: { equals: email, mode: "insensitive" },
        clerkUserId: null,
        subscriptionStatus: "active",
      },
    });

    if (paidBusiness) {
      const claimed = await prisma.business.update({
        where: { id: paidBusiness.id },
        data: {
          clerkUserId: user.id,
          status: "approved",
        },
      });

      sendAdminNotification(
        "Compte Staro.app rattaché à un paiement",
        `Le compte ${email} vient de créer son compte et a été automatiquement rattaché à son paiement Stripe.\n\nID business : ${claimed.id}`
      ).catch(() => {});

      return claimed;
    }
  }

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
