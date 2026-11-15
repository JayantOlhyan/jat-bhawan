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
    <div data-slot={slot} data-alt={alt} className={className}>
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

/** Library stand-ins; pages pass the alt text in their own language. */
export const STAND_INS = {
  harvest: "/library/harvest.jpg",
} as const;
