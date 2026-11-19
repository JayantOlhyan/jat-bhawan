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

---

## Images pass (Nov 2026)

Generated sample photos and brand illustrations added into existing and new slots. No route, data, form, money/receipt/tier, admin or print change.

**Sample convention.** `demoImage(slot)` (`src/lib/demo-images.ts`, logic in `demo-files.ts`, unit-tested) returns `{ src, isSample } | null`. `public/demo/<slot>.sample.<ext>` is a labelled stand-in; a real `<slot>.<ext>` always wins. Samples show the chip "नमूना चित्र / Sample image" (bottom left, ivory on maroon 85%, 13 px, pill, not focusable, `aria-hidden` because the alt text already ends in " (नमूना चित्र)" / " (sample image)").

**Where images go.**
- `story`: home (4:3, keeps the jaali reveal) and About (3:4, fade-up 24 px). One square image; `STORY_FOCUS` (`brand.ts`, 50% 58%) keeps the stone, kalash and diya in both crops.
- `hall`: hall page main photo (keeps the second and last jaali reveal). On phones (< 768 px) it comes after the details list (CSS `order`, same element), so the page's largest paint stays text; ≥ 768 px it sits on top as before. Also a 176/112 px thumbnail replacing the calendar icon in the home hall card (scales to 1.03 on card hover, CSS, `motion-safe`).
- Hall gallery ("हॉल की झलक / A look inside", `HallGallery.tsx`): `hall-stage`, `hall-dining`, `hall-entrance`, 4:3, 3 across ≥ 1024 px, 2 + 1 below. Missing files render nothing; no files, no heading. Each thumbnail is a button opening the shared native-`<dialog>` Modal (focus trap, Esc, focus returns to the thumbnail; the ✕ now takes a localised `closeLabel`). Rise 24 px, stagger 0.06, once (`data-rise="24"`).
- Page-header scenes (`PageHeader scene=…`, donors / hall / committee / members / about / contact): right column 240 px (280 px ≥ 1280), ≥ 768 px only, `alt=""`. The square is reserved whenever `scene` is passed, so the header height is identical with or without the file (checked). Motion (desktop + hover): rises 24 px with rotateY 8° → 0 (perspective 1000, 0.6 s, power3.out) on first load or a route change, then drifts at 0.85× scroll while the header is in view. Transforms only.
- 404: `scenes/not-found.webp` at 220 px above the title, fade-up 16 px; a diya glow sits on the flame (`NOT_FOUND_FLAME` in `brand.ts`, measured at 0.411 / 0.675) and flickers (`data-flicker`); reduced motion: static, glow visible.

**Motion rules kept.** No opacity 0 in server HTML; fades run only below the fold on scroll, or in view as a first-load / route-change intro. Still two jaali reveals. Reduced motion: nothing moves. JS off: every image and text visible.

**Share image.** `public/brand/og.png` (1200 × 630) is rendered from the dev-only `/og-template` route (404 in production, noindex, bypasses the locale proxy) by `npm run og` (`scripts/og.mjs`, Playwright; uses a running dev server or starts one). Site fonts, hero sky, maroon Tiro "जाट भवन, नजफगढ़", Mukta "Jat Bhawan, Najafgarh", brass rules, the jharokha arch with the toran and a glowing diya (or `hero-building.webp` once it exists; never a sample photo), and the hero diya row. `pageMetadata` sets it as the openGraph and twitter image on every public page (alt = trust name in the page's language), with `metadataBase` from `NEXT_PUBLIC_SITE_URL`, else Netlify's `URL`.

### Verification

| | Before | After |
|---|---|---|
| typecheck, lint, build | pass | pass |
| Vitest | 67 | 71 (+4 for the sample convention) |
| Playwright smoke + language | 59 / 59 | 59 / 59 |
| Lighthouse mobile `/hi` | Perf 100 · A11y 100 · CLS 0 · LCP 0.9 s | Perf 100 · A11y 100 · CLS 0 · LCP 0.9 s |
| Lighthouse mobile `/hi/hall` | Perf 100 · A11y 97 · CLS 0 · LCP 0.9 s | Perf 100 · A11y 97 · CLS 0 · LCP 0.9 s |

With the photo on top on phones, `/hi/hall` first scored 83 (LCP 4.8 s simulated, 0.15 s observed): the photo became the phone LCP, and Lighthouse's simulation charges an image LCP with every font and script fetched before it (about 640 KB on throttled 4G). Lazy-loading below the fold, exact `sizes`, preload and `fetchpriority=high` did not move it. Placing the photo after the details on phones (approved) brought it back to 100; it now gets its jaali reveal on phones too, as it scrolls in. A11y 97 on the hall page was already there before this pass (calendar labels at 70% opacity; the logo's aria-label vs its visible text).

Screenshots: `screenshots/images-pass/with/` and `screenshots/images-pass/without/` (8 pages × hi/en × 375/1280, plus the hall gallery in view). With the samples and scenes moved away, header heights and H1 positions match to the pixel; the only differences are the intended ones (no gallery, no 404 scene, the calendar icon back in the home hall card).

## Photo-based assets (Nov 2026)

From `reference/jat-bhawan-photo-based-assets/`, matched to its `layout-previews/`:
- Photoreal samples replace the illustrated ones in `public/demo/` (same slot names; still labelled "Sample image").
- `hero-building.webp` (AI-assisted façade cut-out from a Street View screenshot) now fills the hero: box at 47% / 21%, 51% × 70% of the hero plane, base behind the diya row as in the preview. Below 1024 px the plane is centred on the building (x ≈ 0.735) instead of right-anchored, matching `hero-mobile`. Alt text: `Home.buildingAlt`.
- `hall-icon.webp` (a miniature of the Bhawan) takes the illustrated-icon place in the home hall card, as the preview's calendar did.
- Committee cards (home and the committee page) show a neutral head-and-shoulders figure instead of initials (`Avatar fallback="portrait"`), as in the preview; members keep initials.
- Medals: five in one row from 1024 px (narrower medal column at lg).
- `og.png` regenerated: no arch once the façade exists; title, rule, façade, diya row and marigold strand as in the supplied share image, but in the site's own fonts.
- Fix: the medal sheen bar rested slightly inside the disc (a faint stripe on the left edge); it now rests fully outside.
- Note: Next caches optimized images by URL. Replacing a file under the same name needs `.next/cache/images` cleared (a fresh deploy does this).
- Lighthouse mobile after this change: `/hi` Performance 79–84 (LCP 4.6–5.7 s simulated; observed ~0.1 s), A11y 100, CLS 0; `/hi/hall` 100. The façade is now the phone LCP and the simulation charges it with every font and script fetched first. **Decision (Nov 2026): accepted for the demo**, to keep the hero as in `hero-mobile`. Revisit before launch: a smaller building on phones would bring text back as the LCP.
- Hero simplified (Nov 2026): the diya row, the marigold strand and their flicker glows are removed from the home hero; the building is the main art (box 43% / 15%, 56% × 79% of the plane, base at the hero's bottom edge; centred at x ≈ 0.71 below 1024 px). Parallax keeps the sky (0.2×) and the building (0.5×) plus the desktop tilt. The share image matches: title and rule on the left, the façade alone on the right, resting on the bottom edge (diya row and strand removed; they return only in the no-façade fallback with the arch).
