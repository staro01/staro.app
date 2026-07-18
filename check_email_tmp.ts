import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx check_email_tmp.ts email@exemple.com");
    process.exit(1);
  }

  const businesses = await prisma.business.findMany({
    where: { customerEmail: { equals: email, mode: "insensitive" } },
  });
  console.log(`Business(es) trouvé(s) pour cet email : ${businesses.length}`);
  for (const b of businesses) {
    console.log(`- id=${b.id} name=${b.name} phone=${b.phone} clerkUserId=${b.clerkUserId} status=${b.subscriptionStatus}`);
    if (b.phone) {
      const vp = await prisma.verifiedPhone.findUnique({ where: { phone: b.phone } });
      console.log(`  -> VerifiedPhone pour ce numéro :`, vp ?? "aucune entrée");
    }
  }
}

main().finally(() => prisma.$disconnect());
