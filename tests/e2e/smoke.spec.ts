import { expect, test, type Page } from "@playwright/test";
import { SEED_DONATIONS } from "../../src/lib/data/seed/donations";

const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? "e2e-demo-pass";
const sampleReceiptId = SEED_DONATIONS.find((d) => d.status === "verified")!.id;

const ROUTES = [
  "", "/donate", "/donate/success", `/receipt/${sampleReceiptId}`, "/donors", "/members",
  "/committee", "/hall", "/about", "/contact", "/privacy", "/terms", "/refund",
];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

for (const locale of ["hi", "en"]) {
  for (const route of ROUTES) {
    test(`GET /${locale}${route} is 200 with no console errors`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(`/${locale}${route}?sim=0`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("note").first()).toContainText("डेमो साइट");
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }
}

test("robots.txt disallows everything and pages are noindex", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \//);
  await page.goto("/hi?sim=0");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("language switcher keeps the current page and query", async ({ page }) => {
  await page.goto("/hi/donors?q=Dahiya&sim=0");
  await page.getByTestId("lang-switch").first().click();
  await expect(page).toHaveURL(/\/en\/donors\?q=Dahiya/);
  await page.goto("/en/hall");
  await page.getByTestId("lang-switch").first().click();
  await expect(page).toHaveURL(/\/hi\/hall$/);
});

async function fillDonateForm(page: Page, name: string) {
  await page.getByRole("radio", { name: "₹2,100" }).click();
  await page.getByLabel(/^Full name/).fill(name);
  await page.getByLabel(/^Father's \/ husband's name/).fill("Sh. Test Singh");
  await page.getByLabel(/^Village \/ area/).fill("Kair");
  await page.getByLabel(/^Mobile number/).fill("9876543210");
  await page.getByRole("checkbox").check();
}

test("donate → test success → receipt, visible live in another tab", async ({ context }) => {
  const watcher = await context.newPage();
  await watcher.goto("/en?sim=0");
  await expect(watcher.getByTestId("ticker")).toBeVisible();

  const page = await context.newPage();
  const errors = trackErrors(page);
  await page.goto("/en/donate?sim=0");
  const name = `Smoke Donor ${Date.now() % 100000}`;
  await fillDonateForm(page, name);
  await page.getByTestId("donate-submit").click();
  await expect(page.getByTestId("payment-dialog")).toBeVisible();
  await page.getByTestId("pay-success").click();

  await expect(page).toHaveURL(/\/en\/donate\/success\?id=/);
  const receiptNo = await page.getByTestId("receipt-no").innerText();
  expect(receiptNo).toMatch(/^JBN\/\d{4}-\d{2}\/\d{4}$/);

  // The other tab's ticker updates via BroadcastChannel within 2 s.
  await expect(watcher.getByTestId("ticker")).toContainText(name, { timeout: 2000 });

  await page.getByTestId("view-receipt").click();
  await expect(page.getByTestId("receipt-number")).toHaveText(receiptNo);
  await expect(page.getByTestId("receipt-amount")).toHaveText("₹2,100");
  await expect(page.getByTestId("words-en")).toHaveText("Rupees Two Thousand One Hundred Only");
  await expect(page.getByTestId("words-hi")).toHaveText("दो हज़ार एक सौ रुपये मात्र");
  await expect(page.getByTestId("receipt")).toContainText("SAMPLE: NOT VALID");

  await page.goto(`/en/donors?q=${encodeURIComponent(name)}`);
  await expect(page.getByTestId("donor-wall")).toContainText(name);
  expect(errors).toEqual([]);
});

test("a failed payment never shows on the wall or ticker", async ({ page }) => {
  await page.goto("/en/donate?sim=0");
  const name = `Failed Payer ${Date.now() % 100000}`;
  await fillDonateForm(page, name);
  await page.getByTestId("donate-submit").click();
  await page.getByTestId("pay-failure").click();
  await expect(page.getByTestId("pay-failed-msg")).toBeVisible();

  await page.goto(`/en/donors?q=${encodeURIComponent(name)}`);
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("wall-total")).toContainText("Showing 0 donations");
  await page.goto("/en?sim=0");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("ticker")).not.toContainText(name);
});

async function adminLogin(page: Page) {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Demo password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("admin offline donation appears on the public wall", async ({ page }) => {
  await adminLogin(page);
  await page.goto("/admin/donations");
  await page.getByTestId("add-offline").click();
  const form = page.getByTestId("offline-form");
  const name = `Offline Donor ${Date.now() % 100000}`;
  await form.getByLabel(/^Reference no/).fill("Cash book p.99");
  await form.getByLabel(/^Amount/).fill("5100");
  await form.getByLabel(/^Donor name/).fill(name);
  await form.getByLabel(/^Father's/).fill("Sh. Ram Kishan");
  await form.getByLabel(/^Village/).fill("Dhansa");
  await form.getByLabel(/^Mobile/).fill("9812345678");
  await form.getByRole("button", { name: "Save donation" }).click();
  await expect(page.getByRole("status")).toContainText(/Receipt JBN\//);

  await page.goto(`/en/donors?q=${encodeURIComponent(name)}`);
  await expect(page.getByTestId("donor-wall")).toContainText(name);
  await expect(page.getByTestId("donor-wall")).toContainText("₹5,100");
});

test("confirming a booking blocks the date on /hall; a clashing confirm is rejected", async ({ page }) => {
  // 1. A public enquiry for 20 Dec 2026 (evening) — the seed already has another enquiry for that slot.
  await page.goto("/en/hall");
  await page.getByLabel(/^Date/).fill("2026-12-20");
  await page.getByLabel(/^Slot/).selectOption("evening");
  await page.getByLabel(/^Your name/).fill("Clash Tester");
  await page.getByLabel(/^Mobile number/).fill("9811111111");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByTestId("enquiry-done")).toBeVisible();

  // 2. Admin confirms the seed enquiries for 18 Dec (full) and 20 Dec (evening)…
  await adminLogin(page);
  await page.goto("/admin/bookings");
  const list = page.getByTestId("bookings-list");
  await list.locator("li", { hasText: "18 December 2026" }).first().locator('[data-action="confirmed"]').click();
  await expect(page.getByTestId("booking-msg")).toContainText("is now confirmed");
  await list.locator("li", { hasText: "20 December 2026" }).filter({ hasNotText: "Clash Tester" }).first().locator('[data-action="confirmed"]').click();
  await expect(page.getByTestId("booking-msg")).toContainText("is now confirmed");

  // …and a second confirm on the same date + slot is rejected.
  await list.locator("li", { hasText: "Clash Tester" }).locator('[data-action="confirmed"]').click();
  await expect(page.getByTestId("booking-msg")).toContainText("Cannot confirm");

  // 3. The public calendar now shows 18 Dec as booked, and new enquiries for it are blocked.
  await page.goto("/en/hall");
  const cell = page.locator('[data-day="2026-12-18"]');
  for (let i = 0; i < 3 && !(await cell.count()); i++) {
    await page.getByRole("button", { name: "Next month" }).click();
  }
  await expect(cell).toHaveAttribute("data-status", "booked");
  await expect(cell).toHaveAttribute("aria-label", /Booked/);
  await page.getByLabel(/^Date/).fill("2026-12-18");
  await expect(page.getByText("This date and slot is already booked")).toBeVisible();
});
