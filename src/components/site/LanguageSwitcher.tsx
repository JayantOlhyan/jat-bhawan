"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * The language toggle as text, always "हिंदी | English": the current language
 * bold and underlined, the other a link that keeps the page and its query.
 * Each name is in its own script; the link carries data-testid="lang-switch".
 */
function Toggle({ query, className }: { query?: Record<string, string>; className: string }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "hi" ? "en" : "hi";
  const current = (
    <span key="cur" lang={locale} aria-current="true" className="inline-flex min-h-11 items-center font-bold text-ink underline decoration-brass decoration-2 underline-offset-[6px]">
      {t("languageSelf")}
    </span>
  );
  const link = (
    <Link
      key="other"
      href={query && Object.keys(query).length ? { pathname, query } : pathname}
      locale={other}
      lang={other}
      hrefLang={other}
      aria-label={t("languageLabel")}
      className="inline-flex min-h-11 items-center px-(--space-2xs) font-medium text-ink-soft no-underline hover:text-maroon"
      data-testid="lang-switch"
    >
      {t("language")}
    </Link>
  );
  return (
    <span className={`inline-flex items-center gap-(--space-xs) text-[0.98rem] ${className}`}>
      {locale === "hi" ? current : link}
      <span aria-hidden="true" className="text-brass">|</span>
      {locale === "hi" ? link : current}
    </span>
  );
}

function WithQuery({ className }: { className: string }) {
  const search = useSearchParams();
  return <Toggle query={Object.fromEntries(search.entries())} className={className} />;
}

/** Switches language and keeps the current page (and its query string). */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<Toggle className={className} />}>
      <WithQuery className={className} />
    </Suspense>
  );
}
