"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, lowPower, MQ, STAGGER } from "@/lib/motion";

/**
 * Page-level motion, wired by data attributes so server components stay
 * server components:
 *  - [data-draw]    an SVG line that draws itself at 70% in view, once (BrassRule)
 *  - [data-rise]    a list whose children rise in, staggered, once
 *  - [data-lift]    desktop hover: lift + a brass sheen ([data-sheen] inside)
 *  - [data-jaali]   a lattice of ivory tiles, added here, that falls away (two on the site)
 * plus a 0.2 s fade of <main> on client-side route changes.
 * Re-runs on every route; useGSAP reverts everything on the way out.
 */
export function SiteMotion() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useGSAP(
    () => {
      const main = document.getElementById("main");
      if (!main) return;
      const mm = gsap.matchMedia();
      // A real route change (not the first render, nor Strict Mode running this twice).
      const navigated = lastPath.current !== null && lastPath.current !== pathname;
      lastPath.current = pathname;

      mm.add(MQ.motion, () => {
        // Route change: a short fade that never delays navigation.
        if (navigated) gsap.fromTo(main, { opacity: 0.6 }, { opacity: 1, duration: 0.2, ease: EASE.transition, clearProps: "opacity" });

        // Only what is still below the fold animates; what the reader already sees stays put.
        const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9;

        main.querySelectorAll<SVGLineElement>("[data-draw]").forEach((line) => {
          if (!below(line)) return;
          gsap.from(line, {
            drawSVG: "0%",
            duration: DUR.long,
            ease: EASE.enter,
            scrollTrigger: { trigger: line, start: "top 70%", once: true },
          });
        });

        main.querySelectorAll<HTMLElement>("[data-rise]").forEach((list) => {
          const items = Array.from(list.children).filter(below);
          if (!items.length) return;
          gsap.from(items, {
            y: 28,
            opacity: 0,
            duration: DUR.medium,
            ease: EASE.enter,
            stagger: STAGGER.cards,
            scrollTrigger: { trigger: list, start: "top 85%", once: true },
          });
        });

        const lattices: HTMLElement[] = [];
        if (!lowPower()) {
          main.querySelectorAll<HTMLElement>("[data-jaali]").forEach((box) => {
            if (!below(box)) return;
            const lattice = document.createElement("div");
            lattice.setAttribute("aria-hidden", "true");
            lattice.className = "pointer-events-none absolute inset-0 z-[2] grid grid-cols-6 grid-rows-4";
            const tiles: HTMLElement[] = [];
            for (let i = 0; i < 24; i++) {
              const tile = document.createElement("span");
              tile.className = "block bg-ivory";
              tile.style.clipPath = "polygon(50% -2%, 102% 50%, 50% 102%, -2% 50%)";
              tile.style.transform = "scale(2.05)";
              lattice.appendChild(tile);
              tiles.push(tile);
            }
            box.appendChild(lattice);
            lattices.push(lattice);
            gsap.to(tiles, {
              scale: 0,
              duration: DUR.medium,
              ease: EASE.transition,
              stagger: { each: STAGGER.words, grid: [4, 6], from: "center" },
              scrollTrigger: { trigger: box, start: "top 75%", once: true },
              onComplete: () => lattice.remove(),
            });
          });
        }
        return () => lattices.forEach((l) => l.remove());
      });

      mm.add(MQ.desktop, () => {
        const cleanups: Array<() => void> = [];
        main.querySelectorAll<HTMLElement>("[data-lift]").forEach((el) => {
          const sheen = el.querySelector<HTMLElement>("[data-sheen] .sheen-bar");
          const enter = () => {
            gsap.to(el, { rotateX: 6, scale: 1.02, y: -4, transformPerspective: 800, duration: DUR.short, ease: EASE.enter });
            if (sheen) gsap.fromTo(sheen, { xPercent: 0 }, { xPercent: 420, duration: DUR.medium, ease: EASE.transition });
          };
          const leave = () => gsap.to(el, { rotateX: 0, scale: 1, y: 0, duration: DUR.short, ease: EASE.enter });
          el.addEventListener("pointerenter", enter);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointerenter", enter);
            el.removeEventListener("pointerleave", leave);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
