"use client";

import Image from "next/image";
import { useState } from "react";
import { BrassRule } from "@/components/site/BrassRule";
import { SampleChip } from "@/components/site/SampleChip";
import { Modal } from "@/components/ui/Modal";

/** Below 1024px the grid is 2 across, and an odd last tile spans both columns. */
const fullWidthBelowLg = (i: number, n: number) => i === n - 1 && n % 2 === 1;

export type GalleryItem = { slot: string; src: string; isSample: boolean; alt: string; caption: string };

/**
 * Hall photos under the details list. Each thumbnail is a button that opens
 * the large photo in the shared Modal (native <dialog>: focus trap, Esc, and
 * focus goes back to the thumbnail on close). Only slots with a file are
 * passed in, so there are never empty boxes. The list rises in via SiteMotion
 * ([data-rise]).
 */
export function HallGallery({
  title,
  items,
  sampleLabel,
  closeLabel,
  className = "",
}: {
  title: string;
  items: GalleryItem[];
  sampleLabel: string;
  closeLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState<GalleryItem | null>(null);
  if (!items.length) return null;
  return (
    <section aria-labelledby="hall-gallery" className={`mt-(--space-xl) ${className}`}>
      <h2 id="hall-gallery">{title}</h2>
      <BrassRule align="start" className="mt-(--space-sm)" />
      <ul
        data-rise="24"
        className="mt-(--space-md) grid grid-cols-2 gap-(--space-sm) lg:grid-cols-3 [&>li:last-child:nth-child(odd)]:col-span-2 lg:[&>li:last-child:nth-child(odd)]:col-span-1"
      >
        {items.map((item, i) => (
          <li key={item.slot}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              aria-haspopup="dialog"
              className="photo-slot group block aspect-[4/3] w-full cursor-zoom-in shadow-(--shadow-raised) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-maroon"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={`(min-width: 1320px) 220px, (min-width: 1024px) 17vw, ${fullWidthBelowLg(i, items.length) ? "100vw" : "50vw"}`}
                className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]"
              />
              {item.isSample && <SampleChip label={sampleLabel} small hidden />}
            </button>
          </li>
        ))}
      </ul>
      <Modal open={open !== null} title={title} onClose={() => setOpen(null)} wide closeLabel={closeLabel}>
        {open && (
          <figure>
            <div className="photo-slot aspect-[4/3] w-full">
              <Image src={open.src} alt={open.alt} fill sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
              {open.isSample && <SampleChip label={sampleLabel} hidden />}
            </div>
            <figcaption className="mt-(--space-sm) text-ink-soft">{open.caption}</figcaption>
          </figure>
        )}
      </Modal>
    </section>
  );
}
