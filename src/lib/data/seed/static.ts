import { rupeesToPaise } from "../../money";
import type { Fund, Tier, TrustSettings } from "../types";

export const SEED_FUNDS: Fund[] = [
  { id: "fund-general", slug: "general", nameHi: "सामान्य कोष", nameEn: "General Fund", sortOrder: 1 },
  { id: "fund-maintenance", slug: "maintenance", nameHi: "भवन रखरखाव कोष", nameEn: "Bhawan Maintenance Fund", sortOrder: 2 },
  { id: "fund-education", slug: "education", nameHi: "शिक्षा सहायता कोष", nameEn: "Education Support Fund", sortOrder: 3 },
];

export const SEED_TIERS: Tier[] = [
  { id: "tier-patron", nameHi: "संरक्षक", nameEn: "Patron", minAmountPaise: rupeesToPaise(100000), sortOrder: 1 },
  { id: "tier-grand", nameHi: "महादानी", nameEn: "Grand Donor", minAmountPaise: rupeesToPaise(51000), sortOrder: 2 },
  { id: "tier-benefactor", nameHi: "दानवीर", nameEn: "Benefactor", minAmountPaise: rupeesToPaise(21000), sortOrder: 3 },
  { id: "tier-supporter", nameHi: "सहयोगी", nameEn: "Supporter", minAmountPaise: rupeesToPaise(11000), sortOrder: 4 },
  { id: "tier-donor", nameHi: "दानदाता", nameEn: "Donor", minAmountPaise: 0, sortOrder: 5 },
];

export const SEED_TRUST: TrustSettings = {
  nameHi: "जाट भवन ट्रस्ट, नजफगढ़",
  nameEn: "Jat Bhawan Trust, Najafgarh",
  regNo: "REG/XXXX/XXXX (placeholder)",
  addressHi: "[पता: प्लेसहोल्डर], नजफगढ़, नई दिल्ली 110043",
  addressEn: "[Address: placeholder], Najafgarh, New Delhi 110043",
  has80g: false,
  receiptPrefix: "JBN",
  phone: "98XXXXXX00",
  email: "office@example.org",
};
