import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Build-time check for the optional hero building (see src/lib/brand.ts): drop the file in and rebuild.
const heroBuilding = fs.existsSync(path.join(process.cwd(), "public", "brand", "hero-building.webp"))
  ? "/brand/hero-building.webp"
  : "";

/** Security headers on every response (CSP left out: Next's inline bootstrap scripts would need nonces). */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Cache Components are off for the demo; see PLAN.md "Decision: Cache Components off".
  cacheComponents: false,
  partialPrefetching: false,
  env: { NEXT_PUBLIC_HERO_BUILDING: heroBuilding },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
    return [
      { source: "/:path*", headers: [...SECURITY_HEADERS, ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }])] },
      // Admin, API and the share-image template are never indexed.
      { source: "/(admin|api|og-template)/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
