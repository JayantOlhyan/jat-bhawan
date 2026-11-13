import Image from "next/image";
import { demoImage } from "@/lib/demo-images";

/**
 * A picture slot. The client's own photo in public/demo/<slot>.(jpg|png|webp…)
 * always wins; otherwise a credited library stand-in is shown. With neither,
 * nothing renders, so a page never shows an empty box.
 */
export function Slot({
  slot,
  alt,
  standIn,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  objectPosition,
}: {
  slot: string;
  /** What the client's own photo should show (also its alt text). */
  alt: string;
  standIn?: { src: string; alt: string };
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  const own = demoImage(slot);
  const src = own ?? standIn?.src;
  if (!src) return null;
  return (
    <div data-slot={slot} data-alt={alt} className={`outline outline-1 -outline-offset-1 outline-ink/10 ${className}`}>
      <Image
        src={src}
        alt={own ? alt : (standIn?.alt ?? alt)}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}

export const STAND_INS = {
  harvest: {
    src: "/library/harvest.jpg",
    alt: "A woman carrying cut wheat sheaves across a harvested field",
  },
} as const;
