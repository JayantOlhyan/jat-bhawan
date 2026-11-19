import { Mukta, Tiro_Devanagari_Hindi } from "next/font/google";

/**
 * Mukta carries body and UI text in both scripts, in two weights only (400 and
 * 600: medium falls back to regular, bold to semibold) to keep the font bytes down. Tiro Devanagari Hindi is
 * for H1 and H2 only (it has a Latin set too, so English pages match).
 */
export const body = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600"],
  variable: "--font-mukta",
  display: "swap",
});

export const heading = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

export const fontVariables = `${body.variable} ${heading.variable}`;
