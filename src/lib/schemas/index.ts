import { z } from "zod";

/**
 * Shared Zod schemas. Error messages are translation keys in the
 * "Validation" namespace, so the UI shows them in the active language.
 */

export const MOBILE_RE = /^[6-9]\d{9}$/;
export const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

/** Accepts "98765 43210", "+91 9876543210", "09876543210" → "9876543210". */
export function normaliseMobile(v: string): string {
  const d = v.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  return d;
}

const name = z.string().trim().min(2, "name").max(80, "name");
const mobile = z
  .string()
  .transform(normaliseMobile)
  .refine((v) => MOBILE_RE.test(v), "mobile");
const optionalText = (max: number) => z.string().trim().max(max, "name").optional().or(z.literal(""));

export const donationDisplaySchema = z.enum(["full", "hide_amount", "anonymous"]);

export const MAX_DONATION_RUPEES = 10_00_000;

export function donationFormSchema(opts: { has80g: boolean; upiManual: boolean }) {
  return z
    .object({
      fundId: z.string().min(1, "fund"),
      amountRupees: z
        .number({ error: "amountMin" })
        .int("amountWhole")
        .min(1, "amountMin")
        .max(MAX_DONATION_RUPEES, "amountMax"),
      donorName: name,
      donorFatherName: name,
      donorVillage: name,
      donorGotra: optionalText(40),
      donorMobile: mobile,
      donorEmail: z.union([z.literal(""), z.email("email")]).optional(),
      donorPan: z.string().trim().toUpperCase().optional().or(z.literal("")),
      display: donationDisplaySchema,
      consent: z.literal(true, { error: "consent" }),
      utr: z.string().trim().optional().or(z.literal("")),
    })
    .superRefine((v, ctx) => {
      if (opts.has80g && v.donorPan && !PAN_RE.test(v.donorPan)) {
        ctx.addIssue({ code: "custom", path: ["donorPan"], message: "pan" });
      }
      if (opts.upiManual && !/^\d{12}$/.test(v.utr ?? "")) {
        ctx.addIssue({ code: "custom", path: ["utr"], message: "utr" });
      }
    });
}

export type DonationFormInput = z.input<ReturnType<typeof donationFormSchema>>;
export type DonationFormValues = z.output<ReturnType<typeof donationFormSchema>>;

export const bookingSlotSchema = z.enum(["full", "morning", "evening"]);

export function enquirySchema(todayKey: string) {
  return z.object({
    name,
    mobile,
    eventType: z.string().min(1, "required"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "date")
      .refine((d) => d >= todayKey, "datePast"),
    slot: bookingSlotSchema,
    guests: z.number({ error: "guests" }).int("guests").min(1, "guests").max(2000, "guests"),
    message: z.string().trim().max(500, "message"),
  });
}

export type EnquiryInput = z.input<ReturnType<typeof enquirySchema>>;
export type EnquiryValues = z.output<ReturnType<typeof enquirySchema>>;

// ---------- Admin (English-only) ----------

export const offlineDonationSchema = z.object({
  fundId: z.string().min(1, "Choose a fund"),
  amountRupees: z.number({ error: "Enter an amount" }).int("Whole rupees only").min(1, "Minimum ₹1").max(MAX_DONATION_RUPEES, "Maximum ₹10,00,000"),
  source: z.enum(["cash", "cheque", "upi_manual"]),
  paymentRef: z.string().trim().min(1, "Reference number is required").max(60),
  donorName: z.string().trim().min(2, "Enter the donor's name").max(80),
  donorFatherName: z.string().trim().min(2, "Enter the father's / husband's name").max(80),
  donorVillage: z.string().trim().min(2, "Enter the village").max(80),
  donorGotra: z.string().trim().max(40).optional().or(z.literal("")),
  donorMobile: z.string().transform(normaliseMobile).refine((v) => MOBILE_RE.test(v), "Enter a valid 10-digit mobile"),
  display: donationDisplaySchema,
  donatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
});

export type OfflineDonationInput = z.input<typeof offlineDonationSchema>;
export type OfflineDonationValues = z.output<typeof offlineDonationSchema>;

export const memberSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(80),
  nameHi: z.string().trim().max(80).optional().or(z.literal("")),
  fatherName: z.string().trim().min(2, "Enter the father's name").max(80),
  gotra: z.string().trim().min(2, "Enter the gotra").max(40),
  village: z.string().trim().min(2, "Enter the village").max(80),
  memberType: z.enum(["life", "general", "founder", "honorary"]),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  phonePublic: z.boolean(),
  consentDisplay: z.boolean(),
});

export type MemberFormValues = z.output<typeof memberSchema>;

export const committeeSchema = z.object({
  postHi: z.string().trim().min(2, "Enter the post in Hindi").max(60),
  postEn: z.string().trim().min(2, "Enter the post in English").max(60),
  postRank: z.number({ error: "Enter a rank" }).int().min(1).max(99),
  name: z.string().trim().min(2, "Enter a name").max(80),
  nameHi: z.string().trim().max(80).optional().or(z.literal("")),
  fatherName: z.string().trim().min(2, "Enter the father's name").max(80),
  termLabel: z.string().trim().min(2, "Enter the term").max(30),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  phonePublic: z.boolean(),
});

export type CommitteeFormValues = z.output<typeof committeeSchema>;

export const voidSchema = z.object({ reason: z.string().trim().min(5, "Give a reason (at least 5 characters)") });
