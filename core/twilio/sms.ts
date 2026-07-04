import twilio from "twilio";

export async function sendSms(to: string, body: string, from: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.error("TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN manquant — SMS non envoyé.");
    return null;
  }
  const client = twilio(accountSid, authToken);
  return client.messages.create({ to, from, body });
}
