# UI/UX + motion pass

Restyle of the working demo to the reference mockups in `docs/design/reference/`, with GSAP motion. No routes, data, schemas, money/receipt/tier logic or i18n meanings change. The mockups use placeholder bars, so layout, spacing, hierarchy, colour and material are copied, never text.

## Baseline (before this pass, commit 9921b3e)

| Check | Result |
|---|---|
| typecheck, lint | pass |
| Vitest | 67 / 67 pass (5 files) |
| `next build` | pass |
| Playwright smoke + language | 59 / 59 pass |
| Lighthouse mobile `/hi` | Performance 95 · Accessibility 100 · CLS 0.142 · LCP 0.9 s · TBT 30 ms |
| Lighthouse mobile `/hi/donate` | Performance 100 · Accessibility 100 · CLS 0 · LCP 0.9 s · TBT 0 ms |

## Tokens (Tailwind v4 `@theme` in `src/app/globals.css`, defined once)

Colour: `ivory #F7F1E6` (page) · `sand #E9DCC4` (wells, strips, chips) · `surface #FBF7EF` (raised cards) · `ink #1E1A17` (body) · `ink-soft #4A3F37` (secondary) · `muted #655748` (small print; AA on ivory and sand) · `maroon #7A1F1F` (primary, headings, active) · `maroon-hover #5F1717` · `brass #B08D57` (rules, borders, badges, focus accents only, never text) · `line` = brass at 60% (1px borders) · `success #2F6B3A` · `error #A3261F` · `warn #7A5512`, each with a tint.

Type: Mukta 400/500/600/700 (Devanagari + Latin) for body and UI; Tiro Devanagari Hindi for H1/H2 only. Body 17px, Devanagari line-height 1.7, headings 1.3. Latin digits everywhere (unchanged).

Shape: `--radius-card 12px` (inputs, cards), `--radius-pill 999px` (buttons, chips). One warm shadow, `--shadow-raised`, on raised cards only.

Spacing: one rhythm, `--section-gap` 96px desktop / 64px tablet / 48px phone. Tap targets ≥ 44px. Focus ring: 2px maroon outline, 2px offset, on every interactive element.

Ornament: `<BrassRule />` (thin brass line with a short centred maroon bar), between home sections and under H2s; a `number` variant (brass dot + number at the left) for the donate steps.

The old Broadside names are renamed, not aliased: `paper → ivory`, `paper-2 → surface`, `paper-3 → sand`, `ink-2 → ink-soft`, `rule → line`, `accent → maroon`, `accent-deep → maroon-hover`, `accent-ink → ivory`, `accent-tint → sand`, `bad → error`, `ok → success`. Teko / Sarpanch / Hind are removed.

## Assets

`src/lib/brand.ts` is the one place that names `/brand/...` paths, the icon map, the tier-badge map and `heroBuilding` (`public/brand/hero-building.webp` checked at build time; `null` today). Every image goes through `next/image` with `sizes`. Mockup PNGs stay in `docs/` and are never served.

## Per page

- **Header (public):** sticky ivory bar; round logo placeholder + name; nav; maroon pill Donate always visible (also on phones, beside the menu button); language toggle as text `हिंदी | English`, current one bold + underlined. Phone menu: full-height sheet, Donate first, large links.
- **Home:** (1) layered hero: `hero-bg` full bleed, optional `hero-building`, else a brass jharokha-arch frame holding the existing "भवन की फोटो यहाँ" placeholder; `hero-fg` diyas + marigold strand in front; left column H1 (2 lines), one subtext line, Donate (solid) + Book the hall (outline); inauguration date as a small line above the H1. Fixed-height container (from viewport width) so nothing shifts. Phone: text, then the art box. (2) CSS brass rail with lotus SVG ends, title on it; donation cards below (diya icon, name or गुप्त दान, village, amount, relative time), a snap-scrolling row on phones, four across on desktop. (3) Tier badges: three images + two CSS circles, name and threshold below, bottom-aligned. (4) History text + rounded photo placeholder. (5) Committee: three cards, initials avatar. (6) Hall teaser card with the calendar icon. (7) Map placeholder + contact rows with small maroon line icons. (8) Maroon footer.
- **Donate:** diya above a centred H1; three numbered sections: (1) fund + 3-column grid of the 8 presets and a custom-amount cell; (2) details, "(वैकल्पिक / optional)" set lighter; (3) display choice as a segmented control, consent, lock + one reassurance line. Selected chip: maroon fill, ivory text, soft brass glow. Phones: the submit button becomes a sticky bottom pay bar ("₹2,100 दान करें" + diya), page padded by its height. Desktop: ≤ 640px centred column, the button at the end, a summary card beside it from 1024px. Errors appear instantly; React Hook Form focuses the first invalid field.
- **Donate success:** large diya, H1, subtext, brass-bordered receipt card with the number, View / Print (maroon), WhatsApp share (outline, generic chat icon).
- **Donor wall / Members / Committee:** tokens, page-header pattern, cards. Donor groups get the tier badge at small size. Donor filters: sticky bar on desktop; on phones a "Filters" button opens a bottom sheet (same GET form, so it still works with no JS, where it simply shows inline).
- **Hall:** desktop photo placeholder + details left, calendar + enquiry right; stacked on phones. Booked = maroon fill + ivory text; tentative = 2px brass outline; available = ivory + 1px grey-ink outline; partial keeps its diagonal. Every cell keeps its text mark and aria-label; the legend shows swatches.
- **Receipt / print:** tokens only; no motion, no decorative images; print CSS stays plain.
- **Admin:** tokens (colours, fonts) only. No motion, no ornament.
- **Global:** page header = H1 + one intro line + BrassRule; translated empty / loading / error states in token styles.

