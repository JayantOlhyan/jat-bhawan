/**
 * Indian financial year: 1 April – 31 March, evaluated in IST (UTC+05:30).
 */

const IST_OFFSET_MS = 330 * 60 * 1000;

/** Calendar parts of an instant as seen in IST. */
export function istParts(date: Date): { year: number; month: number; day: number } {
  const d = new Date(date.getTime() + IST_OFFSET_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

/** Start year of the FY containing `date`. 2026-03-31 → 2025, 2026-04-01 → 2026. */
export function fyStartYear(date: Date): number {
  const { year, month } = istParts(date);
  return month >= 3 ? year : year - 1;
}

/** "2026-27" */
export function fyLabelFromStart(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function fyLabel(date: Date): string {
  return fyLabelFromStart(fyStartYear(date));
}

/** Inclusive start / exclusive end instants of an FY (IST boundaries). */
export function fyRange(startYear: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(startYear, 3, 1) - IST_OFFSET_MS),
    end: new Date(Date.UTC(startYear + 1, 3, 1) - IST_OFFSET_MS),
  };
}

export function isInFy(date: Date, label: string): boolean {
  return fyLabel(date) === label;
}

/** IST calendar date "YYYY-MM-DD". */
export function istDateKey(date: Date): string {
  const { year, month, day } = istParts(date);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
