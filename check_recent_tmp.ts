import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  for (const b of businesses) {
    console.log(`- id=${b.id} name=${b.name} phone=${b.phone} clerkUserId=${b.clerkUserId} customerEmail=${b.customerEmail} status=${b.subscriptionStatus} createdAt=${b.createdAt.toISOString()}`);
    if (b.phone) {
      const vp = await prisma.verifiedPhone.findUnique({ where: { phone: b.phone } });
      console.log(`  -> VerifiedPhone :`, vp ?? "aucune entrée");
    }
  }
}

main().finally(() => prisma.$disconnect());