## Motion (GSAP 3.15 + @gsap/react)

`src/lib/motion.ts` holds the tokens (durations 0.25 / 0.6 / 1.0 s, max sequence 1.4 s; eases `power3.out`, `power2.inOut`, `back.out(1.4)`; stagger 0.06 cards / 0.04 words) and `src/lib/gsap.ts` registers ScrollTrigger, SplitText, DrawSVGPlugin once, client-only. Every effect runs inside `gsap.matchMedia()`: reduced motion → nothing (final state); ≤ 767px → parallax at ~40%, no tilt, no SplitText; ≥ 768px + hover → full set; `hardwareConcurrency ≤ 4` skips the heavy ones. Only transform and opacity (and SVG stroke for DrawSVG). `ScrollTrigger.refresh()` after `document.fonts.ready`. Nothing is hidden in the server HTML; `from` tweens start after hydration, and the hero intro is skipped if hydration is late, so text never blinks out.

1. Hero: H1 lines rise out of a mask (SplitText lines, desktop only), then subtext and buttons fade up. Diya glows flicker (2–3 s, random per diya, on a glow element, not the image). Scroll scrub: bg 0.2×, frame 0.5×, fg 1.2×; frame scales to 0.94 as the hero leaves. Desktop pointer tilt ±4°, perspective 1200px, `quickTo`.
2. BrassRule under each H2 draws itself at 70% in view, once.
3. Ticker: a new card slides in, a brass sheen sweeps it once, its diya lights, the amount counts up with Indian grouping. Paused on hover / focus. A separate polite live region announces the new donation.
4. Tier badges and cards: staggered rise on enter (only for items below the fold at load). Desktop hover: lift (rotateX 6°, scale 1.02) + sheen.
5. Donate chips: press scale 0.96 → 1 (`back.out`). Pay-bar amount counts to the new value in 0.25 s.
6. Donate success, the one signature moment: toran swings in (−8° → 0, `back.out`), ~30 marigold petals fall (DOM, ≤ 1.5 s, then removed), the diya glow lights, the receipt number types in.
7. Hall calendar: month change slides (xPercent ±8 + opacity, 0.35 s).
8. Jaali reveals, two only: home history placeholder and hall photo placeholder (a lattice of ivory tiles scaled away; the tiles are added by script, so no-JS shows the content).
9. Route change: 0.2 s fade of `<main>` from 0.6 → 1, never delaying navigation.

Not animated: typing, errors, the language toggle, the sticky Donate button, admin, the receipt / print view.

## Content decisions

- The home "donation slip" (amount grid) and the vermilion opening band are replaced by the reference layout; `/donate?amount=` still pre-fills. The inauguration date stays, above the H1.
- The library stand-in photo (a real person, Wikimedia) is removed from Home and About in favour of the placeholder frame, per "no real people's photos"; the footer photo credit goes with it. `public/demo/story.jpg` / `hall.jpg` still drop straight in.
- Home tier section shows the five badges with thresholds; the per-tier top donors stay on the donor wall.
- The ticker has no running total today; the count-up is applied to each new card's amount rather than adding a total (adding one would be a feature).

## Risks

