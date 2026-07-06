import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
  if (!business?.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe associé à ce compte." }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://www.staro.app";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erreur création session Customer Portal Stripe:", err);
    return NextResponse.json({ error: "Erreur lors de l'accès à la gestion de l'abonnement." }, { status: 500 });
  }
}
