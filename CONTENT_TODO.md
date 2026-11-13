# Content the committee needs to send

Everything below is placeholder or sample data in the demo. Each row says what the client sends and which file it replaces.

## Photos (drop into `public/demo/`, picked up automatically)
| Item | File name | Where it shows |
|---|---|---|
| Bhawan photo, or an old photo of the village elders / foundation stone (portrait or 4:3, ≥1600px) | `public/demo/story.jpg` | Home "idea" section and About (replaces the credited harvest stand-in photo; then remove its credit from the footer) |
| Hall interior photo (4:3) | `public/demo/hall.jpg` | Hall page, beside the hall details (hidden until supplied) |
| Committee member photos (square, optional) | later → Supabase Storage; field `photo` | Committee page (initials avatars until then) |
| Member photos (optional, with consent) | later → Supabase Storage; field `photo` | Members page |

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
