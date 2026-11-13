import type { PublicBookingDay } from "./data/repos";
import type { BookingSlot } from "./data/types";

export type DayStatus = "available" | "booked" | "partial" | "tentative";

export const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Local "today" key in IST. */
export function todayKeyIST(now = new Date()): string {
  const d = new Date(now.getTime() + 330 * 60000);
  return dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Weeks (Mon-first) covering the month; null for padding cells. */
export function monthGrid(year: number, month: number): Array<Array<string | null>> {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: Array<string | null> = [...Array(lead).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(dayKey(year, month, d));
  while (cells.length % 7) cells.push(null);
  const weeks: Array<Array<string | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function dayStatus(entries: PublicBookingDay[]): DayStatus {
  const confirmed = entries.filter((e) => e.status === "confirmed").map((e) => e.slot);
  if (confirmed.includes("full") || (confirmed.includes("morning") && confirmed.includes("evening"))) return "booked";
  if (confirmed.length) return "partial";
  if (entries.some((e) => e.status === "tentative")) return "tentative";
  return "available";
}

/** Is a slot on this day already taken by a confirmed booking? */
export function slotTaken(entries: PublicBookingDay[], slot: BookingSlot): boolean {
  return entries.some((e) => e.status === "confirmed" && (e.slot === "full" || slot === "full" || e.slot === slot));
}
