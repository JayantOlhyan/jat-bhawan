import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageRobots, siteUrl } from "./site";

type MetaKey =
  | "home" | "donate" | "success" | "receipt" | "donors" | "members" | "committee"
  | "hall" | "about" | "contact" | "privacy" | "terms" | "refund" | "notFound";

/** Pages with their own search title and description (Meta.seo.*); the rest use the generic ones. */
const SEO_KEYS = ["home", "donate", "donors", "hall", "committee", "members", "about", "contact", "privacy", "terms", "refund"] as const;
type SeoKey = (typeof SEO_KEYS)[number];
const isSeoKey = (k: MetaKey): k is SeoKey => (SEO_KEYS as readonly string[]).includes(k);

/** The share image (public/brand/og.png, made by `npm run og`). */
export const OG_IMAGE = { url: "/brand/og.png", width: 1200, height: 630 } as const;

/** Absolute base for canonical and share links. */
export function siteBase(): URL {
  return new URL(siteUrl());
}

/**
 * Per-page metadata: unique title and description, a self-referencing canonical,
 * hreflang for both languages (x-default = Hindi), Open Graph and Twitter cards.
 * Indexing follows the launch switch in src/lib/site.ts (noindex for the demo).
 */
export async function pageMetadata(locale: string, key: MetaKey, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const site = t("siteName");
  const title = isSeoKey(key) ? t(`seo.${key}.title`) : `${t(key)} | ${site}`;
  const description = isSeoKey(key) ? t(`seo.${key}.description`) : t("description");
  const image = { ...OG_IMAGE, alt: site };
  const url = `/${locale}${path}`;
  return {
    metadataBase: siteBase(),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site,
      title,
      description,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      alternateLocale: locale === "hi" ? ["en_IN"] : ["hi_IN"],
      url,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: pageRobots,
    alternates: {
      canonical: url,
      languages: { hi: `/hi${path}`, en: `/en${path}`, "x-default": `/hi${path}` },
    },
  };
}
