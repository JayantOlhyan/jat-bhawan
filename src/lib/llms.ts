import "server-only";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import { getRepos } from "./data";
import { formatINR } from "./money";
import { PUBLIC_PATHS, siteUrl } from "./site";
import { sortTiers } from "./tiers";

type SeoKey = keyof typeof en.Meta.seo;
const keyOf = (p: string): SeoKey => (p === "" ? "home" : (p.slice(1) as SeoKey));
/** "[placeholder]" text is shown on the demo site but never handed to AI tools as fact. */
const clean = (s: string) => s.replace(/^\[(placeholder|प्लेसहोल्डर)\]\s*/i, "");
const isPlaceholder = (s: string) => /placeholder|प्लेसहोल्डर|XXXX|example\.org/i.test(s);

/** llms.txt: what the site is, and every public page with a one-line description (both languages). */
export function llmsTxt(): string {
  const base = siteUrl();
  const pages = (loc: "en" | "hi") =>
    PUBLIC_PATHS.map((p) => {
      const m = (loc === "en" ? en : hi).Meta.seo[keyOf(p)];
      return `- [${m.title}](${base}/${loc}${p}): ${m.description}`;
    }).join("\n");
  return `# ${en.Meta.siteName} (${hi.Meta.siteName})

> ${en.Meta.seo.home.description}

The site is bilingual: Hindi at /hi (default) and English at /en. Each page exists in both languages.

## Pages (English)
${pages("en")}

## पृष्ठ (हिंदी)
${pages("hi")}

## More
- [Full text for AI tools](${base}/llms-full.txt): facts about the Bhawan, the hall, donation tiers and how to contact the office.
`;
}

/** llms-full.txt: the key facts as plain, standalone sentences. Placeholder facts are left out. */
export async function llmsFullTxt(): Promise<string> {
  const base = siteUrl();
  const repos = getRepos();
  const [trust, tiers, funds] = await Promise.all([repos.trust.get(), repos.tiers.list(), repos.funds.list()]);
  const facts = [
    `${en.Meta.siteName} is a community building (bhawan) in Najafgarh, New Delhi, India, run by the ${trust.nameEn}.`,
    `The Bhawan hall can be booked for weddings, engagements, bhaat ceremonies, birthdays, meetings and other community events.`,
    `Hall availability is shown on a live calendar at ${base}/en/hall, where visitors can send a booking enquiry; the office calls back to confirm the date and the rate.`,
    `Donations to the Bhawan can be made online at ${base}/en/donate, and every donation is recorded with a receipt.`,
    `Donors can choose to show their name and amount, hide the amount, or donate anonymously.`,
    `Every verified donation appears on the public donor wall at ${base}/en/donors.`,
    !isPlaceholder(trust.addressEn) && `The Bhawan's address is ${trust.addressEn}.`,
    !isPlaceholder(trust.phone) && `The office phone number is ${trust.phone}.`,
    !isPlaceholder(trust.email) && `The office email is ${trust.email}.`,
    !isPlaceholder(en.Contact.hoursValue) && `Office hours: ${clean(en.Contact.hoursValue)}.`,
  ].filter(Boolean);
  const tierLines = sortTiers(tiers).map((t) => `- ${t.nameEn} (${t.nameHi}): ${t.minAmountPaise > 0 ? `${formatINR(t.minAmountPaise)} or more` : "any amount"}`);
  const fundLines = funds.map((f) => `- ${f.nameEn} (${f.nameHi})`);
  return `${llmsTxt()}
---

# Key facts
${facts.map((f) => `- ${f}`).join("\n")}

# Donor tiers
Donors are grouped into tiers by the total they have given in a financial year:
${tierLines.join("\n")}

# Funds a donation can go to
${fundLines.join("\n")}

# Hall booking
- ${en.Hall.lead}.
- Event types: ${Object.values(en.Enquiry.events ?? {}).join(", ") || "weddings, engagements, bhaat, birthdays, meetings, other"}.
- ${en.Hall.enquiryLead}.

# Languages
All pages are available in Hindi (${base}/hi) and English (${base}/en).
`;
}
