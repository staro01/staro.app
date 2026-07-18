import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  for (const b of businesses) {
    console.log(`- id=${b.id} name=${b.name} phone=${b.phone} phoneVerified=${b.phoneVerified} clerkUserId=${b.clerkUserId} status=${b.subscriptionStatus} updatedAt=${b.updatedAt.toISOString()}`);
  }

  console.log("\nToutes les entrées VerifiedPhone :");
  const all = await prisma.verifiedPhone.findMany();
  all.forEach(p => console.log(`- phone=${p.phone} trialUsed=${p.trialUsed}`));
}

main().finally(() => prisma.$disconnect());
