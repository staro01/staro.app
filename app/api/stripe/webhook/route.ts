import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, STRIPE_PRICES } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";
import { notifyCriticalError } from "../../../../core/monitoring/notifyError";
import { provisionTwilioNumber, releaseTwilioNumber } from "../../../../core/twilio/provision";
import { sendTwilioNumberEmail } from "../../../../core/email/notify";

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
        const businessId = session.metadata?.businessId ?? null;

        if (!customerId || !subscriptionId) break;

        // Ajoute le frais de mise en place en ligne d'attente rattachée à l'abonnement —
        // Stripe l'intègre automatiquement à la toute première vraie facture,
        // générée à la fin de l'essai gratuit. Rien n'est prélevé aujourd'hui.
        try {
          await stripe.invoiceItems.create({
            customer: customerId,
            subscription: subscriptionId,
            pricing: { price: STRIPE_PRICES.setupFee },
          });
        } catch (err) {
          await notifyCriticalError("Ajout frais de mise en place (invoice item)", err);
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const status = subscription.status;

        if (businessId) {
          const updated = await prisma.business.update({
            where: { id: businessId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionPlan: plan,
              subscriptionStatus: status,
            },
          });

          if (!updated.twilioNumber) {
            try {
              const twilioNumber = await provisionTwilioNumber();
              await prisma.business.update({
                where: { id: businessId },
                data: { twilioNumber },
              });
              if (customerEmail) {
                await sendTwilioNumberEmail(customerEmail, updated.name, twilioNumber).catch(() => {});
              }
            } catch (err) {
              await notifyCriticalError("Provisioning automatique numéro Twilio", err);
            }
          }
        } else if (customerEmail) {
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
                subscriptionStatus: status,
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
                subscriptionStatus: status,
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

        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        await prisma.business.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: "cancelled" },
        });

        // Si l'abonnement est annulé sans qu'aucune facture n'ait jamais été payée
        // (essai gratuit non converti), on libère le numéro Twilio pour ne pas
        // continuer à le payer indéfiniment.
        if (business?.twilioNumber) {
          try {
            const invoices = await stripe.invoices.list({ subscription: subscription.id, status: "paid", limit: 1 });
            if (invoices.data.length === 0) {
              await releaseTwilioNumber(business.twilioNumber);
              await prisma.business.update({
                where: { id: business.id },
                data: { twilioNumber: null },
              });
            }
          } catch (err) {
            await notifyCriticalError("Libération numéro Twilio après annulation", err);
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    await notifyCriticalError(`Webhook Stripe (${event.type})`, err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
