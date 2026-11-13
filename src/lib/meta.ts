import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type MetaKey =
  | "home" | "donate" | "success" | "receipt" | "donors" | "members" | "committee"
  | "hall" | "about" | "contact" | "privacy" | "terms" | "refund" | "notFound";

/** Per-page metadata. Everything is noindex for the demo. */
export async function pageMetadata(locale: string, key: MetaKey, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const site = t("siteName");
  return {
    title: key === "home" ? site : `${t(key)} | ${site}`,
    description: t("description"),
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    alternates: {
      languages: { hi: `/hi${path}`, en: `/en${path}` },
    },
  };
}
