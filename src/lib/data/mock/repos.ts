import { fyLabel, istDateKey, istParts } from "../../fy";
import { assertPaise } from "../../money";
import { nextReceiptNo } from "../../receipt";
import { matchesSearch } from "../../search";
import { toPublicDonation } from "../public";
import {
  BookingConflictError,
  type AdminDonationFilter,
  type BookingsRepo,
  type CommitteeRepo,
  type DemoSettingsRepo,
  type DonationsRepo,
  type FundsRepo,
  type FundTotals,
  type MembersRepo,
  type PublicDonationQuery,
  type Repos,
  type TiersRepo,
  type TrustSettingsRepo,
} from "../repos";
import { SEED_FUNDS, SEED_TIERS, SEED_TRUST } from "../seed";
import type { Booking, Donation, PublicDonation } from "../types";
import { MockStore } from "./store";

const clone = <T,>(v: T): T => structuredClone(v);
const byNewest = (a: { donatedAt: string }, b: { donatedAt: string }) => b.donatedAt.localeCompare(a.donatedAt);

function newId(prefix: string): string {
  const rnd = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

export function createMockRepos(persistent: boolean): Repos & { reset(): void } {
  const store = new MockStore(persistent);

  const publicAll = (): PublicDonation[] =>
    store
      .all("donations")
      .map((d) => toPublicDonation(d, SEED_TIERS))
      .filter((d): d is PublicDonation => d !== null)
      .sort(byNewest);

  const publicFiltered = (q: Omit<PublicDonationQuery, "page" | "pageSize" | "sort">): PublicDonation[] =>
    publicAll().filter(
      (d) =>
        (!q.fundId || d.fundId === q.fundId) &&
        (!q.fy || d.fy === q.fy) &&
        (!q.tierId || (q.tierId === "private" ? d.tierId === null : d.tierId === q.tierId)) &&
        matchesSearch(q.search, [d.donorName, d.donorVillage, d.donorFatherName]),
    );

  const updateDonation = (id: string, fn: (d: Donation) => void): Donation =>
    store.mutate("donations", (o) => {
      const current = o.donations[id] ?? store.all("donations").find((d) => d.id === id);
      if (!current) throw new Error(`Donation ${id} not found`);
      const next = clone(current);
      fn(next);
      o.donations[id] = next;
      return clone(next);
    });

  const donations: DonationsRepo = {
    async latestPublic(limit) {
      return publicAll().slice(0, limit);
    },
    async listPublic(q) {
      const pageSize = q.pageSize ?? 24;
      const rows = publicFiltered(q);
      if (q.sort === "tier") {
        const rank = new Map(SEED_TIERS.map((t) => [t.id, t.sortOrder]));
        rows.sort(
          (a, b) =>
            (rank.get(a.tierId ?? "") ?? 99) - (rank.get(b.tierId ?? "") ?? 99) ||
            (b.amountPaise ?? 0) - (a.amountPaise ?? 0) ||
            byNewest(a, b),
        );
      }
      const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
      const page = Math.min(Math.max(1, q.page ?? 1), pageCount);
      return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize, pageCount };
    },
    async publicTierCounts(q = {}) {
      const counts: Record<string, number> = {};
      for (const d of publicFiltered(q)) {
        const k = d.tierId ?? "private";
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return counts;
    },
    async publicTopByTier(perTier) {
      const out: Record<string, PublicDonation[]> = {};
      const sorted = publicAll()
        .filter((d) => d.tierId && d.amountPaise !== null)
        .sort((a, b) => (b.amountPaise ?? 0) - (a.amountPaise ?? 0) || byNewest(a, b));
      for (const d of sorted) {
        const list = (out[d.tierId as string] ??= []);
        if (list.length < perTier) list.push(d);
      }
      return out;
    },
    async publicFinancialYears() {
      return [...new Set(publicAll().map((d) => d.fy))].sort().reverse();
    },
    async list(f: AdminDonationFilter = {}) {
      return clone(
        store
          .all("donations")
          .filter(
            (d) =>
              (!f.status || d.status === f.status) &&
              (!f.source || d.source === f.source) &&
              (!f.fundId || d.fundId === f.fundId) &&
              (!f.fy || fyLabel(new Date(d.donatedAt)) === f.fy) &&
              matchesSearch(f.search, [d.donorName, d.donorVillage, d.donorFatherName, d.receiptNo, d.paymentRef, d.donorMobile]),
          )
          .sort(byNewest),
      );
    },
    async get(id) {
      const d = store.all("donations").find((x) => x.id === id);
      return d ? clone(d) : null;
    },
    async create(input) {
      assertPaise(input.amountPaise);
      const now = new Date();
      const donation: Donation = {
        id: newId("don"),
        ...input,
        donatedAt: input.donatedAt ?? now.toISOString(),
        status: input.source === "online" ? "created" : input.source === "upi_manual" ? "pending" : "verified",
      };
      return store.mutate("donations", (o) => {
        if (donation.status === "verified") {
          const issued = store.all("donations").flatMap((d) => (d.receiptNo ? [d.receiptNo] : []));
          donation.receiptNo = nextReceiptNo(SEED_TRUST.receiptPrefix, new Date(donation.donatedAt), issued);
          donation.verifiedAt = now.toISOString();
        }
        o.donations[donation.id] = donation;
        return clone(donation);
      });
    },
    async verify(id, paymentRef) {
      return updateDonation(id, (d) => {
        if (d.status === "verified") return;
        if (d.status !== "created" && d.status !== "pending") {
          throw new Error(`Cannot verify a ${d.status} donation`);
        }
        const issued = store.all("donations").flatMap((x) => (x.receiptNo ? [x.receiptNo] : []));
        const now = new Date();
        d.status = "verified";
        d.verifiedAt = now.toISOString();
        if (paymentRef) d.paymentRef = paymentRef;
        // Receipt FY follows the donation date.
        d.receiptNo = nextReceiptNo(SEED_TRUST.receiptPrefix, new Date(d.donatedAt), issued);
      });
    },
    async markFailed(id) {
      return updateDonation(id, (d) => {
        if (d.status !== "created") throw new Error(`Cannot fail a ${d.status} donation`);
        d.status = "failed";
      });
    },
    async void(id, reason) {
      if (!reason.trim()) throw new Error("A reason is required to void a donation");
      return updateDonation(id, (d) => {
        d.status = "void";
        d.voidReason = reason.trim();
      });
    },
    async totalsByFund(now = new Date()) {
      const today = istDateKey(now);
      const { year, month } = istParts(now);
      const totals = new Map<string, FundTotals>(
        SEED_FUNDS.map((f) => [f.id, { fundId: f.id, todayPaise: 0, monthPaise: 0, allTimePaise: 0 }]),
      );
      for (const d of store.all("donations")) {
        if (d.status !== "verified") continue;
        const t = totals.get(d.fundId);
        if (!t) continue;
        const at = new Date(d.donatedAt);
        const p = istParts(at);
        t.allTimePaise += d.amountPaise;
        if (p.year === year && p.month === month) t.monthPaise += d.amountPaise;
        if (istDateKey(at) === today) t.todayPaise += d.amountPaise;
      }
      return [...totals.values()];
    },
    async pendingCount() {
      return store.all("donations").filter((d) => d.status === "pending").length;
    },
  };

  const funds: FundsRepo = { async list() { return clone(SEED_FUNDS); } };
  const tiers: TiersRepo = { async list() { return clone(SEED_TIERS); } };
  const trust: TrustSettingsRepo = { async get() { return clone(SEED_TRUST); } };

  const members: MembersRepo = {
    async listPublic(q = {}) {
      return clone(
        store
          .all("members")
          .filter((m) => m.consentDisplay)
          .filter((m) => (!q.memberType || m.memberType === q.memberType) && matchesSearch(q.search, [m.name, m.nameHi, m.village, m.gotra, m.fatherName]))
          .map((m) => (m.phonePublic ? m : { ...m, phone: undefined }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    async list() {
      return clone(store.all("members"));
    },
    async create(input) {
      return store.mutate("members", (o) => {
        const m = { ...input, id: newId("mem") };
        o.members[m.id] = m;
        return clone(m);
      });
    },
    async update(id, input) {
      return store.mutate("members", (o) => {
        if (!store.all("members").some((m) => m.id === id)) throw new Error("Member not found");
        const m = { ...input, id };
        o.members[id] = m;
        return clone(m);
      });
    },
  };

  const committee: CommitteeRepo = {
    async listPublic() {
      return clone(
        store
          .all("committee")
          .map((c) => (c.phonePublic ? c : { ...c, phone: undefined }))
          .sort((a, b) => a.postRank - b.postRank),
      );
    },
    async list() {
      return clone(store.all("committee").sort((a, b) => a.postRank - b.postRank));
    },
    async create(input) {
      return store.mutate("committee", (o) => {
        const c = { ...input, id: newId("com") };
        o.committee[c.id] = c;
        return clone(c);
      });
    },
    async update(id, input) {
      return store.mutate("committee", (o) => {
        if (!store.all("committee").some((c) => c.id === id)) throw new Error("Committee post not found");
        const c = { ...input, id };
        o.committee[id] = c;
        return clone(c);
      });
    },
  };

  const slotsClash = (a: Booking["slot"], b: Booking["slot"]) => a === "full" || b === "full" || a === b;

  const bookings: BookingsRepo = {
    async publicCalendar(from, to) {
      return store
        .all("bookings")
        .filter((b) => (b.status === "confirmed" || b.status === "tentative") && b.date >= from && b.date <= to)
        .map((b) => ({ date: b.date, slot: b.slot, status: b.status as "confirmed" | "tentative" }));
    },
    async createEnquiry(input) {
      return store.mutate("bookings", (o) => {
        const b: Booking = { ...input, id: newId("bk"), status: "enquiry", createdAt: new Date().toISOString() };
        o.bookings[b.id] = b;
        return clone(b);
      });
    },
    async list() {
      return clone(store.all("bookings").sort((a, b) => a.date.localeCompare(b.date)));
    },
    async setStatus(id, status) {
      return store.mutate("bookings", (o) => {
        const all = store.all("bookings");
        const current = all.find((b) => b.id === id);
        if (!current) throw new Error("Booking not found");
        if (status === "confirmed") {
          const clash = all.find(
            (b) => b.id !== id && b.status === "confirmed" && b.date === current.date && slotsClash(b.slot, current.slot),
          );
          if (clash) throw new BookingConflictError();
        }
        const next = { ...current, status };
        o.bookings[id] = next;
        return clone(next);
      });
    },
    async newEnquiryCount() {
      return store.all("bookings").filter((b) => b.status === "enquiry").length;
    },
  };

  const demo: DemoSettingsRepo = {
    async get() {
      return store.demo();
    },
    async set(patch) {
      return store.mutate("settings", (o) => {
        o.demo = { ...o.demo, ...patch };
        return { ...o.demo };
      });
    },
  };

  return {
    donations, funds, tiers, members, committee, bookings, trust, demo,
    subscribe: (topic, cb) => store.subscribe(topic, cb),
    reset: () => store.reset(),
  };
}
