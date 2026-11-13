# Jat Bhawan, Najafgarh — website (client demo)

Front end of the production site, running on a **mock data layer** that will later be swapped for Supabase. Hindi-first (`/hi`, default) with full English parity (`/en`). Every page carries a "demo / sample data" banner and is `noindex`.

- Plan and architecture: [PLAN.md](PLAN.md)
- What the committee still has to send: [CONTENT_TODO.md](CONTENT_TODO.md)

## Stack
Next.js 16 (App Router, React 19, Turbopack) · TypeScript strict · Tailwind CSS v4 · next-intl 4 · Zod 4 · React Hook Form · Vitest · Playwright. No backend services in this phase.

## Run locally
Needs Node 20.9+ (tested on Node 25). This machine has no pnpm, so the project uses npm.

```bash
npm install
cp .env.example .env.local   # then set DEMO_ADMIN_PASSWORD (min 6 chars)
npm run dev                  # http://localhost:3000 → /hi
```

| Command | What it does |
|---|---|
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm run lint` | ESLint (next core-web-vitals + TypeScript) |
| `npm test` | Vitest unit tests (money/words, FY, receipts, tiers, public projection, i18n parity, CSV) |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright smoke tests against `next start` (run `npm run build` first; first time: `npx playwright install chromium`) |
| `npm run screenshots` | Full-page screenshots at 375px and 1280px into `screenshots/` |
| `npm run check` | typecheck + lint + unit tests + build |

## Demo tips (for the committee meeting)
- **Ticker simulator:** the home page adds a random sample donation every 25–45 s in the visible tab. Add `?sim=0` to turn it off.
- **Live updates:** open the home page or donor wall in a second tab or window. A donation made in one tab shows up in the other within a second (BroadcastChannel).
- **Test payment:** the donate page opens a neutral "Test payment — no money will be charged" dialog. "Payment failed" records a failed attempt that never appears publicly.
- **UPI-manual fallback:** Admin → Dashboard → Demo settings. The donate page then shows a QR placeholder and UTR field, and the donation stays *pending* until verified in Admin → Donations.
- **Admin:** `/admin` (English only) with the password from `DEMO_ADMIN_PASSWORD`. Covers totals, verify / void (reason required, never deleted), offline cash/cheque/UPI entries, CSV export (UTF-8 BOM for Excel), booking statuses, members and committee editing.
- **Reset:** Admin → Dashboard → "Reset demo data" clears everything created in this browser.
- **Photos:** drop `hero.jpg`, `hall.jpg` and `map.jpg` into `public/demo/` and they replace the placeholders automatically.

Demo data lives in each viewer's browser (localStorage). Two different phones do **not** see each other's new donations. Two tabs on the same browser do.

## Deploy to Netlify
1. Push the repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and pick the repo. Netlify detects Next.js and applies its Next.js runtime automatically. `netlify.toml` sets `npm run build` and Node 22.
3. **Site configuration → Environment variables:** add `DEMO_ADMIN_PASSWORD`.
4. Deploy. The site sends `X-Robots-Tag: noindex`, and `robots.txt` disallows everything.

CLI alternative: `npx netlify-cli deploy --build` (needs `netlify login` first).

## Data layer and the Supabase swap
Pages and components use only the repository interfaces in [`src/lib/data/repos.ts`](src/lib/data/repos.ts), through `getRepos()` in [`src/lib/data/index.ts`](src/lib/data/index.ts). The steps to replace `MockRepos` with Supabase:

1. **Schema:** create tables that mirror [`src/lib/data/types.ts`](src/lib/data/types.ts) (`donations`, `funds`, `tiers`, `members`, `committee`, `bookings`, `trust_settings`; money as `bigint` paise).
2. **Public view:** `public_donations` = `status = 'verified'`, no mobile/email/PAN, `donor_* = null` when anonymous, `amount = null` and `tier_id = null` when `hide_amount`. Same rules as [`toPublicDonation()`](src/lib/data/public.ts). Grant `anon` select on the view only, and use RLS on everything else.
3. **Receipts:** allocate `receipt_no` inside the verify transaction with a per-FY counter (row lock), using the format from [`src/lib/receipt.ts`](src/lib/receipt.ts).
4. **Booking clashes:** a partial unique index or exclusion constraint on confirmed `(date, slot)`, with `full` clashing with both halves. Same rule as `BookingsRepo.setStatus`.
5. **Implement `SupabaseRepos`:** `src/lib/data/supabase/repos.ts`, implementing the same `Repos` interface. `subscribe()` maps to Supabase Realtime channels.
6. **Swap the factory:** `getRepos()` returns `SupabaseRepos` (a server client with the user's session on the server, the browser client in the browser). Delete `mock/` and `seed/` (or keep the seed as a SQL seed script).
7. **Replace the demo-only pieces:** the admin password gate (`src/lib/admin-auth.ts`, `src/proxy.ts`) becomes Supabase Auth with 2-factor and an admin role check. `TestPaymentDialog` becomes the real gateway checkout plus a verified webhook that calls `verify`. `DemoSettingsRepo`, `simulator.ts` and `DemoBanner` are removed.
8. **Revisit Cache Components** for the public pages (see PLAN.md).

No page or component changes are needed for the swap.
