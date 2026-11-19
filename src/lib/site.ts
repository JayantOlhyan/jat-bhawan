/**
 * Launch switch. The demo stays out of search engines (noindex, robots
 * Disallow). Set NEXT_PUBLIC_SITE_INDEXABLE=true (and NEXT_PUBLIC_SITE_URL to
 * the real domain) only once the placeholder data is replaced, then rebuild:
 * robots.txt opens to search and AI crawlers, pages drop noindex.
 */
export const SITE_INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

/** Absolute site address: NEXT_PUBLIC_SITE_URL, else Netlify's URL, else localhost. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Public, indexable pages (both locales). Receipts, the payment success page and admin stay out. */
export const PUBLIC_PATHS = ["", "/donate", "/donors", "/hall", "/committee", "/members", "/about", "/contact", "/privacy", "/terms", "/refund"] as const;

/** Robots meta for public pages. */
export const pageRobots = SITE_INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };
