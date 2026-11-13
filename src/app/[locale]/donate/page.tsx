import { getTranslations } from "next-intl/server";
import { DonateForm } from "@/components/donate/DonateForm";
import { PageHeader } from "@/components/site/PageHeader";
import { getRepos } from "@/lib/data";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/donate">) {
  const { locale } = await params;
  return pageMetadata(locale, "donate", "/donate");
}

export default async function DonatePage() {
  const t = await getTranslations("Donate");
  const repos = getRepos();
  const [funds, trust, demo] = await Promise.all([repos.funds.list(), repos.trust.get(), repos.demo.get()]);
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site py-(--section-gap-s)">
        <div className="max-w-4xl">
        <DonateForm funds={funds} trust={trust} initialUpiManual={demo.upiManual} />
        </div>
      </div>
    </>
  );
}
