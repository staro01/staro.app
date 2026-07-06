import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "../../../../lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const plan = body?.plan;

  if (plan !== "monthly" && plan !== "annual") {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const subscriptionPriceId = plan === "monthly" ? STRIPE_PRICES.monthly : STRIPE_PRICES.annual;

  const origin = req.headers.get("origin") ?? "https://www.staro.app";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: STRIPE_PRICES.setupFee, quantity: 1 },
        { price: subscriptionPriceId, quantity: 1 },
      ],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erreur création session Stripe Checkout:", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
