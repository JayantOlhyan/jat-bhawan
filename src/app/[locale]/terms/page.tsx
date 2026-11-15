import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  return pageMetadata(locale, "terms", "/terms");
}

export default async function TermsPage() {
  const t = await getTranslations("Terms");
  const body = t.raw("body") as string[];
  return (
    <>
      <PageHeader title={t("title")} />
      <article className="container-site py-(--section-gap-s)">
        <p className="text-ink-2">{t("updated")}</p>
        <ol className="mt-6 list-decimal space-y-4 pl-6 text-lg marker:font-medium marker:text-accent">
          {body.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </article>
    </>
  );
}
