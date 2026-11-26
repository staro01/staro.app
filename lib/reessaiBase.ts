/**
 * Réessais quand la base Neon ne répond pas encore. La nuit, la base est en veille ;
 * son réveil dépasse parfois le délai de connexion de Prisma (« Can't reach database
 * server », code P1001). On réessaie après quelques secondes au lieu d'échouer.
 */
const CODES_RESEAU = new Set(["P1001", "P1002", "P1017"]);

export function erreurDeConnexion(err: unknown): boolean {
  const e = err as { code?: string; errorCode?: string; message?: string } | null;
  const code = e?.code ?? e?.errorCode;
  if (code && CODES_RESEAU.has(code)) return true;
  return /Can't reach database server|Timed out fetching a new connection|Server has closed the connection/i.test(e?.message ?? "");
}

export async function avecReessais<T>(fn: () => Promise<T>, attentesMs: number[] = [3000, 10000, 20000]): Promise<{ resultat: T; essais: number }> {
  for (let i = 0; ; i++) {
    try {
      return { resultat: await fn(), essais: i + 1 };
    } catch (err) {
      if (i >= attentesMs.length || !erreurDeConnexion(err)) throw err;
      await new Promise((r) => setTimeout(r, attentesMs[i]));
    }
  }
}
