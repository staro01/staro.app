import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY non configurée.");
}

export const stripe = new Stripe(secretKey ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export const STRIPE_PRICES = {
  setupFee: "price_1TqwjUFsd9bZkP29eEKRwkqs",
  essentiel_monthly: "price_1TtOYkFsd9bZkP29I5Zj9NYS",
  pro_monthly: "price_1TtOZ0Fsd9bZkP29JjZINH7P",
  premium_monthly: "price_1TtOZEFsd9bZkP29SqV9vhgj",
  essentiel_annual: "price_1TtOa3Fsd9bZkP298n6ggl8S",
  pro_annual: "price_1TtOaLFsd9bZkP290PvRFbp7",
  premium_annual: "price_1TtOabFsd9bZkP29OTJWhJHM",
} as const;

export type PlanId = keyof typeof STRIPE_PRICES;
