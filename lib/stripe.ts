import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY non configurée.");
}

export const stripe = new Stripe(secretKey ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export const STRIPE_PRICES = {
  setupFee: "price_1TqCc9Fsd9bZkP29GaGWH2Gh",
  monthly: "price_1TqCcRFsd9bZkP293Y1iYmsN",
  annual: "price_1TqCceFsd9bZkP29CYQ7o4Zz",
};
