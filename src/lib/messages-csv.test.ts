import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import { BOM, csvCell, toCsv } from "./csv";

type Tree = { [k: string]: string | string[] | Tree };
const keys = (o: Tree, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}${Array.isArray(v) ? `[${v.length}]` : ""}`],
  );

describe("messages", () => {
  it("hi and en have identical keys (full parity)", () => {
    expect(keys(hi as Tree).sort()).toEqual(keys(en as Tree).sort());
  });
  it("Hindi strings are written in Devanagari", () => {
    expect(hi.Banner.text).toMatch(/[ऀ-ॿ]/);
    expect(hi.Nav.donate).toBe("दान करें");
    expect(hi.Common.anonymous).toBe("गुप्त दान");
  });
});

describe("csv", () => {
  it("starts with a UTF-8 BOM and keeps Devanagari", () => {
    const csv = toCsv(["Name"], [["रमेश दहिया"]]);
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv).toContain("रमेश दहिया");
  });
  it("quotes commas and quotes, and neutralises formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
  });
});
