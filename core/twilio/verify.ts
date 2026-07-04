import twilio from "twilio";

/**
 * Vérifie que la requête provient bien de Twilio via le header X-Twilio-Signature.
 * Retourne true si valide, false sinon. En l'absence de TWILIO_AUTH_TOKEN configuré,
 * laisse passer (pour ne pas casser le dev local) mais log un avertissement.
 */
export async function verifyTwilioRequest(req: Request, baseUrl: string, path: string, params: Record<string, string>): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.warn("TWILIO_AUTH_TOKEN non configuré — vérification de signature ignorée (à ne pas laisser en production).");
    return true;
  }

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) return false;

  const fullUrl = `${baseUrl}${path}`;
  return twilio.validateRequest(authToken, signature, fullUrl, params);
}
