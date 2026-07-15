// Liste centralisée des emails admin et commercial — modifiable ici uniquement.
// Admin = accès complet à /admin. Commercial = accès uniquement à /admin/demo.
export const ADMIN_EMAILS = ["staro.ml001@gmail.com"];
export const COMMERCIAL_EMAILS: string[] = ["admin.staro.loan@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

export function isCommercialEmail(email?: string | null): boolean {
  if (!email) return false;
  return COMMERCIAL_EMAILS.includes(email);
}

export function isAdminOrCommercialEmail(email?: string | null): boolean {
  return isAdminEmail(email) || isCommercialEmail(email);
}
