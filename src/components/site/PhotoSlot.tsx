import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { demoImage } from "@/lib/demo-images";
import { SampleChip } from "./SampleChip";

/**
 * A rounded photo slot. The client's own photo in public/demo/<slot>.(jpg|png|webp…)
 * fills it when present; a generated `<slot>.sample.<ext>` fills it until then,
 * labelled "Sample image"; with neither it shows a quiet "photo here"
 * placeholder, so the page never looks broken. `jaali` marks it for the
 * lattice reveal (at most two on the site); `fade` for a fade-up, once.
 */
export async function PhotoSlot({
  slot,
  alt,
  label,
  className = "",
  sizes = "(min-width: 1024px) 45vw, 100vw",
  jaali = false,
  fade = false,
  objectPosition,
  preload = false,
}: {
  slot: string;
  /** What the photo shows (its alt text). */
  alt: string;
  /** Placeholder words shown when there is no image. */
  label: string;
  className?: string;
  sizes?: string;
  jaali?: boolean;
  fade?: boolean;
  /** CSS object-position, to keep the subject in frame when one image is used at two crops. */
  objectPosition?: string;
  /** Above the fold and likely the page's largest paint on phones: load it first. */
  preload?: boolean;
}) {
  const own = demoImage(slot);
  const tc = await getTranslations("Common");
  return (
    <div
      data-slot={slot}
      data-sample={own?.isSample ? "" : undefined}
      data-jaali={jaali ? "" : undefined}
      data-fade={fade ? "24" : undefined}
      className={`photo-slot ${className}`}
    >
      {own ? (
        <>
          <Image
            src={own.src}
            alt={own.isSample ? tc("sampleAlt", { alt }) : alt}
            fill
            sizes={sizes}
            preload={preload}
            fetchPriority={preload ? "high" : undefined}
            className="object-cover"
            style={objectPosition ? { objectPosition } : undefined}
          />
          {own.isSample && <SampleChip label={tc("sampleImage")} hidden />}
        </>
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
