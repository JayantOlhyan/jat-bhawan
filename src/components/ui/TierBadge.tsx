import Image from "next/image";
import { TIER_ART } from "@/lib/brand";

/**
 * A tier's medal: the badge art for the top three tiers, a CSS disc (sand
 * fill, brass or maroon ring) for the rest. Decorative: the tier name is
 * always written beside or below it, never inside. Every medal sits on the
 * same baseline in a `size`-square box; the patron medal's crest rises above.
 */
export function TierBadge({ tierId, size = 140 }: { tierId: string; size?: number }) {
  const art = TIER_ART[tierId] ?? { ring: "maroon" as const };
  // The images' discs fill 382 of 400 px; the patron disc only 310, so that image is drawn larger.
  const disc = Math.round((size * 382) / 400);
  return (
    <span aria-hidden="true" className="relative flex shrink-0 items-end justify-center" style={{ width: size, height: size }}>
      {"image" in art ? (
        <Image
          src={art.image}
          alt=""
          width={400}
          height={400}
          sizes={`${tierId === "tier-patron" ? Math.round((size * 382) / 310) : size}px`}
          className="absolute bottom-0 left-1/2 max-w-none -translate-x-1/2 drop-shadow-[0_6px_10px_rgb(94_64_30/0.25)]"
          style={tierId === "tier-patron" ? { width: Math.round((size * 382) / 310), height: "auto" } : { width: size, height: "auto" }}
        />
      ) : (
        <span
          className={`mb-[1.25%] block rounded-full border-[max(3px,0.045em)] bg-sand shadow-[inset_0_2px_6px_rgb(94_64_30/0.18),0_6px_10px_-4px_rgb(94_64_30/0.3)] ${
            art.ring === "brass" ? "border-brass" : "border-maroon"
          }`}
          style={{ width: disc, height: disc, fontSize: disc }}
        />
      )}
      <span data-sheen className="sheen rounded-full" style={{ width: disc, height: disc, inset: "auto auto 1.25% 50%", translate: "-50% 0" }}>
        <span className="sheen-bar" />
      </span>
    </span>
  );
}
