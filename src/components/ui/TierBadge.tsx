import type { Tier } from "@/lib/data/types";
import { pick, type AppLocale } from "@/lib/format";

const STYLES: Record<string, string> = {
  "tier-patron": "bg-accent text-accent-ink border-accent",
  "tier-grand": "bg-paper-3 text-accent-deep border-ink",
  "tier-benefactor": "bg-paper-3 text-ink border-ink",
  "tier-supporter": "bg-paper-3 text-ink border-ink",
  "tier-donor": "bg-paper-2 text-ink-2 border-rule",
};

/** Tier label badge. Colour is decorative; the text label carries the meaning. */
export function TierBadge({ tier, locale }: { tier: Tier; locale: AppLocale }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.85rem] font-semibold leading-6 ${
        STYLES[tier.id] ?? STYLES["tier-donor"]
      }`}
    >
      <span aria-hidden="true">◆</span>
      {pick(locale, tier.nameHi, tier.nameEn)}
    </span>
  );
}
