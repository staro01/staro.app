import twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN manquant.");
  }
  return twilio(accountSid, authToken);
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "https://www.staro.app";
  return url.replace(/\/$/, "");
}

/**
 * Recherche et achète un numéro de téléphone français disponible,
 * puis le configure avec les webhooks voice de Staro.
 * Retourne le numéro E.164 acheté (ex: +33XXXXXXXXX).
 */
export async function provisionTwilioNumber(): Promise<string> {
  const client = getClient();
  const baseUrl = getBaseUrl();

  const available = await client
    .availablePhoneNumbers("FR")
    .local.list({ limit: 5 });

  if (available.length === 0) {
    throw new Error("Aucun numéro français disponible chez Twilio en ce moment.");
  }

  const numberToBuy = available[0].phoneNumber;

  const addressSid = process.env.TWILIO_ADDRESS_SID;
  if (!addressSid) {
    throw new Error("TWILIO_ADDRESS_SID manquant — requis par Twilio pour l'achat de numéros français.");
  }

  const bundleSid = process.env.TWILIO_BUNDLE_SID;
  if (!bundleSid) {
    throw new Error("TWILIO_BUNDLE_SID manquant — requis par Twilio pour l'achat de numéros français (bundle réglementaire).");
  }

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: numberToBuy,
    voiceUrl: `${baseUrl}/api/twilio/voice/incoming`,
    voiceMethod: "POST",
    addressSid,
    bundleSid,
  });

  return purchased.phoneNumber;
}

/**
 * Libère (supprime) un numéro Twilio — utilisé quand un abonnement est
 * annulé avant toute conversion réelle (ex: essai gratuit non transformé).
 */
export async function releaseTwilioNumber(phoneNumber: string): Promise<void> {
  const client = getClient();
  const numbers = await client.incomingPhoneNumbers.list({ phoneNumber, limit: 1 });
  if (numbers.length === 0) return;
  await client.incomingPhoneNumbers(numbers[0].sid).remove();
}
