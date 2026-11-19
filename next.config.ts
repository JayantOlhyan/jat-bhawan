import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Build-time check for the optional hero building (see src/lib/brand.ts): drop the file in and rebuild.
const heroBuilding = fs.existsSync(path.join(process.cwd(), "public", "brand", "hero-building.webp"))
  ? "/brand/hero-building.webp"
  : "";

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
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
