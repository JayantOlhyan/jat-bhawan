import { describe, expect, it } from "vitest";
import { fyLabel, fyStartYear } from "./fy";
import { rupeesToPaise } from "./money";
import { formatReceiptNo, isGapFree, nextReceiptNo, parseReceiptNo } from "./receipt";
import { tierFor } from "./tiers";
import { SEED_TIERS } from "./data/seed/static";

describe("financial year (IST)", () => {
  it("31 March belongs to the previous FY, 1 April starts a new one", () => {
    // 31 Mar 2026 23:59 IST = 18:29 UTC
    expect(fyLabel(new Date("2026-03-31T18:29:00Z"))).toBe("2025-26");
    // 1 Apr 2026 00:00 IST = 31 Mar 18:30 UTC
    expect(fyLabel(new Date("2026-03-31T18:30:00Z"))).toBe("2026-27");
    expect(fyStartYear(new Date("2026-04-01T06:00:00Z"))).toBe(2026);
  });
  it("labels the turn of the century", () => {
    expect(fyLabel(new Date("2099-06-01T00:00:00Z"))).toBe("2099-00");
  });
});

describe("receipt numbers", () => {
  it("formats and parses", () => {
    expect(formatReceiptNo("JBN", "2026-27", 1)).toBe("JBN/2026-27/0001");
    expect(parseReceiptNo("JBN/2026-27/0042")).toEqual({ prefix: "JBN", fy: "2026-27", seq: 42 });
    expect(parseReceiptNo("garbage")).toBeNull();
  });
  it("sequences per FY without gaps and restarts on 1 April", () => {
    const issued: string[] = [];
    const dates = [
      "2026-03-30T06:00:00Z",
      "2026-03-31T10:00:00Z",
      "2026-03-31T18:30:00Z", // 1 Apr IST
      "2026-04-02T06:00:00Z",
      "2026-05-01T06:00:00Z",
    ];
    for (const d of dates) issued.push(nextReceiptNo("JBN", new Date(d), issued));
    expect(issued).toEqual([
      "JBN/2025-26/0001",
      "JBN/2025-26/0002",
      "JBN/2026-27/0001",
      "JBN/2026-27/0002",
      "JBN/2026-27/0003",
    ]);
    expect(isGapFree("JBN", "2025-26", issued)).toBe(true);
    expect(isGapFree("JBN", "2026-27", issued)).toBe(true);
    expect(isGapFree("JBN", "2026-27", ["JBN/2026-27/0001", "JBN/2026-27/0003"])).toBe(false);
  });
  it("ignores other prefixes", () => {
    expect(nextReceiptNo("JBN", new Date("2026-06-01T00:00:00Z"), ["XYZ/2026-27/0009"])).toBe("JBN/2026-27/0001");
  });
});

describe("tier assignment", () => {
  const cases: Array<[number, string]> = [
    [1, "tier-donor"],
    [10999, "tier-donor"],
    [11000, "tier-supporter"],
    [20999, "tier-supporter"],
    [21000, "tier-benefactor"],
    [50999, "tier-benefactor"],
    [51000, "tier-grand"],
    [99999, "tier-grand"],
    [100000, "tier-patron"],
    [251000, "tier-patron"],
  ];
  it.each(cases)("₹%i → %s", (rupees, id) => {
    expect(tierFor(rupeesToPaise(rupees), SEED_TIERS)?.id).toBe(id);
  });
  it("is exact at the paisa boundary", () => {
    expect(tierFor(rupeesToPaise(11000) - 1, SEED_TIERS)?.id).toBe("tier-donor");
  });
});
