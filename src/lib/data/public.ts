import { fyLabel } from "../fy";
import { tierFor } from "../tiers";
import type { Donation, PublicDonation, Tier } from "./types";

/** Only verified, non-void donations are ever public. */
export function isPublic(d: Donation): boolean {
  return d.status === "verified";
}

/**
 * Public-safe projection, equivalent to the future `public_donations` view.
 * Returns null for anything that must not be shown publicly.
 */
export function toPublicDonation(d: Donation, tiers: readonly Tier[]): PublicDonation | null {
  if (!isPublic(d)) return null;
  const anonymous = d.display === "anonymous";
  const hideAmount = d.display === "hide_amount";
  return {
    id: d.id,
    fundId: d.fundId,
    amountPaise: hideAmount ? null : d.amountPaise,
    donorName: anonymous ? null : d.donorName,
    donorFatherName: anonymous ? null : d.donorFatherName,
    donorVillage: anonymous ? null : d.donorVillage,
    anonymous,
    tierId: hideAmount ? null : (tierFor(d.amountPaise, tiers)?.id ?? null),
    donatedAt: d.donatedAt,
    fy: fyLabel(new Date(d.donatedAt)),
  };
}
