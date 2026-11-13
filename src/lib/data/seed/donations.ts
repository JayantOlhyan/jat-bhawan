import { rupeesToPaise } from "../../money";
import { nextReceiptNo } from "../../receipt";
import type { Donation, DonationDisplay, DonationSource } from "../types";
import { FATHER_NAMES, FIRST_NAMES, GOTRAS, VILLAGES } from "./names";
import { createRng, type Rng } from "./rng";
import { SEED_FUNDS, SEED_TRUST } from "./static";

const AMOUNTS: Array<[number, number]> = [
  [501, 20], [1100, 22], [2100, 18], [5100, 14], [11000, 10],
  [21000, 7], [51000, 4], [100000, 3], [251000, 2],
];

function weightedAmount(rng: Rng): number {
  const total = AMOUNTS.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * total;
  for (const [amt, w] of AMOUNTS) {
    if ((r -= w) < 0) return amt;
  }
  return 501;
}

const START = Date.parse("2025-04-03T04:30:00Z");
const END = Date.parse("2026-11-12T12:30:00Z");

export interface SampleDonor {
  donorName: string;
  donorFatherName: string;
  donorVillage: string;
  donorGotra: string;
  donorMobile: string;
}

/** A plausible sample donor; ~55% written in Devanagari as many donors would. */
export function sampleDonor(rng: Rng, mobileSuffix: number): SampleDonor {
  const hi = rng.chance(0.55);
  const first = rng.pick(FIRST_NAMES);
  const gotra = rng.pick(GOTRAS);
  const father = rng.pick(FATHER_NAMES);
  const village = rng.pick(VILLAGES);
  const s = (p: { en: string; hi: string }) => (hi ? p.hi : p.en);
  return {
    donorName: `${s(first)} ${s(gotra)}`,
    donorFatherName: s(father),
    donorVillage: s(village),
    donorGotra: s(gotra),
    donorMobile: `98XXXXXX${String(mobileSuffix % 100).padStart(2, "0")}`,
  };
}

export function sampleAmountPaise(rng: Rng): number {
  return rupeesToPaise(weightedAmount(rng));
}

function buildDonations(): Donation[] {
  const rng = createRng(20261208);
  const rows: Donation[] = [];
  const N = 120;
  for (let i = 0; i < N; i++) {
    // Bias toward recent dates (fundraising picks up before the inauguration).
    const u = rng.next();
    const t = START + (END - START) * (1 - Math.pow(1 - u, 1.7));
    const donatedAt = new Date(Math.round(t / 60000) * 60000);
    const early = donatedAt.getTime() < Date.parse("2025-10-01T00:00:00Z");

    let source: DonationSource;
    const r = rng.next();
    if (early && r < 0.3) source = "legacy";
    else if (r < 0.5) source = "online";
    else if (r < 0.75) source = "cash";
    else if (r < 0.87) source = "cheque";
    else source = "upi_manual";

    const dr = rng.next();
    const display: DonationDisplay = dr < 0.1 ? "anonymous" : dr < 0.2 ? "hide_amount" : "full";
    const donor = sampleDonor(rng, i + 1);
    const ref =
      source === "online" ? `TESTPAY${100000 + i}` :
      source === "cheque" ? `CHQ ${300100 + i}` :
      source === "upi_manual" ? `UTR${412300000000 + i * 7}` :
      source === "cash" ? `Cash book p.${10 + i}` : `Register ${2020 + (i % 5)}/${i + 1}`;

    rows.push({
      id: `don-${String(i + 1).padStart(4, "0")}`,
      fundId: rng.chance(0.6) ? SEED_FUNDS[0].id : rng.chance(0.6) ? SEED_FUNDS[1].id : SEED_FUNDS[2].id,
      amountPaise: sampleAmountPaise(rng),
      ...donor,
      donorGotra: rng.chance(0.8) ? donor.donorGotra : undefined,
      donorEmail: rng.chance(0.25) ? `donor${i + 1}@example.com` : undefined,
      display,
      source,
      status: "verified",
      paymentRef: ref,
      donatedAt: donatedAt.toISOString(),
    });
  }
  rows.sort((a, b) => a.donatedAt.localeCompare(b.donatedAt));

  // A few non-public rows. These must never appear on public pages.
  const recent = rows.slice(-30);
  const pendingIdx = [3, 11, 19, 27];
  for (const k of pendingIdx) {
    const d = recent[k];
    d.status = "pending";
    d.source = "upi_manual";
    d.paymentRef = `UTR${512300000000 + k}`;
  }
  for (const k of [6, 15, 24]) {
    const d = recent[k];
    d.status = "failed";
    d.source = "online";
    d.paymentRef = undefined;
  }

  // Allocate receipt numbers in chronological order for everything that was verified.
  const issued: string[] = [];
  for (const d of rows) {
    if (d.status !== "verified") continue;
    const at = new Date(d.donatedAt);
    d.receiptNo = nextReceiptNo(SEED_TRUST.receiptPrefix, at, issued);
    d.verifiedAt = d.donatedAt;
    issued.push(d.receiptNo);
  }

  // Void three verified rows (they keep their receipt numbers: no gaps).
  const voidTargets = rows.filter((d) => d.status === "verified").filter((_, i) => i % 37 === 5).slice(0, 3);
  for (const d of voidTargets) {
    d.status = "void";
    d.voidReason = "Duplicate entry (sample)";
  }
  return rows;
}

export const SEED_DONATIONS: Donation[] = buildDonations();
