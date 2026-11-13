import { describe, expect, it } from "vitest";
import { isGapFree } from "../receipt";
import { createMockRepos } from "./mock/repos";
import { toPublicDonation } from "./public";
import { SEED_DONATIONS, SEED_TIERS } from "./seed";
import type { Donation } from "./types";

const base: Donation = {
  id: "d1",
  fundId: "fund-general",
  amountPaise: 2100000,
  donorName: "Ramesh Dahiya",
  donorFatherName: "Sh. Ram Kishan",
  donorVillage: "Kair",
  donorMobile: "98XXXXXX01",
  donorEmail: "r@example.com",
  display: "full",
  source: "online",
  status: "verified",
  receiptNo: "JBN/2026-27/0001",
  donatedAt: "2026-11-01T06:00:00.000Z",
};

describe("public projection", () => {
  it("never exposes mobile, email, PAN or receipt", () => {
    const p = toPublicDonation({ ...base, donorPan: "ABCDE1234F" }, SEED_TIERS)!;
    const json = JSON.stringify(p);
    expect(json).not.toContain("98XXXXXX01");
    expect(json).not.toContain("r@example.com");
    expect(json).not.toContain("ABCDE1234F");
    expect(json).not.toContain("JBN/");
    expect(p.tierId).toBe("tier-benefactor");
  });
  it("hides the donor for anonymous", () => {
    const p = toPublicDonation({ ...base, display: "anonymous" }, SEED_TIERS)!;
    expect(p.anonymous).toBe(true);
    expect(p.donorName).toBeNull();
    expect(p.donorVillage).toBeNull();
    expect(p.amountPaise).toBe(2100000);
  });
  it("hides amount and tier for hide_amount", () => {
    const p = toPublicDonation({ ...base, display: "hide_amount" }, SEED_TIERS)!;
    expect(p.amountPaise).toBeNull();
    expect(p.tierId).toBeNull();
    expect(p.donorName).toBe("Ramesh Dahiya");
  });
  it.each(["created", "pending", "failed", "void"] as const)("drops %s donations", (status) => {
    expect(toPublicDonation({ ...base, status }, SEED_TIERS)).toBeNull();
  });
});

describe("mock repo (server mode)", () => {
  it("seed has ~120 donations with non-public rows that never leak", async () => {
    expect(SEED_DONATIONS.length).toBe(120);
    const hidden = SEED_DONATIONS.filter((d) => d.status !== "verified");
    expect(hidden.length).toBeGreaterThanOrEqual(8);
    const repos = createMockRepos(false);
    const all = await repos.donations.listPublic({ pageSize: 1000 });
    const ids = new Set(all.items.map((d) => d.id));
    for (const d of hidden) expect(ids.has(d.id)).toBe(false);
    expect(all.total).toBe(120 - hidden.length);
  });
  it("seed receipt numbers are gap-free per FY", () => {
    const issued = SEED_DONATIONS.flatMap((d) => (d.receiptNo ? [d.receiptNo] : []));
    for (const fy of ["2025-26", "2026-27"]) expect(isGapFree("JBN", fy, issued)).toBe(true);
  });
  it("failed payments get no receipt and never appear; verify allocates the next number", async () => {
    const repos = createMockRepos(false);
    const input = {
      fundId: "fund-general", amountPaise: 110000, donorName: "Test", donorFatherName: "F",
      donorVillage: "Kair", donorMobile: "9800000001", display: "full" as const, source: "online" as const,
    };
    const failed = await repos.donations.create(input);
    expect(failed.status).toBe("created");
    await repos.donations.markFailed(failed.id);
    const ok = await repos.donations.create(input);
    const verified = await repos.donations.verify(ok.id, "TEST123");
    expect(verified.receiptNo).toMatch(/^JBN\/\d{4}-\d{2}\/\d{4}$/);
    const latest = await repos.donations.latestPublic(5);
    expect(latest[0].id).toBe(ok.id);
    expect(latest.some((d) => d.id === failed.id)).toBe(false);
    const issued = (await repos.donations.list()).flatMap((d) => (d.receiptNo ? [d.receiptNo] : []));
    const fy = verified.receiptNo!.split("/")[1];
    expect(isGapFree("JBN", fy, issued)).toBe(true);
  });
  it("rejects a second confirm on the same date and slot", async () => {
    const repos = createMockRepos(false);
    const b = await repos.bookings.createEnquiry({
      date: "2026-12-08", slot: "evening", name: "X", mobile: "9800000002", eventType: "Wedding", guests: 100, message: "",
    });
    await expect(repos.bookings.setStatus(b.id, "confirmed")).rejects.toThrow(/already confirmed/);
  });
});
