import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendVerificationCode } from "../../../../core/twilio/verifyPhone";
import { isRateLimited, getClientIp } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const ip = getClientIp(req);
  // 5 tentatives max par IP par heure (anti-bot général)
  if (isRateLimited(`verify-send-ip:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const phone = body?.phone;
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
  }

  // 3 SMS max vers le même numéro par heure (anti-harcèlement d'un numéro ciblé)
  if (isRateLimited(`verify-send-phone:${phone}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de codes envoyés à ce numéro. Réessayez plus tard." }, { status: 429 });
  }

  try {
    await sendVerificationCode(phone);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Erreur envoi code de vérification:", err);
    return NextResponse.json({ error: "Impossible d'envoyer le code. Vérifiez le numéro saisi." }, { status: 500 });
  }
}
