import { Mukta, Rozha_One } from "next/font/google";

/**
 * Two families. Rozha One is the display face: a high-contrast serif drawn for
 * Devanagari with a matching Latin, standing in for Solstice's Yeseva One
 * (which has no Devanagari). Mukta is the body face for both scripts.
 */
export const display = Rozha_One({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-rozha",
  display: "swap",
});

export const body = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});
