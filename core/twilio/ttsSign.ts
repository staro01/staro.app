import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.TWILIO_AUTH_TOKEN;
  if (!secret) {
    console.warn("TWILIO_AUTH_TOKEN non configuré — signature TTS non sécurisée (à ne pas laisser en production).");
    return "dev-only-insecure-secret";
  }
  return secret;
}

export function signTts(text: string, expiresAt: number): string {
  const secret = getSecret();
  const payload = `${text}:${expiresAt}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyTts(text: string, expiresAt: number, signature: string): boolean {
  if (Date.now() > expiresAt) return false;
  const expected = signTts(text, expiresAt);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
