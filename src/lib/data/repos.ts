import type {
  Booking,
  BookingSlot,
  BookingStatus,
  CommitteePost,
  Donation,
  DonationDisplay,
  DonationSource,
  DonationStatus,
  Fund,
  Member,
  MemberType,
  Paged,
  PublicDonation,
  Tier,
  TrustSettings,
} from "./types";

/**
 * Repository interfaces. Pages and components talk ONLY to these.
 * MockRepos implements them today; a SupabaseRepos must be a drop-in.
 */

export type ChangeTopic = "donations" | "bookings" | "members" | "committee" | "settings";
export type Unsubscribe = () => void;

export interface PublicDonationQuery {
  search?: string;
  fundId?: string;
  fy?: string;
  /** a tier id, or "private" for hidden-amount donations */
  tierId?: string;
  page?: number;
  pageSize?: number;
  /** "newest" (default) or "tier": tier order, then amount, then newest. */
  sort?: "newest" | "tier";
}

export interface AdminDonationFilter {
  search?: string;
  status?: DonationStatus;
  source?: DonationSource;
  fundId?: string;
  fy?: string;
}

export interface NewDonationInput {
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
  paymentRef?: string;
  donatedAt?: string;
}

export interface FundTotals {
  fundId: string;
  todayPaise: number;
  monthPaise: number;
  allTimePaise: number;
}

export interface DonationsRepo {
  /** Public projection, newest first. */
  latestPublic(limit: number): Promise<PublicDonation[]>;
  listPublic(query: PublicDonationQuery): Promise<Paged<PublicDonation>>;
  /** Count of public donations per tier id (plus "private"). */
  publicTierCounts(query?: Omit<PublicDonationQuery, "tierId" | "page" | "pageSize" | "sort">): Promise<Record<string, number>>;
  /** Top public donations per tier for highlights. */
  publicTopByTier(perTier: number): Promise<Record<string, PublicDonation[]>>;
  publicFinancialYears(): Promise<string[]>;

  // Admin / owner-only
  list(filter?: AdminDonationFilter): Promise<Donation[]>;
  get(id: string): Promise<Donation | null>;
  /** online → "created"; upi_manual → "pending"; cash/cheque → "verified" with receipt. */
  create(input: NewDonationInput): Promise<Donation>;
  /** Marks verified and allocates the next receipt number for the FY. */
  verify(id: string, paymentRef?: string): Promise<Donation>;
  markFailed(id: string): Promise<Donation>;
  /** Never deletes. Reason is mandatory. */
  void(id: string, reason: string): Promise<Donation>;
  totalsByFund(now?: Date): Promise<FundTotals[]>;
  pendingCount(): Promise<number>;
}

export interface FundsRepo {
  list(): Promise<Fund[]>;
}

export interface TiersRepo {
  list(): Promise<Tier[]>;
}

export interface MemberQuery {
  search?: string;
  memberType?: MemberType;
}

export type MemberInput = Omit<Member, "id">;

export interface MembersRepo {
  /** Public list: only consentDisplay members; phone removed unless phonePublic. */
  listPublic(query?: MemberQuery): Promise<Member[]>;
  list(): Promise<Member[]>;
  create(input: MemberInput): Promise<Member>;
  update(id: string, input: MemberInput): Promise<Member>;
}

export type CommitteeInput = Omit<CommitteePost, "id">;

export interface CommitteeRepo {
  /** Ordered by postRank; phone removed unless phonePublic. */
  listPublic(): Promise<CommitteePost[]>;
  list(): Promise<CommitteePost[]>;
  create(input: CommitteeInput): Promise<CommitteePost>;
  update(id: string, input: CommitteeInput): Promise<CommitteePost>;
}

export interface NewEnquiryInput {
  date: string;
  slot: BookingSlot;
  name: string;
  mobile: string;
  eventType: string;
  guests: number;
  message: string;
}

/** Public calendar entry: no names or contact details. */
export interface PublicBookingDay {
  date: string;
  slot: BookingSlot;
  status: "confirmed" | "tentative";
}

export interface BookingsRepo {
  /** confirmed + tentative slots between two dates (inclusive), no personal data. */
  publicCalendar(from: string, to: string): Promise<PublicBookingDay[]>;
  createEnquiry(input: NewEnquiryInput): Promise<Booking>;
  list(): Promise<Booking[]>;
  /** Throws BookingConflictError when confirming an already-confirmed date + slot. */
  setStatus(id: string, status: BookingStatus): Promise<Booking>;
  newEnquiryCount(): Promise<number>;
}

export class BookingConflictError extends Error {
  constructor(message = "That date and slot is already confirmed for another booking.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export interface TrustSettingsRepo {
  get(): Promise<TrustSettings>;
}

/** Demo-only switches. Not part of the production schema. */
export interface DemoSettings {
  upiManual: boolean;
}

export interface DemoSettingsRepo {
  get(): Promise<DemoSettings>;
  set(patch: Partial<DemoSettings>): Promise<DemoSettings>;
}

export interface Repos {
  donations: DonationsRepo;
  funds: FundsRepo;
  tiers: TiersRepo;
  members: MembersRepo;
  committee: CommitteeRepo;
  bookings: BookingsRepo;
  trust: TrustSettingsRepo;
  demo: DemoSettingsRepo;
  /** Change feed (future: Supabase Realtime). Fires for this tab and other tabs. */
  subscribe(topic: ChangeTopic, cb: () => void): Unsubscribe;
}
