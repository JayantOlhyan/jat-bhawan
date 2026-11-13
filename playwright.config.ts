import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Runs against the production build (`npm run build` first).
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/hi`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD ?? "e2e-demo-pass" },
  },
});
