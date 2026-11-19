import { getTranslations } from "next-intl/server";
import { MembersGrid } from "@/components/people/MembersGrid";
import { PageHeader } from "@/components/site/PageHeader";
import { getRepos } from "@/lib/data";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/members">) {
  const { locale } = await params;
  return pageMetadata(locale, "members", "/members");
}

export default async function MembersPage() {
  const t = await getTranslations("Members");
  const members = await getRepos().members.listPublic();
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} scene="members" />
      <div className="container-site pt-(--space-md)">
        <MembersGrid initial={members} />
      </div>
    </>
  );
}
