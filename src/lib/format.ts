/** Locale-aware display helpers. Digits stay Latin in both locales. */

export type AppLocale = "hi" | "en";

export const intlLocale = (l: AppLocale) => (l === "hi" ? "hi-IN-u-nu-latn" : "en-IN");

export function pick<T>(locale: AppLocale, hi: T, en: T): T {
  return locale === "hi" ? hi : en;
}

export function formatDate(locale: AppLocale, iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...opts,
  }).format(new Date(iso));
}

/** Formats a calendar date string "YYYY-MM-DD" without timezone drift. */
export function formatDay(locale: AppLocale, date: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  }).format(new Date(`${date}T00:00:00Z`));
}

export function relativeTime(locale: AppLocale, iso: string, now: number): string {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 45) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSec / (86400 * 365)), "year");
}

export function initials(name: string): string {
  const parts = name.replace(/^(late|sh\.|smt\.|स्व\.|श्री)\s*/i, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => Array.from(p)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** wa.me link. Uses the number only when it is a real 10-digit mobile. */
export function whatsappLink(text: string, phone?: string): string {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const target = digits.length === 10 ? `91${digits}` : "";
  return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
}

export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Jat Bhawan Najafgarh New Delhi");

/**
 * A stored payment reference in the page's language: the cash-book page, the
 * old register entry and the UTR label are words; the numbers and gateway ids
 * are identifiers and stay as they are.
 */
export function formatPaymentRef(locale: AppLocale, ref: string | undefined): string {
  if (!ref) return "";
  if (locale === "en") return ref;
  return ref
    .replace(/^Cash book p\.\s*(\d+)$/, "रोकड़ बही, पृष्ठ $1")
    .replace(/^Register (\d{4}\/\d+)$/, "पुराना रजिस्टर $1")
    .replace(/^UTR(\d+)$/, "यूटीआर $1");
}

/** A trust detail still marked "(placeholder)", with the marker in the page's language. */
export function formatPlaceholderMark(locale: AppLocale, value: string): string {
  return value.replace(/\s*\(placeholder\)$/, locale === "hi" ? " [प्लेसहोल्डर]" : " [placeholder]");
}
