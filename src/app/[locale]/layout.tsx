import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { pageRobots } from "@/lib/site";
import { DemoBanner } from "@/components/site/DemoBanner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SiteMotion } from "@/components/motion/SiteMotion";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: { default: t("siteName"), template: `%s` },
    description: t("description"),
    robots: pageRobots,
  };
}

export const viewport: Viewport = {
  themeColor: "#F7F1E6",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Nav" });

  return (
    <html lang={locale} className={`${fontVariables} overflow-x-clip`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        {/* Until hydration the language links are a Suspense fallback without the query string;
            a tap in that window gets the current query added, so the switch keeps the page's filters. */}
        <Script id="lang-switch-keep-query" strategy="beforeInteractive">
          {`document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[data-testid="lang-switch"]');if(a&&!a.search&&location.search)a.search=location.search},true)`}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-(--radius-card) focus:bg-surface focus:p-3 focus:text-maroon"
        >
          {t("skip")}
        </a>
        <NextIntlClientProvider>
          <DemoBanner />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <SiteMotion />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
