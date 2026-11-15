import { Hind, Sarpanch, Teko } from "next/font/google";

/**
 * Broadside's three roles, in faces that carry Devanagari as well as Latin:
 * Teko is the condensed gothic for the big lines and figures (Six Caps' role),
 * Sarpanch the slab for heads and the wordmark (Bevan's), Hind the reading
 * face (Archivo Narrow's). Three weights: Hind at 400 and 500, the display faces at 600.
 */
export const display = Teko({
  subsets: ["devanagari", "latin"],
  weight: "600",
  variable: "--font-teko",
  display: "swap",
});

export const slab = Sarpanch({
  subsets: ["devanagari", "latin"],
  weight: "600",
  variable: "--font-sarpanch",
  display: "swap",
});

export const body = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hind",
  display: "swap",
});
