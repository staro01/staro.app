export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // pas configuré = pas de protection (à éviter en prod)

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}
