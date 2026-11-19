import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  return pageMetadata(locale, "privacy", "/privacy");
}

const SECTIONS = ["collect", "use", "display", "members", "rights", "retention"] as const;

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  return (
    <>
      <PageHeader title={t("title")} lead={t("intro")} />
      <article className="container-site space-y-(--space-xl) pt-(--space-md) max-w-[52rem]">
        <p className="text-ink-soft">{t("updated")}</p>
        {SECTIONS.map((s) => (
          <section key={s} aria-labelledby={`p-${s}`}>
            <h2 id={`p-${s}`} className="text-[1.4rem]">{t(`sections.${s}.title`)}</h2>
            <p className="mt-2 text-lg">{t(`sections.${s}.body`)}</p>
          </section>
        ))}
      </article>
    </>
  );
}
