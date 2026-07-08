import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PRICES } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 7;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const plan = body?.plan;

  if (plan !== "monthly" && plan !== "annual") {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const subscriptionPriceId = plan === "monthly" ? STRIPE_PRICES.monthly : STRIPE_PRICES.annual;
  const origin = req.headers.get("origin") ?? "https://www.staro.app";

  // Si la personne est déjà connectée (paiement depuis le dashboard), on rattache
  // la session à sa fiche Business par ID — fiable, contrairement à une
  // réconciliation par email après coup (l'ancien système, gardé en secours
  // uniquement pour un paiement effectué depuis /pricing sans compte existant).
  let businessId: string | null = null;
  let prefillEmail: string | undefined;
  const user = await currentUser();
  if (user) {
    const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
    if (business) businessId = business.id;
    prefillEmail = user.primaryEmailAddress?.emailAddress ?? undefined;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: subscriptionPriceId, quantity: 1 }],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: businessId ? `${origin}/dashboard/settings` : `${origin}/pricing`,
      metadata: { plan, ...(businessId ? { businessId } : {}) },
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { plan, ...(businessId ? { businessId } : {}) },
      },
      customer_email: prefillEmail,
      allow_promotion_codes: true,
      custom_text: {
        submit: {
          message: "En plus de l'abonnement ci-dessus, des frais de mise en place de 499€ seront facturés une seule fois, en même temps que votre premier prélèvement à la fin de l'essai gratuit.",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await notifyCriticalError("Création session Stripe Checkout", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
