import { getTranslations } from "next-intl/server";
import { BrassRule } from "@/components/site/BrassRule";
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
      <div className="container-site pt-(--space-md)">
        <CommitteeList initial={committee} />
        <section className="mt-(--section-gap-s)" aria-labelledby="past">
          <h2 id="past">{t("pastTitle")}</h2>
          <BrassRule align="start" className="mt-2" />
          <p className="mt-3 text-lg text-ink-soft">{t("pastBody")}</p>
        </section>
      </div>
    </>
  );
}
