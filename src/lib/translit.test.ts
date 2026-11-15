import { describe, expect, it } from "vitest";
import { ALL_PAIRS } from "./data/seed/names";
import { inScript } from "./translit";

const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN = /[A-Za-z]/;

describe("inScript: every known name reads in the page's script", () => {
  it("maps each dictionary pair exactly, both ways", () => {
    for (const p of ALL_PAIRS) {
      expect(inScript(p.en, "hi")).toBe(p.hi);
      expect(inScript(p.hi, "en")).toBe(p.en);
    }
  });
  it("leaves text already in the right script alone", () => {
    expect(inScript("Ramesh Dahiya", "en")).toBe("Ramesh Dahiya");
    expect(inScript("रमेश दहिया", "hi")).toBe("रमेश दहिया");
    expect(inScript(null, "hi")).toBe("");
  });
  it("converts composed names from the dictionary", () => {
    expect(inScript("रमेश दहिया", "en")).toBe("Ramesh Dahiya");
    expect(inScript("Late Sh. Hari Singh", "hi")).toBe("स्व. श्री हरि सिंह");
    expect(inScript("Satbir Sehrawat", "hi")).toBe("सतबीर सहरावत");
  });
  it("transliterates unknown words by rule, never mixing scripts", () => {
    const toEn = ["अमित", "प्रियंका", "बलजीत", "हरियाणा", "गढ़ी", "कुसुम लता"];
    for (const w of toEn) {
      const out = inScript(w, "en");
      expect(out).not.toMatch(DEVANAGARI);
      expect(out.length).toBeGreaterThan(1);
    }
    expect(inScript("अमित", "en")).toBe("Amit");
    expect(inScript("बलजीत", "en")).toBe("Baljit");
    const toHi = ["Amit", "Priyanka", "Smoke Donor 123", "Test Singh"];
    for (const w of toHi) expect(inScript(w, "hi")).not.toMatch(LATIN);
    expect(inScript("Amit", "hi")).toBe("अमित");
    expect(inScript("Sandeep", "hi")).toBe("संदीप");
  });
});
