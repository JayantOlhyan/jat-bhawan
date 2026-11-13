/**
 * Row types. These mirror the future Postgres schema (snake_case columns map
 * 1:1 to these camelCase fields). Money is always integer paise.
 */

export type ISODateTime = string; // e.g. "2026-11-12T10:15:00.000Z"
export type ISODate = string; // e.g. "2026-12-08"

export type DonationDisplay = "full" | "hide_amount" | "anonymous";
export type DonationSource = "online" | "cash" | "cheque" | "upi_manual" | "legacy";
export type DonationStatus = "created" | "pending" | "verified" | "failed" | "void";

export interface Donation {
  id: string;
  fundId: string;
  amountPaise: number;
  donorName: string;
  donorFatherName: string;
  donorVillage: string;
  donorGotra?: string;
  donorMobile: string;
  donorEmail?: string;
  donorPan?: string;
  display: DonationDisplay;
  source: DonationSource;
  status: DonationStatus;
  receiptNo?: string;
  /** Gateway payment id, cheque no., UTR, or cash book ref. */
  paymentRef?: string;
  voidReason?: string;
  donatedAt: ISODateTime;
  verifiedAt?: ISODateTime;
}

export interface Fund {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  sortOrder: number;
}

export interface Tier {
  id: string;
  nameHi: string;
  nameEn: string;
  minAmountPaise: number;
  sortOrder: number;
}

export type MemberType = "life" | "general" | "founder" | "honorary";

export interface Member {
  id: string;
  name: string;
  nameHi?: string;
  fatherName: string;
  gotra: string;
  village: string;
  memberType: MemberType;
  photo?: string;
  phone?: string;
  phonePublic: boolean;
  consentDisplay: boolean;
}

export interface CommitteePost {
  id: string;
  postHi: string;
  postEn: string;
  postRank: number;
  name: string;
  nameHi?: string;
  fatherName: string;
  photo?: string;
  termLabel: string;
  phone?: string;
  phonePublic: boolean;
}

export type BookingSlot = "full" | "morning" | "evening";
export type BookingStatus = "enquiry" | "tentative" | "confirmed" | "rejected" | "cancelled";

export interface Booking {
  id: string;
  date: ISODate;
  slot: BookingSlot;
  status: BookingStatus;
  name: string;
  mobile: string;
  eventType: string;
  guests: number;
  message: string;
  createdAt: ISODateTime;
}

export interface TrustSettings {
  nameHi: string;
  nameEn: string;
  regNo: string;
  addressHi: string;
  addressEn: string;
  has80g: boolean;
  receiptPrefix: string;
  phone: string;
  email: string;
}

/** Equivalent of the future `public_donations` view. No contact fields. */
export interface PublicDonation {
  id: string;
  fundId: string;
  /** null when the donor chose to hide the amount. */
  amountPaise: number | null;
  /** null when anonymous. Render as "गुप्त दान / Anonymous". */
  donorName: string | null;
  donorFatherName: string | null;
  donorVillage: string | null;
  anonymous: boolean;
  /** null when the amount is hidden (a tier would reveal its range). */
  tierId: string | null;
  donatedAt: ISODateTime;
  fy: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
