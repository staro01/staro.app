import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id manquant." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const paid = session.payment_status === "paid" || session.status === "complete";

    return NextResponse.json({ email, paid });
  } catch (err) {
    console.error("Erreur récupération session Stripe:", err);
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }
}
