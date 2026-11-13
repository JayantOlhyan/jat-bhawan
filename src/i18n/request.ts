import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    // Public pages: the [locale] root param (validated with notFound() in app/[locale]/layout.tsx).
    // Admin pages have no [locale] segment; they fall back to the default locale.
    const paramValue = await rootParams.locale().catch(() => undefined);
    locale = hasLocale(routing.locales, paramValue) ? paramValue : routing.defaultLocale;
  }
  return {
    locale,
    timeZone: "Asia/Kolkata",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
