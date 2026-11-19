"use client";

import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DUR, earlyEnoughForIntro, EASE, lowPower, MQ, STAGGER } from "@/lib/motion";

/**
 * Motion for the home hero (markup in Hero.tsx). Nothing here hides content
 * in the server HTML: the intro runs only if hydration is early, the H1 is
 * unmasked rather than faded, and reduced motion gets no movement at all.
 */
export function HeroMotion() {
  useGSAP(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const q = gsap.utils.selector(hero);
    const heavy = !lowPower();
    const intro = earlyEnoughForIntro();
    const mm = gsap.matchMedia();

    mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean; mobile: boolean };

      // 1. Intro: headline lines rise out of their mask (desktop, SplitText on lines only:
      //    never characters, which would break conjuncts and matras), then the inauguration line and buttons fade up (the subtext never fades: on phones it is the LCP).
      if (intro) {
        const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
        if (desktop) {
          const split = SplitText.create(q("[data-hero-title] > span.block"), { type: "lines", mask: "lines", linesClass: "hero-line" });
          tl.from(split.lines, { yPercent: 105, duration: DUR.medium, stagger: STAGGER.lines });
        }
        tl.from(q("[data-hero-sub]"), { y: 16, opacity: 0, duration: DUR.medium, stagger: STAGGER.cards, clearProps: "opacity,transform" }, desktop ? "-=0.35" : 0);
      }

      // 2. Diya flames: a glow over each flame breathes on its own 2–3 s loop.
      if (heavy) {
        q("[data-diya-glow]").forEach((glow) => {
          gsap.to(glow, {
            opacity: gsap.utils.random(0.45, 0.6),
            scale: gsap.utils.random(0.82, 0.9),
            duration: gsap.utils.random(1, 1.5),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: gsap.utils.random(0, 1.2),
          });
        });
      }

      // 3. Scroll depth: bg drifts at 0.2×, the building / frame at 0.5×, the diyas at 1.2×
      //    (phones at ~40% of that), and the building shrinks a touch as the hero leaves.
      if (heavy) {
        const depth = desktop ? 1 : 0.4;
        const speed = (s: number) => (1 - s) * depth;
        const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
        const tl = gsap.timeline({ scrollTrigger: scrub, defaults: { ease: "none" } });
        const h = () => hero.offsetHeight;
        tl.to(q("[data-hero-bg]"), { y: () => speed(0.2) * h() }, 0)
          .to(q("[data-hero-mid]"), { y: () => speed(0.5) * h(), scale: 0.94, transformOrigin: "50% 100%" }, 0)
          .to(q("[data-hero-fg]"), { y: () => speed(1.2) * h() }, 0);
      }

      // 4. Desktop: the art tilts a little toward the pointer (±4°).
      if (desktop && heavy) {
        const stack = q("[data-hero-tilt]")[0];
        gsap.set(stack, { transformPerspective: 1200 });
        const rx = gsap.quickTo(stack, "rotationX", { duration: DUR.medium, ease: EASE.enter });
        const ry = gsap.quickTo(stack, "rotationY", { duration: DUR.medium, ease: EASE.enter });
        const move = (e: PointerEvent) => {
          const r = hero.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        };
        const reset = () => { rx(0); ry(0); };
        hero.addEventListener("pointermove", move);
        hero.addEventListener("pointerleave", reset);
        return () => {
          hero.removeEventListener("pointermove", move);
          hero.removeEventListener("pointerleave", reset);
        };
      }
    });

    return () => mm.revert();
  });

  return null;
}
