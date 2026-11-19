import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type MetaKey =
  | "home" | "donate" | "success" | "receipt" | "donors" | "members" | "committee"
  | "hall" | "about" | "contact" | "privacy" | "terms" | "refund" | "notFound";

/** The share image (public/brand/og.png, made by `npm run og`). */
export const OG_IMAGE = { url: "/brand/og.png", width: 1200, height: 630 } as const;

/**
 * Absolute base for share links (WhatsApp and others need full URLs):
 * NEXT_PUBLIC_SITE_URL, else Netlify's own URL, else localhost.
 */
export function siteBase(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000");
}

/** Per-page metadata. Everything is noindex for the demo. */
export async function pageMetadata(locale: string, key: MetaKey, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const site = t("siteName");
  const title = key === "home" ? site : `${t(key)} | ${site}`;
  const image = { ...OG_IMAGE, alt: site };
  return {
    metadataBase: siteBase(),
    title,
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: site,
      title,
      description: t("description"),
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      url: `/${locale}${path}`,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: t("description"), images: [image] },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    alternates: {
      languages: { hi: `/hi${path}`, en: `/en${path}` },
    },
  };
}
