/**
 * Analytics IDs come from env, so nothing loads until the Trust has accounts:
 * NEXT_PUBLIC_GA_ID (GA4, e.g. G-XXXXXXX) and NEXT_PUBLIC_CLARITY_ID (Microsoft Clarity).
 * Before turning either on, add them to the privacy policy (DPDP Act 2023).
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

type Gtag = (cmd: "event", name: string, params?: Record<string, unknown>) => void;

/** Sends a GA4 event when GA is loaded; does nothing otherwise. */
export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag?: Gtag }).gtag?.("event", name, params);
}
