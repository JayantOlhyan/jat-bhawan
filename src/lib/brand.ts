/**
 * The one place that names files under public/brand/. Components import from
 * here, so swapping an icon or a badge is a one-line change.
 */
const BASE = "/brand";

export const brand = {
  heroBg: `${BASE}/hero-bg.webp`,
  heroFg: `${BASE}/hero-fg.webp`,
  /**
   * hero-fg.webp is a 2880 × 1621 transparent layer that is empty apart from
   * two parts. The page draws only those two crops (cut from it at these
   * pixel boxes), placed back at the same spot: far fewer bytes, and a
   * transparent full-width box never becomes the page's largest paint.
   * To change the art, replace hero-fg.webp and re-cut the two crops.
   */
  heroFgParts: [
    { src: `${BASE}/hero-fg-diyas.webp`, box: [1530, 1390, 2736, 1621] },
    { src: `${BASE}/hero-fg-strand.webp`, box: [2672, 0, 2780, 400] },
  ] as const,
  /**
   * Cut-out render or photo of the building. next.config.ts checks at build
   * time whether public/brand/hero-building.webp exists; null shows the
   * arched placeholder frame instead.
   */
  heroBuilding: process.env.NEXT_PUBLIC_HERO_BUILDING || null,
} as const;

export const heroBuilding: string | null = brand.heroBuilding;

export const ICONS = {
  diya: `${BASE}/icons/diya.webp`,
  kalash: `${BASE}/icons/kalash.webp`,
  toran: `${BASE}/icons/toran.webp`,
  receipt: `${BASE}/icons/receipt.webp`,
  calendar: `${BASE}/icons/calendar.webp`,
  coinOffering: `${BASE}/icons/coin-offering.webp`,
  wheat: `${BASE}/icons/wheat.webp`,
} as const;
export type IconName = keyof typeof ICONS;

/**
 * Badge art per tier id. The top three tiers have images; the rest are drawn
 * in CSS (see TierBadge), with the ring colour given here.
 */
export const TIER_ART: Record<string, { image: string } | { ring: "brass" | "maroon" }> = {
  "tier-patron": { image: `${BASE}/tiers/tier-1.webp` },
  "tier-grand": { image: `${BASE}/tiers/tier-2.webp` },
  "tier-benefactor": { image: `${BASE}/tiers/tier-3.webp` },
  "tier-supporter": { ring: "brass" },
  "tier-donor": { ring: "maroon" },
};

/**
 * Where the six diya flames sit in hero-fg.webp, as fractions of the image
 * (2880 × 1621). The flicker glows are placed on these points.
 */
export const HERO_FG_SIZE = { width: 2880, height: 1621 } as const;
export const DIYA_FLAMES = [0.5625, 0.633, 0.7035, 0.776, 0.8465, 0.917].map((x) => ({ x, y: 0.885 }));
