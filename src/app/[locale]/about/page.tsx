import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { Slot, STAND_INS } from "@/components/site/Slot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  return pageMetadata(locale, "about", "/about");
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  const th = await getTranslations("Home");
  const mission = t.raw("mission") as string[];
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site grid gap-(--space-2xl) py-(--section-gap-s) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-(--space-3xl)">
        <div className="space-y-(--space-2xl)">
          <section>
            <h2 className="section-title">{th("historyTitle")}</h2>
            <hr className="rule-mark mt-(--space-md)" />
            <p className="mt-(--space-lg) text-lg"><PlaceholderText text={th("historyBody")} /></p>
          </section>
          <section className="border-t border-rule pt-(--space-xl)">
            <h2 className="section-title">{t("missionTitle")}</h2>
            <ul className="mt-(--space-lg) ledger-rows border-t-2 border-ink">
              {mission.map((m) => (
                <li key={m} className="py-(--space-md) text-lg">{m}</li>
              ))}
            </ul>
          </section>
          <section className="border-t border-rule pt-(--space-xl)">
            <h2 className="section-title">{t("trustTitle")}</h2>
            <p className="mt-(--space-lg) text-lg">{t("trustBody")}</p>
          </section>
        </div>
        <div className="frame-photo h-fit lg:sticky lg:top-(--space-4xl)">
          <Slot slot="story" alt={th("heroPhoto")} standIn={{ src: STAND_INS.harvest, alt: th("harvestAlt") }} objectPosition="25% 55%" className="aspect-[3/4] w-full" />
        </div>
      </div>
    </>
  );
}
