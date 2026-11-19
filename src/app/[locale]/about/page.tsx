import { getTranslations } from "next-intl/server";
import { BrassRule } from "@/components/site/BrassRule";
import { PageHeader } from "@/components/site/PageHeader";
import { PhotoSlot } from "@/components/site/PhotoSlot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  return pageMetadata(locale, "about", "/about");
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  const th = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const mission = t.raw("mission") as string[];
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site grid gap-(--space-2xl) pt-(--space-md) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-(--space-3xl)">
        <div className="space-y-(--space-2xl)">
          <section>
            <h2>{th("historyTitle")}</h2>
            <BrassRule align="start" className="mt-(--space-sm)" />
            <p className="mt-(--space-lg) text-lg"><PlaceholderText text={th("historyBody")} /></p>
          </section>
          <section>
            <h2>{t("missionTitle")}</h2>
            <BrassRule align="start" className="mt-(--space-sm)" />
            <ul className="ledger-rows card-raised mt-(--space-lg) px-(--space-lg)">
              {mission.map((m) => (
                <li key={m} className="py-(--space-md) text-lg">{m}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{t("trustTitle")}</h2>
            <BrassRule align="start" className="mt-(--space-sm)" />
            <p className="mt-(--space-lg) text-lg">{t("trustBody")}</p>
          </section>
        </div>
        <PhotoSlot slot="story" alt={th("heroPhoto")} label={tc("photoHere")} className="aspect-[3/4] w-full lg:sticky lg:top-28 lg:h-fit" />
      </div>
    </>
  );
}
