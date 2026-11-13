import { test } from "@playwright/test";
import { SEED_DONATIONS } from "../../src/lib/data/seed/donations";

/** Full-page screenshots for review: `npx playwright test screenshots`. Output: screenshots/. */
const receiptId = SEED_DONATIONS.filter((d) => d.status === "verified" && d.amountPaise >= 2100000)[0].id;
const PAGES = [
  ["home", "/hi?sim=0"],
  ["home-en", "/en?sim=0"],
  ["donate", "/hi/donate"],
  ["donors", "/hi/donors"],
  ["hall", "/hi/hall"],
  ["members", "/hi/members"],
  ["committee", "/en/committee"],
  ["receipt", `/hi/receipt/${receiptId}`],
] as const;

for (const width of [375, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: width === 375 ? 2 : 1 });
    for (const [name, path] of PAGES) {
      test(name, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        if (name === "receipt") {
          await page.emulateMedia({ media: "print" });
          await page.screenshot({ path: `screenshots/${name}-print-${width}.png`, fullPage: true });
          await page.emulateMedia({ media: "screen" });
        }
        await page.screenshot({ path: `screenshots/${name}-${width}.png`, fullPage: true });
      });
    }
  });
}
