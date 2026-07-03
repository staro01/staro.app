const TZ = "Europe/Paris";

// Convertit une heure "locale Paris" sans offset (ex: "2026-07-03T18:00:00")
// en véritable instant UTC, en tenant compte de l'heure d'été/hiver.
export function parisLocalToUtc(localIso: string): Date {
  const naive = localIso.replace(/Z$/, "");
  const asUTC = new Date(naive + "Z").getTime();
  const tzString = new Date(asUTC).toLocaleString("en-US", { timeZone: TZ });
  const utcString = new Date(asUTC).toLocaleString("en-US", { timeZone: "UTC" });
  const offset = new Date(utcString).getTime() - new Date(tzString).getTime();
  return new Date(asUTC + offset);
}

export function formatParisDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}

export function formatParisTime(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ, hour12: false });
}

export function parisDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

export function parisWeekday(d: Date): number {
  const key = d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" });
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[key] ?? 0;
}
