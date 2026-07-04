// Liste centralisée des emails admin — modifiable ici uniquement, valable pour
// le dashboard (redirection auto) et /admin (contrôle d'accès strict).
export const ADMIN_EMAILS = ["staro.ml001@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
