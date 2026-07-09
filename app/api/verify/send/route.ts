import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendVerificationCode } from "../../../../core/twilio/verifyPhone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const phone = body?.phone;
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
  }

  try {
    await sendVerificationCode(phone);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Erreur envoi code de vérification:", err);
    return NextResponse.json({ error: "Impossible d'envoyer le code. Vérifiez le numéro saisi." }, { status: 500 });
  }
}
