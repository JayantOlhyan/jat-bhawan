# Jat Bhawan, Najafgarh — Client Demo Plan

Demo front end of the real production codebase. A mock data layer stands in for Supabase and is swapped out later.

## Stack (as installed)
- Next.js 16.4 (App Router, React 19.3, Turbopack), TypeScript strict, Tailwind CSS v4
- next-intl 4.15 (`proxy.ts`, `next/root-params`), Zod 4, React Hook Form 7
- Vitest (unit), Playwright (smoke + screenshots)
- npm (pnpm is not installed on this machine)

### Decision: Cache Components off
`create-next-app` enables `cacheComponents` + `partialPrefetching`. They are turned off for this demo because:
- the donor wall, admin and receipt pages read request data (searchParams, cookies) and localStorage-backed records on every view;
- next-intl's docs don't document Cache Components support yet (only "improved integration" via root-params).
Revisit this when the Supabase repo lands (see Suggestions).

## Routes
Public (`/hi/...` default, `/en/...`), all with generateStaticParams for both locales:

| Route | Rendering |
|---|---|
| `/[locale]` | Home: hero, live ticker (client), tier highlights, history, committee preview, map |
| `/[locale]/donate` | Donate form (client, RHF + Zod), test-payment dialog, UPI-manual fallback |
| `/[locale]/donate/success` | Thank you + receipt link + WhatsApp share (client, reads `?id=`) |
| `/[locale]/receipt/[id]` | Printable receipt A4/A5 (server-renders seed records; client loads demo-created ones) |
| `/[locale]/donors` | Donor wall: server-rendered first page from searchParams, then live client updates |
| `/[locale]/members` | Member cards + search/filter |
| `/[locale]/committee` | Current committee by postRank + past committees placeholder |
| `/[locale]/hall` | Hall details, month calendar, enquiry form |
| `/[locale]/about`, `contact`, `privacy`, `terms`, `refund` | Structured placeholder content |

Admin (English-only, separate root layout, gated in `proxy.ts` by an httpOnly cookie):
`/admin/login`, `/admin` (dashboard + demo settings), `/admin/donations`, `/admin/bookings`, `/admin/members`, `/admin/committee`.
Route handlers: `POST /api/admin/login`, `POST /api/admin/logout`.

## Folders
```
messages/{hi,en}.json            all public UI strings
src/proxy.ts                     next-intl routing + admin gate
src/i18n/{routing,request,navigation}.ts
src/app/[locale]/...             public pages (root layout #1)
src/app/admin/...                admin (root layout #2)
src/components/site|donate|hall|donors|admin|ui
src/lib/money.ts fy.ts receipt.ts tiers.ts search.ts time.ts   pure utils (+ Vitest)
src/lib/schemas/                 shared Zod schemas
src/lib/data/
  types.ts        row types mirroring the future Postgres schema
  repos.ts        repository interfaces (the only API pages may use)
  public.ts       toPublicDonation() = future `public_donations` view
  index.ts        getRepos() factory  ← the swap point for Supabase
  hooks.ts        useLiveQuery() (client: refetch on change events)
  mock/store.ts   seed + localStorage overlay + BroadcastChannel
  mock/repos.ts   MockRepos implementing every interface
  seed/*.ts       deterministic seed (seeded PRNG, same on server and client)
src/lib/demo/simulator.ts         demo ticker simulator (?sim=0 disables)
tests/e2e/                        Playwright
```

## Data layer
- Interfaces: DonationsRepo, FundsRepo, TiersRepo, MembersRepo, CommitteeRepo, BookingsRepo (hall), TrustSettingsRepo, plus DemoSettingsRepo (demo-only toggle) and a `subscribe(topic, cb)` change feed (future: Supabase Realtime).
- Server: `getRepos()` returns MockRepos over seed only. Client: the same seed plus a localStorage overlay of records created or edited in the demo. Changes are broadcast with BroadcastChannel (other tabs) and an in-tab emitter.
- Public pages read donations only through `listPublic`/`latestPublic`/`publicTopByTier`, which return `PublicDonation` (verified, not void, anonymous → "गुप्त दान", hide_amount → amount null, never mobile/email).
- Money is integer paise everywhere. Receipt numbers are allocated only on verification, sequential per FY, so failed/pending donations never use one (no gaps). Voiding keeps the number.
- Decision: hide_amount donations are not placed in an amount tier publicly (tier would reveal the range). They appear in a separate "राशि गोपनीय / Amount private" group on the wall.

## Components
Header (sticky, Donate always visible, mobile menu as native `<dialog>`), LanguageSwitcher (keeps path + query), DemoBanner, Footer, Placeholder (auto-uses `public/demo/<slot>.*`), DonorTicker, TierBadge, DonateForm, TestPaymentDialog, HallCalendar (roving tabindex, arrow keys), EnquiryForm, receipt view, admin tables. shadcn/ui not needed. Native `<dialog>` covers the modal needs.

## Suggestions (not built)
- Re-enable Cache Components with `use cache` + tags once the Supabase repo exists (public wall/committee are cache-friendly).
- Server-side receipt-number allocation in Postgres (sequence per FY inside the verify transaction) to remove any cross-tab race.
- Transliteration-aware search (Latin ↔ Devanagari) beyond the small name/village dictionary used in the demo.
- WhatsApp office number: needs a real number (current placeholder uses the share link).
- Hall rates by slot/season once the committee confirms them.

## Design (Hallmark redesign, Solstice theme)
- Cream paper, warm brown ink, gold double rules, one vermilion signal (primary button and focus only); square surfaces with hard paper shadows.
- Faces: Rozha One (display, Devanagari + Latin) and Mukta (body). Devanagari heads use ~1.28 leading so matras never clip.
- Home: the live donation ledger (बही-खाता) is the hero; then the idea (stand-in harvest photo, credited in the footer), donors by tier as ruled rows, the 8 Dec 2026 opening on an ink band, the hall facts, the committee; the footer is a letter close with address and map link.
- Tokens live in `src/app/globals.css` (`@theme`); the Hallmark stamp and every waiver are in its first lines. `src/app/hallmark/base.css` is the scaffold's base layer.
- Client photos: drop `story.jpg` (replaces the harvest stand-in), `hall.jpg` into `public/demo/`.
