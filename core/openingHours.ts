export type DaySchedule = { open: string; close: string; dinnerOpen?: string; dinnerClose?: string; closed: boolean };

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function getParisParts(date: Date): { dayName: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value.toLowerCase() ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { dayName: weekday, minutes: hour * 60 + minute };
}

export function isOutsideHours(date: Date, openingHours: Record<string, DaySchedule> | null): boolean {
  const { dayName, minutes } = getParisParts(date);

  if (!openingHours || !openingHours[dayName]) {
    // Pas d'horaires configurés : référence par défaut 8h-19h tous les jours
    return minutes < 8 * 60 || minutes >= 19 * 60;
  }

  const schedule = openingHours[dayName];
  if (schedule.closed) return true;

  const inMainWindow = minutes >= toMinutes(schedule.open) && minutes < toMinutes(schedule.close);
  if (inMainWindow) return false;

  if (schedule.dinnerOpen && schedule.dinnerClose) {
    const inDinnerWindow = minutes >= toMinutes(schedule.dinnerOpen) && minutes < toMinutes(schedule.dinnerClose);
    if (inDinnerWindow) return false;
  }

  return true;
}
