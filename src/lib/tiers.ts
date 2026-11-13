import type { Tier } from "./data/types";

/** Highest tier whose minimum the amount meets. Tiers may be passed in any order. */
export function tierFor(amountPaise: number, tiers: readonly Tier[]): Tier | null {
  const sorted = [...tiers].sort((a, b) => b.minAmountPaise - a.minAmountPaise);
  return sorted.find((t) => amountPaise >= t.minAmountPaise) ?? null;
}

/** Tiers ordered for display (highest first). */
export function sortTiers(tiers: readonly Tier[]): Tier[] {
  return [...tiers].sort((a, b) => a.sortOrder - b.sortOrder);
}
