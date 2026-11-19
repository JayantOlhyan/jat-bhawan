import { getLocale, getTranslations } from "next-intl/server";

/** Permanent demo notice on every page, in the page's own language (admin is English). */
export async function DemoBanner({ locale }: { locale?: "hi" | "en" }) {
  const t = await getTranslations({ locale: locale ?? (await getLocale()), namespace: "Banner" });
  return (
    <div role="note" className="no-print border-b border-line bg-sand px-(--space-sm) py-(--space-2xs) text-center text-[0.85rem] leading-snug font-medium text-ink sm:text-[0.9rem]">
      {t("text")}
    </div>
  );
}
