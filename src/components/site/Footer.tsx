import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { MAPS_URL, pick, type AppLocale } from "@/lib/format";

/** Letter close: a sign-off from the Trust, its address, then the page's links and the small print. */
export async function Footer() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  const tc = await getTranslations("Common");
  const trust = await getRepos().trust.get();
  return (
    <footer className="no-print mt-(--space-3xl) border-t-[5px] border-double border-gold bg-paper-2 text-ink">
      <div className="container-site grid gap-(--space-xl) py-(--space-3xl) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <address className="not-italic">
          <p className="text-lg text-ink-2">{t("signoff")}</p>
          <p className="mt-(--space-xs) font-serif text-[clamp(1.9rem,3vw+1rem,3rem)] leading-tight">{pick(locale, trust.nameHi, trust.nameEn)}</p>
          <p className="mt-(--space-md) text-lg"><PlaceholderText text={pick(locale, trust.addressHi, trust.addressEn)} /></p>
          <dl className="mt-(--space-md) grid grid-cols-[auto_1fr] gap-x-(--space-md) gap-y-(--space-2xs)">
            <dt className="text-ink-2">{t("phone")}</dt>
            <dd>{trust.phone}</dd>
            <dt className="text-ink-2">{t("email")}</dt>
            <dd>{trust.email}</dd>
          </dl>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-(--space-lg)">
            {tc("openMaps")}
          </a>
        </address>
        <div className="grid gap-(--space-lg) sm:grid-cols-2">
          <nav aria-label={t("quickLinks")}>
            <p className="font-semibold">{t("quickLinks")}</p>
            <ul className="mt-(--space-xs)">
              {(["donors", "hall", "committee", "members", "about", "contact"] as const).map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="inline-flex min-h-11 items-center text-ink-2 hover:text-accent">
                    {tn(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t("policies")}>
            <p className="font-semibold">{t("policies")}</p>
            <ul className="mt-(--space-xs)">
              {(["privacy", "terms", "refund"] as const).map((k) => (
                <li key={k}>
                  <Link href={`/${k}`} className="inline-flex min-h-11 items-center text-ink-2 hover:text-accent">
                    {tm(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="container-site flex flex-col gap-(--space-2xs) py-(--space-md) text-sm text-ink-2 md:flex-row md:flex-wrap md:justify-between md:gap-x-(--space-lg)">
          <span>{t("rights", { year: 2026 })}</span>
          <span data-credits>
            {t("photos")}{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Woman_harvesting_wheat,_Raisen_district,_Madhya_Pradesh,_India_ggia_version.jpg">
              Yann Forget
            </a>{" "}
            (CC BY-SA 3.0, Wikimedia Commons), {t("photoNote")}
          </span>
          <span>{t("credit")}</span>
        </div>
      </div>
    </footer>
  );
}
