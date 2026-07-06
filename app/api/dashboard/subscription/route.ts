import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json(null, { status: 401 });

  const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
  if (!business) return Response.json(null, { status: 404 });

  return Response.json({
    plan: business.subscriptionPlan,
    status: business.subscriptionStatus,
    hasStripeCustomer: !!business.stripeCustomerId,
  });
}
