import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PRICES } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { normPhone } from "../../../../core/twilio/incoming";

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

  if (!businessId) {
    return NextResponse.json({ error: "Compte introuvable. Terminez d'abord votre inscription." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business?.phoneVerified || !business.phone) {
    return NextResponse.json(
      { error: "Vérifiez votre numéro de téléphone avant de vous abonner." },
      { status: 403 }
    );
  }

  const normalizedPhone = normPhone(business.phone);
  const verifiedPhone = await prisma.verifiedPhone.findUnique({ where: { phone: normalizedPhone } });
  const trialAlreadyUsed = verifiedPhone?.trialUsed ?? false;
  const effectiveTrialDays = trialAlreadyUsed ? 0 : TRIAL_DAYS;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: subscriptionPriceId, quantity: 1 }],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: businessId ? `${origin}/dashboard/settings` : `${origin}/pricing`,
      metadata: { plan, ...(businessId ? { businessId } : {}) },
      subscription_data: {
        trial_period_days: effectiveTrialDays,
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

    if (!trialAlreadyUsed) {
      await prisma.verifiedPhone.update({
        where: { phone: normalizedPhone },
        data: { trialUsed: true },
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await notifyCriticalError("Création session Stripe Checkout", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
