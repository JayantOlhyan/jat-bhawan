import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const tc = await getTranslations("Common");
  return (
    <div className="container-site max-w-xl py-20 text-center">
      <h1 className="text-[2rem]">{t("title")}</h1>
      <p className="mt-3 text-lg text-ink-2">{t("body")}</p>
      <Link href="/" className="btn btn-primary mt-6">{tc("backHome")}</Link>
    </div>
  );
}
