"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatINR } from "@/lib/money";
import { DUR, EASE, MQ } from "@/lib/motion";

/**
 * A rupee amount (Indian grouping) that counts to its new value when it
 * changes. The server HTML and reduced motion show the final value at once.
 */
export function AnimatedAmount({ paise, className = "" }: { paise: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(paise);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const from = shown.current;
      shown.current = paise;
      if (from === paise) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const n = { v: from / 100 };
        gsap.to(n, {
          v: paise / 100,
          duration: DUR.short,
          ease: EASE.enter,
          onUpdate: () => { setText(el, formatINR(Math.round(n.v) * 100)); },
          onComplete: () => { setText(el, formatINR(paise)); },
        });
        return () => { setText(el, formatINR(paise)); };
      });
      return () => mm.revert();
    },
    { dependencies: [paise] },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {formatINR(paise)}
    </span>
  );
}

/** Writes into the existing text node, so React keeps owning it. */
function setText(el: HTMLElement, text: string) {
  if (el.firstChild) el.firstChild.nodeValue = text;
}

/** Press feedback for a chip or button: 0.96 → 1 with a small overshoot. Skipped under reduced motion. */
export function press(el: Element) {
  if (window.matchMedia(MQ.reduce).matches) return;
  gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: DUR.short, ease: EASE.celebrate, clearProps: "transform" });
}
