// npm run og: screenshots the dev-only /og-template route to public/brand/og.png (1200 × 630).
// Uses a dev server already running at OG_BASE (default http://localhost:3000), or starts one.
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "@playwright/test";

const OUT = path.join(process.cwd(), "public", "brand", "og.png");
let base = process.env.OG_BASE ?? "http://localhost:3000";

async function up(url) {
  try {
    const res = await fetch(`${url}/og-template`);
    return res.ok;
  } catch {
    return false;
  }
}

let server = null;
if (!(await up(base))) {
  base = "http://localhost:3123";
  console.log(`No dev server with /og-template found; starting one on ${base} …`);
  server = spawn("npx", ["next", "dev", "--port", "3123"], { stdio: "ignore", detached: true });
  const until = Date.now() + 120_000;
  while (!(await up(base))) {
    if (Date.now() > until) throw new Error("Dev server did not start in time");
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/og-template`, { waitUntil: "networkidle" });
  // Hide the Next dev-tools badge; wait for the site fonts and every layer.
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
  });
  await page.locator("#og").screenshot({ path: OUT });
  console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
} finally {
  await browser.close();
  if (server) process.kill(-server.pid);
}
