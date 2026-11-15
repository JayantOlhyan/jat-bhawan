import { expect, test, type Page } from "@playwright/test";
import { SEED_DONATIONS } from "../../src/lib/data/seed/donations";

/**
 * A Hindi page is wholly Hindi and an English page wholly English: visible
 * text, the title, and the words read aloud (aria-label, alt, placeholder,
 * title). Allowed through: identifiers and data formats that have no Hindi
 * form (receipt and phone numbers, emails, URLs, the UPI id, the PAN pattern)
 * and the language switch, which names the other language in its own script.
 */
const receiptId = SEED_DONATIONS.find((d) => d.status === "verified")!.id;
const ROUTES = [
  "", "/donate", `/receipt/${receiptId}`, "/donors", "/members", "/committee", "/hall",
  "/about", "/contact", "/privacy", "/terms", "/refund", "/no-such-page",
];

const DEVANAGARI = /[ऀ-ॿ]+/g;
const LATIN = /[A-Za-z]+/g;
const IDENTIFIERS = [
  /\b[A-Z]{2,5}\/\d{4}-\d{2}\/\d{4,}\b/g, // receipt numbers, JBN/2026-27/0001
  /\b98X+\d*\b/g, // sample mobiles
  /[\w.+-]+@[\w-]+(\.[\w-]+)*/g, // emails and UPI ids
  /https?:\/\/\S+/g,
  /\bREG\/X+\/X+\b/g, // registration number placeholder
  /\bTESTPAY\w+\b/g, // test payment references
];

async function pageWords(page: Page): Promise<string> {
  return page.evaluate(() => {
    const skip = (el: Element) => el.closest("[data-testid=lang-switch]");
    const parts: string[] = [document.title];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || skip(el) || el.closest("script,style,noscript,[data-nextjs-dialog-overlay],nextjs-portal")) continue;
      parts.push(n.textContent ?? "");
    }
    for (const el of document.body.querySelectorAll("[aria-label],[alt],[placeholder],[title]")) {
      if (skip(el)) continue;
      for (const a of ["aria-label", "alt", "placeholder", "title"]) {
        const v = el.getAttribute(a);
        if (v) parts.push(v);
      }
    }
    return parts.join(" ");
  });
}

function strayWords(text: string, locale: "hi" | "en"): string[] {
  let s = text;
  for (const re of IDENTIFIERS) s = s.replace(re, " ");
  return [...new Set(s.match(locale === "hi" ? LATIN : DEVANAGARI) ?? [])];
}

for (const locale of ["hi", "en"] as const) {
  for (const route of ROUTES) {
    test(`/${locale}${route} is written in one language`, async ({ page }) => {
      await page.goto(`/${locale}${route}?sim=0`);
      await page.waitForLoadState("networkidle");
      expect(strayWords(await pageWords(page), locale)).toEqual([]);
    });
  }
}

test("a donor who types in the other script is shown in the page's script", async ({ page }) => {
  await page.goto("/hi/donate?sim=0");
  await page.getByRole("radio", { name: "₹2,100" }).click();
  await page.getByLabel(/^पूरा नाम/).fill("Amit Dahiya");
  await page.getByLabel(/^पिता/).fill("Sh. Ram Kishan");
  await page.getByLabel(/^गाँव/).fill("Kair");
  await page.getByLabel(/^मोबाइल/).fill("9876543210");
  await page.getByRole("checkbox").check();
  await page.getByTestId("donate-submit").click();
  await page.getByTestId("pay-success").click();
  await expect(page).toHaveURL(/\/hi\/donate\/success\?id=/);
  expect(strayWords(await pageWords(page), "hi")).toEqual([]);
  await page.goto("/hi/donors?q=Amit&sim=0");
  await expect(page.getByTestId("donor-wall")).toContainText("अमित दहिया");
  await page.goto("/en/donors?q=Amit&sim=0");
  await expect(page.getByTestId("donor-wall")).toContainText("Amit Dahiya");
  expect(strayWords(await pageWords(page), "en")).toEqual([]);
});
