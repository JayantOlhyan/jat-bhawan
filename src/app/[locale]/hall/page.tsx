import { getTranslations } from "next-intl/server";
import { HallBooking } from "@/components/hall/HallBooking";
import { PageHeader } from "@/components/site/PageHeader";
import { Slot } from "@/components/site/Slot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { getRepos } from "@/lib/data";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/hall">) {
  const { locale } = await params;
  return pageMetadata(locale, "hall", "/hall");
}

export default async function HallPage() {
  const t = await getTranslations("Hall");
  const trust = await getRepos().trust.get();
  const details = [
    ["capacity", "capacityValue"],
    ["facilities", "facilitiesValue"],
    ["rules", "rulesValue"],
    ["rate", "rateValue"],
  ] as const;
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <section aria-labelledby="avail" className="container-site py-(--section-gap-s)">
        <h2 id="avail" className="section-title">{t("calendarTitle")}</h2>
        <hr className="rule-mark mt-(--space-md)" />
        <p className="lead mt-(--space-lg) mb-(--space-2xl) text-ink-2">{t("enquiryLead")}</p>
        <HallBooking officePhone={trust.phone} />
      </section>
      <section aria-labelledby="details" className="border-t-2 border-ink">
        <div className="container-site grid gap-(--space-2xl) py-(--section-gap-s) lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--space-3xl)">
          <div>
            <h2 id="details" className="section-title">{t("detailsTitle")}</h2>
            <hr className="rule-mark mt-(--space-md)" />
            <Slot slot="hall" alt={t("photo")} className="mt-(--space-xl) aspect-[4/3] w-full" />
          </div>
          <dl className="ledger-rows border-t-2 border-ink">
            {details.map(([k, v]) => (
              <div key={k} className="grid gap-(--space-2xs) py-(--space-lg) sm:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] sm:gap-(--space-lg)">
                <dt className="font-serif text-xl">{t(k)}</dt>
                <dd className="text-lg text-ink-2"><PlaceholderText text={t(v)} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
