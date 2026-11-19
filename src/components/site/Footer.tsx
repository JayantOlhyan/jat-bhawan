import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import { LineIcon } from "@/components/ui/LineIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { MAPS_URL, pick, type AppLocale } from "@/lib/format";
import { SiteLogo } from "./SiteLogo";

/** Maroon footer, ivory text: the Trust, its address and phone, the links, the policies, the credit. */
export async function Footer() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  const tc = await getTranslations("Common");
  const th = await getTranslations("Home");
  const trust = await getRepos().trust.get();
  const links = ["donors", "hall", "committee", "members", "about", "contact"] as const;
  const policies = ["privacy", "terms", "refund"] as const;
  const linkCls = "inline-flex min-h-11 items-center text-ivory no-underline hover:text-ivory hover:underline decoration-brass-light underline-offset-4";
  return (
    <footer className="no-print mt-(--section-gap) bg-maroon text-ivory">
      <div className="container-site grid gap-(--space-xl) pt-(--space-2xl) pb-(--space-xl) lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-(--gap-columns)">
        <address className="not-italic">
          <div className="flex items-center gap-(--space-sm)">
            <SiteLogo letter={th("titleLine1").slice(0, 1)} size={48} tone="ivory" />
            <p className="font-heading text-[clamp(1.4rem,1.2vw+1rem,2rem)] leading-tight">{pick(locale, trust.nameHi, trust.nameEn)}</p>
          </div>
          <ul className="mt-(--space-lg) space-y-(--space-xs) text-[1.02rem]">
            <li className="flex gap-(--space-sm)">
              <LineIcon name="pin" className="mt-1 size-5 shrink-0 text-brass-light" />
              <span><span className="sr-only">{t("address")}: </span><PlaceholderText text={pick(locale, trust.addressHi, trust.addressEn)} /></span>
            </li>
            <li className="flex gap-(--space-sm)">
              <LineIcon name="phone" className="mt-1 size-5 shrink-0 text-brass-light" />
              <span><span className="sr-only">{t("phone")}: </span><a href={`tel:${trust.phone}`} className="text-ivory">{trust.phone}</a></span>
            </li>
            <li className="flex gap-(--space-sm)">
              <LineIcon name="mail" className="mt-1 size-5 shrink-0 text-brass-light" />
              <span><span className="sr-only">{t("email")}: </span><a href={`mailto:${trust.email}`} className="text-ivory">{trust.email}</a></span>
            </li>
          </ul>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={`${linkCls} mt-(--space-xs) font-semibold underline`}>
            {tc("openMaps")}
          </a>
        </address>
        <div className="grid gap-(--space-lg) border-t border-ivory/25 pt-(--space-lg) min-[25rem]:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-(--gap-columns)">
          <nav aria-label={t("quickLinks")}>
            <p className="text-sm font-semibold text-brass-light">{t("quickLinks")}</p>
            <ul className="mt-(--space-xs)">
              {links.map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className={linkCls}>{tn(k)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("policies")}>
            <p className="text-sm font-semibold text-brass-light">{t("policies")}</p>
            <ul className="mt-(--space-xs)">
              {policies.map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className={linkCls}>{tm(k)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-ivory/25">
        <div className="container-site flex flex-col gap-(--space-2xs) py-(--space-md) text-sm text-ivory/90 md:flex-row md:justify-between md:gap-x-(--space-lg)">
          <span>{t("rights", { year: 2026 })}</span>
          <span>{t("credit")}</span>
        </div>
      </div>
    </footer>
  );
}
