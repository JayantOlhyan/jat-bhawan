/** Motion tokens. Every tween takes its duration, ease and stagger from here. */
/** `slide` is the hall calendar's month change, set at 0.35 s by the brief. */
export const DUR = { short: 0.25, slide: 0.35, medium: 0.6, long: 1.0, maxSequence: 1.4 } as const;

export const EASE = {
  enter: "power3.out",
  transition: "power2.inOut",
  celebrate: "back.out(1.4)",
} as const;

export const STAGGER = { cards: 0.06, words: 0.04, lines: 0.08 } as const;

/** gsap.matchMedia() conditions shared by every animated component. */
export const MQ = {
  reduce: "(prefers-reduced-motion: reduce)",
  motion: "(prefers-reduced-motion: no-preference)",
  mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
  desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px) and (hover: hover)",
} as const;

/** Phones with four cores or fewer skip parallax, tilt and particle effects. */
export function lowPower(): boolean {
  return typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
}

/**
 * True while the page is still within its first second or so: an intro that
 * starts later than this would make text that is already on screen blink out,
 * so it is skipped.
 */
export function earlyEnoughForIntro(limitMs = 1500): boolean {
  return typeof performance !== "undefined" && performance.now() < limitMs;
}
