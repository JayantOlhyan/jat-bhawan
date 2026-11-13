import { describe, expect, it } from "vitest";
import {
  amountInWordsEn,
  amountInWordsHi,
  formatINR,
  groupIndian,
  HI_0_TO_99,
  integerToWordsEn,
  integerToWordsHi,
  rupeesToPaise,
} from "./money";

const p = rupeesToPaise;

describe("Indian formatting", () => {
  it("groups digits the Indian way", () => {
    expect(groupIndian(0)).toBe("0");
    expect(groupIndian(999)).toBe("999");
    expect(groupIndian(1000)).toBe("1,000");
    expect(groupIndian(100000)).toBe("1,00,000");
    expect(groupIndian(1000000)).toBe("10,00,000");
    expect(groupIndian(12345678)).toBe("1,23,45,678");
  });
  it("formats paise as rupees with Latin digits", () => {
    expect(formatINR(p(501))).toBe("₹501");
    expect(formatINR(p(100000))).toBe("₹1,00,000");
    expect(formatINR(p(251000))).toBe("₹2,51,000");
    expect(formatINR(10050)).toBe("₹100.50");
    expect(formatINR(5)).toBe("₹0.05");
  });
  it("rejects non-integer paise", () => {
    expect(() => formatINR(10.5)).toThrow();
    expect(() => formatINR(-1)).toThrow();
  });
  it("converts rupees to integer paise without float drift", () => {
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
  });
});

describe("amount in words — English", () => {
  const cases: Array<[number, string]> = [
    [0, "Zero"],
    [1, "One"],
    [15, "Fifteen"],
    [99, "Ninety-Nine"],
    [100, "One Hundred"],
    [101, "One Hundred One"],
    [1100, "One Thousand One Hundred"],
    [21000, "Twenty-One Thousand"],
    [100000, "One Lakh"],
    [100001, "One Lakh One"],
    [1000000, "Ten Lakh"],
    [12345678, "One Crore Twenty-Three Lakh Forty-Five Thousand Six Hundred Seventy-Eight"],
  ];
  it.each(cases)("%i → %s", (n, words) => {
    expect(integerToWordsEn(n)).toBe(words);
  });
  it("wraps with Rupees … Only", () => {
    expect(amountInWordsEn(p(21000))).toBe("Rupees Twenty-One Thousand Only");
    expect(amountInWordsEn(10050)).toBe("Rupees One Hundred and Fifty Paise Only");
  });
});

describe("amount in words — Hindi", () => {
  it("has a complete 0–99 table", () => {
    expect(HI_0_TO_99).toHaveLength(100);
    expect(new Set(HI_0_TO_99).size).toBe(100);
  });
  const cases: Array<[number, string]> = [
    [0, "शून्य"],
    [1, "एक"],
    [15, "पंद्रह"],
    [99, "निन्यानवे"],
    [100, "एक सौ"],
    [101, "एक सौ एक"],
    [1100, "एक हज़ार एक सौ"],
    [21000, "इक्कीस हज़ार"],
    [100000, "एक लाख"],
    [100001, "एक लाख एक"],
    [1000000, "दस लाख"],
    [12345678, "एक करोड़ तेईस लाख पैंतालीस हज़ार छह सौ अठहत्तर"],
  ];
  it.each(cases)("%i → %s", (n, words) => {
    expect(integerToWordsHi(n)).toBe(words);
  });
  it("spot-checks irregular words", () => {
    expect(HI_0_TO_99[39]).toBe("उनतालीस");
    expect(HI_0_TO_99[49]).toBe("उनचास");
    expect(HI_0_TO_99[79]).toBe("उन्यासी");
    expect(HI_0_TO_99[89]).toBe("नवासी");
  });
  it("wraps with रुपये मात्र", () => {
    expect(amountInWordsHi(p(51000))).toBe("इक्यावन हज़ार रुपये मात्र");
    expect(amountInWordsHi(p(251000))).toBe("दो लाख इक्यावन हज़ार रुपये मात्र");
  });
});
