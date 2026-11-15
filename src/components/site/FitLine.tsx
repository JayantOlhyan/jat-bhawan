"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * One line of the bill, fitted to its column: it never wraps, and once the
 * fonts load its size is set as a share of the column (`cqi`), so it keeps
 * filling the measure as the column resizes, with no script on resize. The
 * parent must be an inline-size container. Without script the line keeps
 * its CSS `fallback` size, which should itself be in `cqi`. It carries
 * `keep-motion` so the reduced-motion rule's tiny transition cannot delay the
 * size it measures.
 */
export function FitLine({
  children,
  className = "",
  max = 220,
  fallback = "var(--text-display-s)",
}: {
  children: React.ReactNode;
  className?: string;
  /** Largest size in px. */
  max?: number;
  fallback?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const cs = getComputedStyle(box);
      const target = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!w || !target) return;
      // Text width scales with font size, so one ratio holds at every column width.
      const share = (100 * 100) / w; // font size, in cqi, that fills the column
      el.style.fontSize = `min(${max}px, ${(share * 0.98).toFixed(3)}cqi)`;
    };
    fit();
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener?.("loadingdone", fit);
    // A font swap changes the line's own width: refit when it stops filling the column.
    const ro = new ResizeObserver(() => {
      const cs = getComputedStyle(box);
      const target = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (Math.abs(el.getBoundingClientRect().width - target) > 2) fit();
    });
    ro.observe(el);
    const rb = new ResizeObserver(fit);
    rb.observe(box);
    return () => {
      ro.disconnect();
      rb.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", fit);
    };
  }, [max]);

  return (
    <span ref={ref} className={`fit keep-motion ${className}`} style={{ fontSize: fallback }}>
      {children}
    </span>
  );
}
