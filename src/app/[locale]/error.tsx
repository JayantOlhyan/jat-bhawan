"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Shown when a page fails to render (the site's "500" page), with the way back and to the office. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("ErrorPage");
  const tc = useTranslations("Common");
  const nav = useTranslations("Nav");
  return (
    <div className="container-site max-w-xl py-20 text-center">
      <h1 className="text-[2rem]">{t("title")}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t("body")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-(--space-sm)">
        <button type="button" onClick={reset} className="btn btn-primary">{t("retry")}</button>
        <Link href="/contact" className="btn btn-outline">{nav("contact")}</Link>
        <Link href="/" className="btn btn-quiet">{tc("backHome")}</Link>
      </div>
    </div>
  );
}
