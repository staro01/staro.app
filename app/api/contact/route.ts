import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "../../../core/email/notify";
import { isRateLimited, getClientIp } from "../../../lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 3000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 5 requêtes maximum par IP toutes les 60 minutes
  if (isRateLimited(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.trim()) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const email = body.email.trim().slice(0, 254);
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  if (body.type === "newsletter") {
    await sendAdminNotification("Nouvelle inscription newsletter — Staro.app", `Email : ${email}`);
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LENGTH) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!name || !message) {
    return NextResponse.json({ error: "Nom et message requis." }, { status: 400 });
  }

  await sendAdminNotification(
    "Nouveau message de contact — Staro.app",
    `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`
  );

  return NextResponse.json({ ok: true });
}
