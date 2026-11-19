import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, siteUrl } from "@/lib/site";

/** Every public page in Hindi and English, each listing its other-language twin (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return PUBLIC_PATHS.flatMap((p) =>
    (["hi", "en"] as const).map((loc) => ({
      url: `${base}/${loc}${p}`,
      lastModified: now,
      changeFrequency: p === "/donors" || p === "/hall" ? ("daily" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p === "/donate" || p === "/hall" ? 0.9 : 0.6,
      alternates: { languages: { hi: `${base}/hi${p}`, en: `${base}/en${p}`, "x-default": `${base}/hi${p}` } },
    })),
  );
}
