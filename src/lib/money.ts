/**
 * Money utilities. All amounts are integer paise. Never floats.
 * Display uses Indian digit grouping with Latin digits in both locales.
 */

export const PAISE_PER_RUPEE = 100;

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) throw new Error("Invalid rupee amount");
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function assertPaise(paise: number): void {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error(`Amount must be a non-negative integer number of paise, got ${paise}`);
  }
}

/** Group an integer the Indian way: 12345678 → "1,23,45,678". */
export function groupIndian(n: number): string {
  const s = Math.trunc(Math.abs(n)).toString();
  const sign = n < 0 ? "-" : "";
  if (s.length <= 3) return sign + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return sign + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

/** "₹1,00,000" or "₹1,00,000.50" (paise only shown when non-zero). */
export function formatINR(paise: number): string {
  assertPaise(paise);
  const rupees = Math.floor(paise / PAISE_PER_RUPEE);
  const p = paise % PAISE_PER_RUPEE;
  return `₹${groupIndian(rupees)}${p ? "." + p.toString().padStart(2, "0") : ""}`;
}

// ---------- English words (Indian system) ----------

const EN_ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function en0to99(n: number): string {
  if (n < 20) return EN_ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${EN_TENS[t]}-${EN_ONES[o]}` : EN_TENS[t];
}

function en0to999(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${EN_ONES[h]} Hundred`);
  if (r) parts.push(en0to99(r));
  return parts.join(" ");
}

/** Integer → English words in the Indian system (lakh, crore). */
export function integerToWordsEn(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error("Expected a non-negative integer");
  if (n === 0) return EN_ONES[0];
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${integerToWordsEn(crore)} Crore`);
  if (lakh) parts.push(`${en0to99(lakh)} Lakh`);
  if (thousand) parts.push(`${en0to99(thousand)} Thousand`);
  if (rest) parts.push(en0to999(rest));
  return parts.join(" ");
}

/** "Rupees One Lakh Twenty-One Thousand Only" */
export function amountInWordsEn(paise: number): string {
  assertPaise(paise);
  const rupees = Math.floor(paise / PAISE_PER_RUPEE);
  const p = paise % PAISE_PER_RUPEE;
  let s = `Rupees ${integerToWordsEn(rupees)}`;
  if (p) s += ` and ${en0to99(p)} Paise`;
  return `${s} Only`;
}

// ---------- Hindi words ----------
// Hindi number words 0–99 are irregular, so they come from a full lookup table.

export const HI_0_TO_99: readonly string[] = [
  "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ",
  "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस",
  "बीस", "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस",
  "तीस", "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस",
  "चालीस", "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास",
  "पचास", "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ",
  "साठ", "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर",
  "सत्तर", "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उन्यासी",
  "अस्सी", "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सत्तासी", "अट्ठासी", "नवासी",
  "नब्बे", "इक्यानवे", "बानवे", "तिरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे",
];

/** Integer → Hindi words (सौ, हज़ार, लाख, करोड़). */
export function integerToWordsHi(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error("Expected a non-negative integer");
  if (n === 0) return HI_0_TO_99[0];
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (crore) parts.push(`${integerToWordsHi(crore)} करोड़`);
  if (lakh) parts.push(`${HI_0_TO_99[lakh]} लाख`);
  if (thousand) parts.push(`${HI_0_TO_99[thousand]} हज़ार`);
  if (hundred) parts.push(`${HI_0_TO_99[hundred]} सौ`);
  if (rest) parts.push(HI_0_TO_99[rest]);
  return parts.join(" ");
}

/** "एक लाख इक्कीस हज़ार रुपये मात्र" */
export function amountInWordsHi(paise: number): string {
  assertPaise(paise);
  const rupees = Math.floor(paise / PAISE_PER_RUPEE);
  const p = paise % PAISE_PER_RUPEE;
  let s = `${integerToWordsHi(rupees)} रुपये`;
  if (p) s += ` और ${HI_0_TO_99[p]} पैसे`;
  return `${s} मात्र`;
}

export const DONATION_PRESETS_RUPEES = [501, 1100, 2100, 5100, 11000, 21000, 51000, 100000] as const;
export const DONATION_MIN_PAISE = rupeesToPaise(1);
export const DONATION_MAX_PAISE = rupeesToPaise(10_00_000);
