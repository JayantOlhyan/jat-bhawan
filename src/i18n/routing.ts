import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hi", "en"],
  defaultLocale: "hi",
  localePrefix: "always",
  // Hindi-first audience: "/" always opens Hindi, whatever the browser language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