- Language test: every new visible word, alt and aria-label must be in the page's script; decorative images use `alt=""`. The toggle keeps the other language inside `data-testid="lang-switch"`.
- GSAP adds client JS on every page (core + three plugins). If Lighthouse drops below 90, cut in the order given in the brief.
- `hero-fg` is 16:9 with the strand at the top right; the hero crops it with `object-position` so the diyas never clip.
- Long Hindi strings in the segmented control and chips: wrap, never clip; checked at 360px.

## Suggestions (not built)

- A running "raised so far" total on the brass rail would make the count-up meaningful; needs a repo method (sum of verified, public) and a committee decision on showing it.
- Commission a real round logo; the header and footer use a maroon monogram placeholder.
- A cut-out `hero-building.webp` will lift the hero far more than any motion.

## Verification (after this pass)

| Check | Before | After |
|---|---|---|
| typecheck, lint | pass | pass |
| Vitest | 67 / 67 | 67 / 67 |
| `next build` | pass | pass |
| Playwright smoke + language | 59 / 59 | 59 / 59 (language-switch test also 8 / 8 on repeat) |
| Lighthouse mobile `/hi` | Perf 95 · A11y 100 · CLS 0.142 · LCP 0.9 s | Perf 100 · A11y 100 · CLS 0 · LCP 0.9 s (three runs) |
| Lighthouse mobile `/hi/donate` | Perf 100 · A11y 100 · CLS 0 | Perf 100 · A11y 100 · CLS 0 |

- Reduced motion (360 / 390 / 768 / 1024 / 1280 / 1440 px, both languages, 8 pages): no text at opacity 0, no horizontal scroll.
- JavaScript off: every public page's text renders, nothing at opacity 0 (the hall calendar still needs script, as before).
- Motion cleanup: home → donor wall → home ×3: one jaali lattice at most, SplitText lines only on the first (early) load, no stacking tweens.
- Screenshots: `screenshots/ui-pass/` (home, donate, success, donors, members, committee, hall, about, contact, receipt + receipt print; hi and en; 375 and 1280).

### How the performance budget was met
The first build scored 77 on `/hi`: the hero images became the mobile LCP and Lighthouse's simulation counted every font and script fetched before them. Fixes, none of which removed an effect:
1. Mukta down to two weights (400, 600): about 130 KB less font.
2. `hero-fg.webp` (2880 × 1621, mostly transparent) is drawn as its two lit parts, `hero-fg-diyas.webp` and `hero-fg-strand.webp`, cut from it at the boxes in `brand.ts` and placed back at the same spot. Fewer bytes, and a transparent full-width box is no longer the largest paint.
3. The sky (`hero-bg`) is served small on phones (`sizes` 12vw). It is a soft gradient, so it looks the same upscaled, and the hero text stays the LCP.
4. The hero subtext is never faded (on phones it is the LCP); only the inauguration line and buttons fade up.

No effect was cut.

### Contrast (WCAG, text pairs in use)
ink on ivory 15.37 · on sand 12.75 · on surface 16.17 — ink-soft on ivory 9.08 · on sand 7.53 — muted on ivory 6.21 · on sand 5.15 · on surface 6.53 — maroon on ivory 9.14 · on sand 7.59 — ivory on maroon 9.14 — brass-light on maroon 5.77 (footer labels) — success on ivory 5.69 · on its tint 5.26 — error on ivory 6.54 · on its tint 5.81 — warn on its tint 5.40 — rail title (#241a0e) on brass 5.53 (3.89 at the rail's darkest edge, large text) — step number ink on brass 5.59. Brass is never used for text on ivory or sand (2.75 / 2.28).

### Differences from the mockups
- Fixed to match: sticky ivory header with pill Donate and text language toggle; layered hero with diyas in front of the frame; brass rail + card row; five medals with names below; history / committee / hall teaser / map + contact rhythm with centred brass rules; maroon footer; donate's numbered sections, 3 × 3 chips, segmented display choice, lock line and bottom pay bar; success diya, receipt card, two full-width buttons; hall photo left, calendar card right.
- Left on purpose: the hero right side shows the arched placeholder frame until `hero-building.webp` arrives; the language toggle is text, not the mockup's globe pill (per the brief); the hall photo is a placeholder (the mockup interior is reference only); the segmented display control stacks on phones because the Hindi labels are long; no ornate header crests on the hall page (decoration beyond the brief).

### Dropping in the building later
Add `public/brand/hero-building.webp` (transparent cut-out) and rebuild. `next.config.ts` detects it, `brand.heroBuilding` becomes its path, and the hero draws it (preloaded) in place of the arched frame. Nothing else changes.
