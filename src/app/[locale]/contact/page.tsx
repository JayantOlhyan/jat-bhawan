import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { getRepos } from "@/lib/data";
import { MAPS_URL, pick, type AppLocale } from "@/lib/format";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  return pageMetadata(locale, "contact", "/contact");
}

export default async function ContactPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Contact");
  const tf = await getTranslations("Footer");
  const tc = await getTranslations("Common");
  const trust = await getRepos().trust.get();
  const rows = [
    [tf("address"), pick(locale, trust.addressHi, trust.addressEn)],
    [tf("phone"), trust.phone],
    [tf("email"), trust.email],
    [t("hours"), t("hoursValue")],
  ];
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site py-(--section-gap-s)">
        <dl className="ledger-rows border-t-2 border-ink">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-(--space-2xs) py-(--space-lg) md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-(--gap-columns)">
              <dt className="font-medium text-ink-2">{k}</dt>
              <dd className="font-serif text-[clamp(1.3rem,1vw+1rem,1.8rem)] leading-snug break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-(--space-xl) text-lg">
          {tc("openMaps")}
        </a>
      </div>
    </>
  );
}
