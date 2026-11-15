import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { MAPS_URL, pick, type AppLocale } from "@/lib/format";

/** Colophon block on the ink band: the Trust's name, its address and contacts as one paragraph, the links, the small print. */
export async function Footer() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  const tc = await getTranslations("Common");
  const trust = await getRepos().trust.get();
  const links = ["donors", "hall", "committee", "members", "about", "contact"] as const;
  const policies = ["privacy", "terms", "refund"] as const;
  return (
    <footer className="no-print band-ink mt-(--section-gap-s) border-t-[5px] border-ink">
      <div className="container-site grid gap-(--space-2xl) pt-(--space-3xl) pb-(--space-2xl) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-(--gap-columns)">
        <address className="not-italic">
          <p className="slab text-[clamp(1.75rem,2.4vw+1rem,2.75rem)] leading-tight text-paper">{pick(locale, trust.nameHi, trust.nameEn)}</p>
          <p className="mt-(--space-lg) max-w-[52ch] text-lg leading-relaxed text-paper">
            <PlaceholderText text={pick(locale, trust.addressHi, trust.addressEn)} />. {t("phone")} {trust.phone}, {t("email")} {trust.email}.
          </p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="link-ink mt-(--space-md) text-paper">
            {tc("openMaps")}
          </a>
        </address>
        <div className="grid gap-(--space-lg) min-[25rem]:grid-cols-2 border-t border-paper/40 pt-(--space-lg) lg:border-t-0 lg:border-l lg:pt-0 lg:pl-(--gap-columns)">
          <nav aria-label={t("quickLinks")}>
            <p className="text-sm font-medium text-paper/80">{t("quickLinks")}</p>
            <ul className="mt-(--space-xs)">
              {links.map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="inline-flex min-h-11 items-center text-paper no-underline hover:underline">
                    {tn(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("policies")}>
            <p className="text-sm font-medium text-paper/80">{t("policies")}</p>
            <ul className="mt-(--space-xs)">
              {policies.map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="inline-flex min-h-11 items-center text-paper no-underline hover:underline">
                    {tm(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-paper/40">
        <div className="container-site flex flex-col gap-(--space-2xs) py-(--space-md) text-sm text-paper/80 md:flex-row md:flex-wrap md:justify-between md:gap-x-(--space-lg)">
          <span>{t("rights", { year: 2026 })}</span>
          <span data-credits>
            {t("photos")}{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Woman_harvesting_wheat,_Raisen_district,_Madhya_Pradesh,_India_ggia_version.jpg" className="text-paper">
              {t("photoCredit")}
            </a>
            , {t("photoNote")}
          </span>
          <span>{t("credit")}</span>
        </div>
      </div>
    </footer>
  );
}
