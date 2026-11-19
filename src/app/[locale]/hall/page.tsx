import { getTranslations } from "next-intl/server";
import { HallBooking } from "@/components/hall/HallBooking";
import { BrassRule } from "@/components/site/BrassRule";
import { PageHeader } from "@/components/site/PageHeader";
import { PhotoSlot } from "@/components/site/PhotoSlot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { getRepos } from "@/lib/data";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/hall">) {
  const { locale } = await params;
  return pageMetadata(locale, "hall", "/hall");
}

/** Desktop: the hall's photo and particulars on the left, the calendar and enquiry on the right. Phones: stacked. */
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
      <div className="container-site grid gap-(--space-2xl) pt-(--space-md) lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-(--space-xl)">
        <section aria-labelledby="details" className="min-w-0 lg:order-1">
          <PhotoSlot slot="hall" alt={t("photo")} label={t("photo")} jaali className="aspect-[4/3] w-full shadow-(--shadow-raised)" />
          <h2 id="details" className="mt-(--space-xl)">{t("detailsTitle")}</h2>
          <BrassRule align="start" className="mt-(--space-sm)" />
          <dl className="ledger-rows mt-(--space-md)">
            {details.map(([k, v]) => (
              <div key={k} className="grid gap-(--space-2xs) py-(--space-md) sm:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] sm:gap-(--space-lg)">
                <dt className="font-semibold text-maroon">{t(k)}</dt>
                <dd className="text-ink-soft"><PlaceholderText text={t(v)} /></dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="avail" className="min-w-0 lg:order-2">
          <div className="card-raised p-(--space-md) sm:p-(--space-lg)">
            <h2 id="avail" className="text-center text-[clamp(1.4rem,1vw+1.1rem,1.8rem)]">{t("calendarTitle")}</h2>
            <BrassRule className="mt-(--space-sm)" />
            <p className="mt-(--space-sm) mb-(--space-md) text-center text-ink-soft">{t("enquiryLead")}</p>
            <HallBooking officePhone={trust.phone} />
          </div>
        </section>
      </div>
    </>
  );
}
