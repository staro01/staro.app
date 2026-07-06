import { sendAdminNotification } from "../email/notify";
import { isRateLimited } from "../../lib/rateLimit";

export async function notifyCriticalError(context: string, error: unknown) {
  // Limite à 1 email par contexte d'erreur toutes les 15 minutes, pour éviter le spam en cas d'erreur répétée
  if (isRateLimited(`error-alert:${context}`, 1, 15 * 60 * 1000)) {
    console.error(`[${context}] Erreur (email déjà envoyé récemment):`, error);
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack ?? "" : "";

  console.error(`[${context}] Erreur critique:`, error);

  await sendAdminNotification(
    `⚠️ Erreur Staro.app — ${context}`,
    `Une erreur critique est survenue.\n\nContexte : ${context}\nMessage : ${message}\n\n${stack.slice(0, 2000)}`
  ).catch(() => {});
}
