import Image from "next/image";
import { demoImage } from "@/lib/demo-images";

/**
 * A rounded photo slot. The client's own photo in public/demo/<slot>.(jpg|png|webp…)
 * fills it when present; until then it shows a quiet placeholder with the
 * words "photo here", so the page never looks broken. `jaali` marks it for
 * the lattice reveal (at most two on the site).
 */
export function PhotoSlot({
  slot,
  alt,
  label,
  className = "",
  sizes = "(min-width: 1024px) 45vw, 100vw",
  jaali = false,
}: {
  slot: string;
  /** What the photo shows (its alt text once it arrives). */
  alt: string;
  /** Placeholder words shown until then. */
  label: string;
  className?: string;
  sizes?: string;
  jaali?: boolean;
}) {
  const own = demoImage(slot);
  return (
    <div data-slot={slot} data-jaali={jaali ? "" : undefined} className={`photo-slot ${className}`}>
      {own ? (
        <Image src={own} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-(--space-xs) p-(--space-md) text-center text-muted">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="size-12 text-brass" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5" y="10" width="38" height="28" rx="4" />
            <circle cx="17" cy="21" r="4" />
            <path d="M5 34l11-9 8 6 7-5 12 9" />
          </svg>
          <span className="font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}
