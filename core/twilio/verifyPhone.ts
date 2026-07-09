import twilio from "twilio";
import { normPhone } from "./incoming";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN manquant.");
  }
  return twilio(accountSid, authToken);
}

function getServiceSid() {
  const sid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid) throw new Error("TWILIO_VERIFY_SERVICE_SID manquant.");
  return sid;
}

export async function sendVerificationCode(phone: string) {
  const client = getClient();
  const normalized = normPhone(phone);
  if (!normalized) throw new Error("Numéro de téléphone invalide.");

  return client.verify.v2
    .services(getServiceSid())
    .verifications.create({ to: normalized, channel: "sms" });
}

export async function checkVerificationCode(phone: string, code: string) {
  const client = getClient();
  const normalized = normPhone(phone);
  if (!normalized) throw new Error("Numéro de téléphone invalide.");

  const result = await client.verify.v2
    .services(getServiceSid())
    .verificationChecks.create({ to: normalized, code });

  return result.status === "approved";
}
