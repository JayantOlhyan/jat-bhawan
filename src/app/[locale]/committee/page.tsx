import { getTranslations } from "next-intl/server";
import { CommitteeList } from "@/components/people/CommitteeList";
import { PageHeader } from "@/components/site/PageHeader";
import { getRepos } from "@/lib/data";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/committee">) {
  const { locale } = await params;
  return pageMetadata(locale, "committee", "/committee");
}

export default async function CommitteePage() {
  const t = await getTranslations("Committee");
  const committee = await getRepos().committee.listPublic();
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site py-(--section-gap-s)">
        <CommitteeList initial={committee} />
        <section className="mt-12" aria-labelledby="past">
          <h2 id="past" className="section-title">{t("pastTitle")}</h2>
          <hr className="rule-gold mt-2" />
          <p className="mt-3 text-lg text-ink-2">{t("pastBody")}</p>
        </section>
      </div>
    </>
  );
}
