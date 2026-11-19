# Content the committee needs to send

Everything below is placeholder or sample data in the demo. Each row says what the client sends and which file it replaces.

## Images

Every image slot on the public site. Photos go into `public/demo/` and are picked up automatically: a real `<slot>.jpg` (or `.jpeg .png .webp .avif`) always wins over a `<slot>.sample.webp`. The pages need no code change, only a rebuild/redeploy.

| File | Where it shows | Current state |
|---|---|---|
| `public/demo/story.sample.webp` → send `story.jpg` (an old photo of the foundation stone / village elders, or the Bhawan; square or 4:3, ≥ 1600 px) | Home "idea" section (4:3 crop) and About column (3:4 crop) | **AI sample: must be replaced with a real photo before launch.** Labelled "नमूना चित्र / Sample image" on the page. |
| `public/demo/hall.sample.webp` → send `hall.jpg` (hall interior, 4:3, ≥ 1600 px) | Hall page main photo; thumbnail in the home "hall" card | **AI sample: must be replaced with a real photo before launch.** |
| `public/demo/hall-stage.sample.webp` → `hall-stage.jpg` (4:3) | Hall page gallery, "A look inside" | **AI sample: must be replaced with a real photo before launch.** Caption `Hall.gallery.stage` describes the sample; adjust it to the real photo. |
| `public/demo/hall-dining.sample.webp` → `hall-dining.jpg` (4:3) | Hall page gallery | **AI sample: must be replaced with a real photo before launch.** Caption `Hall.gallery.dining`. |
| `public/demo/hall-entrance.sample.webp` → `hall-entrance.jpg` (4:3) | Hall page gallery | **AI sample: must be replaced with a real photo before launch.** Caption `Hall.gallery.entrance`. |
| `public/brand/hero-building.webp` (not there yet: a cut-out photo or render of the Bhawan façade, transparent background) | Home hero, inside the arch; also the share image | Missing: the hero shows the empty brass arch. Picked up at build time (`next.config.ts`). Never generate or fake this one. |
| `public/brand/scenes/{donors,hall,committee,members,about,contact}.webp` | Right of the page title on those pages (≥ 768 px only) | Decorative brand illustration. Keep. |
| `public/brand/scenes/not-found.webp` | 404 page, above the title | Decorative brand illustration. Keep. |
| `public/brand/og.png` | Share preview (WhatsApp, Facebook, X) for every public page | Built from the site's own fonts and art. **Regenerate with `npm run og` after the façade photo arrives** (it then shows `hero-building.webp` in the arch). |
| `public/brand/hero-*.webp`, `icons/`, `tiers/` | Hero, icons, tier medals | Decorative brand art. Keep. |
| Committee member photos (square, optional) | later → Supabase Storage; field `photo` | Initials avatars until then. |
| Member photos (optional, with consent) | later → Supabase Storage; field `photo` | Initials avatars until then. |

When a sample is replaced, delete the `.sample.webp` file too (the real photo wins anyway, but it keeps the folder honest).

## Trust details → `src/lib/data/seed/static.ts` (`SEED_TRUST`), later the `trust_settings` table
- Registered trust name (Hindi + English). Placeholder: "जाट भवन ट्रस्ट, नजफगढ़ / Jat Bhawan Trust, Najafgarh"
- Registration number. Placeholder: `REG/XXXX/XXXX (placeholder)`
- Full postal address (Hindi + English). Placeholder: `[Address — placeholder], Najafgarh, New Delhi – 110043`
- Office phone + WhatsApp number. Placeholder: `98XXXXXX00`. Until a real number is in, the WhatsApp buttons open a share sheet instead of a chat.
- Office email. Placeholder: `office@example.org`
- 80G status: does the trust have a valid 80G certificate? (`has80g`, currently `false`). If yes: the certificate number and validity for the receipt text (`Receipt.eightyG` in `messages/*.json`). The PAN field on the donate form appears only when this is `true`.
- Receipt prefix (currently `JBN`) and the starting receipt number for FY 2026-27 if paper receipts were already issued.
- Authorised signatory name/designation and a scanned signature (receipt).
- Office hours (`Contact.hoursValue`).
- Google Maps link / plus code for the exact location (`MAPS_URL` in `src/lib/format.ts`).

## Funds and tiers → `src/lib/data/seed/static.ts`, later the `funds` / `tiers` tables
- Confirm the fund names (Hindi + English): सामान्य कोष, भवन रखरखाव कोष, शिक्षा सहायता कोष are placeholders.
- Confirm the tier names and thresholds: संरक्षक ₹1,00,000+, महादानी ₹51,000+, दानवीर ₹21,000+, सहयोगी ₹11,000+, दानदाता below.

## Registers (sample data today)
| Item | Replaces | Format we need |
|---|---|---|
| Donor register (all past donations) | `src/lib/data/seed/donations.ts` (120 sample rows) | Excel/CSV: date, receipt no., name, father's/husband's name, village, gotra, mobile, amount, fund, mode, display choice (name+amount / hide amount / anonymous) |
| Member list | `src/lib/data/seed/people.ts` → `SEED_MEMBERS` (40 sample) | name (Hindi + English), father's name, gotra, village, member type, phone, **written consent to show phone (yes/no)**, consent to be listed |
| Current committee | `SEED_COMMITTEE` (11 sample posts) | post, rank order, name (Hindi + English), father's name, term, phone + consent |
| Past committees | `Committee.pastBody` placeholder | year range + list of office bearers |
| Existing hall bookings | `SEED_BOOKINGS` (15 sample + 6 enquiries) | date, slot, name, mobile, event, status |

## Text marked `[placeholder]` / `[प्लेसहोल्डर]` in `messages/hi.json` and `messages/en.json`
- `Home.historyBody`: the short history of the Bhawan (Hindi first; we'll translate).
- `About.*`: introduction, aims, trust description.
- `Hall.capacityValue`, `facilitiesValue`, `rulesValue`, `rateValue`: capacity, facilities, rules, rates by slot/season.
- `Contact.hoursValue`
- `Privacy.*`: needs the grievance officer's name/phone/email and a review by the trust (DPDP Act 2023).
- `Terms.*`, `Refund.*`: confirm the refund window and hall cancellation rules.
- `Receipt.eightyG`: only if 80G applies.

## Other decisions needed
- Payment gateway account (KYC in the trust's name) and settlement bank account, for the real online payments.
- UPI ID + QR for the manual UPI fallback (`Donate.qrHere` placeholder).
- Domain name.
