import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { checkVerificationCode } from "../../../../core/twilio/verifyPhone";
import { normPhone } from "../../../../core/twilio/incoming";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const phone = body?.phone;
  const code = body?.code;
  if (!phone || !code) {
    return NextResponse.json({ error: "Numéro et code requis." }, { status: 400 });
  }

  try {
    const approved = await checkVerificationCode(phone, code);
    if (!approved) {
      return NextResponse.json({ error: "Code incorrect ou expiré." }, { status: 400 });
    }

    const normalized = normPhone(phone);

    const business = await prisma.business.findUnique({ where: { clerkUserId: user.id } });
    if (business) {
      await prisma.business.update({
        where: { id: business.id },
        data: { phone: normalized, phoneVerified: true },
      });
    }

    // Enregistre ce numéro dans le registre global (sans marquer trialUsed pour l'instant —
    // ça ne sera fait qu'au moment où un essai gratuit est réellement consommé, au paiement).
    await prisma.verifiedPhone.upsert({
      where: { phone: normalized },
      update: {},
      create: { phone: normalized, businessId: business?.id },
    });

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Erreur vérification code:", err);
    return NextResponse.json({ error: "Erreur lors de la vérification." }, { status: 500 });
  }
}
