import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY non configurée.");
}

export const stripe = new Stripe(secretKey ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export const STRIPE_PRICES = {
  setupFee: "price_1Tq9YrFsd9bZkP29MLiqsPm2",
  monthly: "price_1Tq9ZEFsd9bZkP29EqMzIrAV",
  annual: "price_1Tq9ZUFsd9bZkP29XTBpKxAi",
};
