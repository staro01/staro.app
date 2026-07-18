import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.findUnique({
    where: { id: "cmr97te700000ypzon47hdpfl" },
  });
  console.log("Business complet :", JSON.stringify(business, null, 2));

  const usedPhones = await prisma.verifiedPhone.findMany({
    where: { trialUsed: true },
  });
  console.log(`\nNuméros avec trialUsed=true (${usedPhones.length}) :`);
  usedPhones.forEach(p => console.log(`- ${p.phone}`));
}

main().finally(() => prisma.$disconnect());
