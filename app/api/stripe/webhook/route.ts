import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET non configurée.");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature webhook Stripe invalide:", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
        const plan = session.metadata?.plan ?? null;

        if (customerEmail && customerId) {
          const existing = await prisma.business.findFirst({
            where: { customerEmail: { equals: customerEmail, mode: "insensitive" }, clerkUserId: null },
          });

          if (existing) {
            await prisma.business.update({
              where: { id: existing.id },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionPlan: plan,
                subscriptionStatus: "active",
              },
            });
          } else {
            await prisma.business.create({
              data: {
                name: `Business ${customerEmail}`,
                vertical: "pizzeria",
                status: "pending",
                customerEmail,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionPlan: plan,
                subscriptionStatus: "active",
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.business.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: subscription.status },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.business.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: "cancelled" },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Erreur traitement webhook Stripe (${event.type}):`, err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
