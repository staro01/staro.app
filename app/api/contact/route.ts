import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "../../../core/email/notify";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.trim()) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const email = body.email.trim();

  if (body.type === "newsletter") {
    await sendAdminNotification("Nouvelle inscription newsletter — Staro.app", `Email : ${email}`);
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!name || !message) {
    return NextResponse.json({ error: "Nom et message requis." }, { status: 400 });
  }

  await sendAdminNotification(
    "Nouveau message de contact — Staro.app",
    `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`
  );

  return NextResponse.json({ ok: true });
}
