"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";

function SwitchLink({ query, className }: { query?: Record<string, string>; className: string }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "hi" ? "en" : "hi";
  return (
    <Link
      href={query && Object.keys(query).length ? { pathname, query } : pathname}
      locale={other}
      lang={other}
      hrefLang={other}
      aria-label={t("languageLabel")}
      className={`btn btn-quiet min-w-[5.5rem] ${className}`}
      data-testid="lang-switch"
    >
      {t("language")}
    </Link>
  );
}

function WithQuery({ className }: { className: string }) {
  const search = useSearchParams();
  return <SwitchLink query={Object.fromEntries(search.entries())} className={className} />;
}

/** Switches language and keeps the current page (and its query string). */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<SwitchLink className={className} />}>
      <WithQuery className={className} />
    </Suspense>
  );
}
