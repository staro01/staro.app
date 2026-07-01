import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function ensureBusinessForCurrentUser(vertical = "pizzeria") {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress ?? null;

  const business = await prisma.business.upsert({
    where: { clerkUserId: user.id },
    update: {},
    create: {
      clerkUserId: user.id,
      vertical,
      name: email ? `Business ${email}` : `Business ${user.id.slice(0, 6)}`,
    },
  });

  return business;
}
