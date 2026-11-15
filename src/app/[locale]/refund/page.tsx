import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/refund">) {
  const { locale } = await params;
  return pageMetadata(locale, "refund", "/refund");
}

export default async function RefundPage() {
  const t = await getTranslations("Refund");
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
