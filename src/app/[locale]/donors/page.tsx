import { getTranslations } from "next-intl/server";
import { DonorWall } from "@/components/donors/DonorWall";
import { FilterSheet } from "@/components/donors/FilterSheet";
import { PageHeader } from "@/components/site/PageHeader";
import { getRepos } from "@/lib/data";
import type { PublicDonationQuery } from "@/lib/data/repos";
import { tierCountQuery } from "@/lib/data/query";
import { pick, type AppLocale } from "@/lib/format";
import { pageMetadata } from "@/lib/meta";
import { sortTiers } from "@/lib/tiers";

export async function generateMetadata({ params }: PageProps<"/[locale]/donors">) {
  const { locale } = await params;
  return pageMetadata(locale, "donors", "/donors");
}

const str = (v: string | string[] | undefined) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined);

export default async function DonorsPage({ params, searchParams }: PageProps<"/[locale]/donors">) {
  const locale = (await params).locale as AppLocale;
  const sp = await searchParams;
  const t = await getTranslations("Donors");
  const tc = await getTranslations("Common");
  const repos = getRepos();
  const [tiersRaw, funds, years] = await Promise.all([repos.tiers.list(), repos.funds.list(), repos.donations.publicFinancialYears()]);
  const tiers = sortTiers(tiersRaw);

  const query: PublicDonationQuery = {
    search: str(sp.q),
    fundId: str(sp.fund),
    fy: str(sp.fy),
    tierId: str(sp.tier),
    page: Math.max(1, Number(str(sp.page)) || 1),
    pageSize: 24,
    sort: "tier",
  };
  const [page, counts] = await Promise.all([repos.donations.listPublic(query), repos.donations.publicTierCounts(tierCountQuery(query))]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <div className="container-site pt-(--space-md)">
        <FilterSheet active={[query.search, query.fundId, query.fy, query.tierId].filter(Boolean).length}>
        <form method="get" className="card-raised grid gap-(--space-md) p-(--space-md) sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end" role="search">
          <div>
            <label htmlFor="q" className="field-label">{t("searchLabel")}</label>
            <input id="q" name="q" type="search" defaultValue={query.search} placeholder={t("searchPlaceholder")} className="field" />
          </div>
          <div>
            <label htmlFor="fund" className="field-label">{t("fund")}</label>
            <select id="fund" name="fund" defaultValue={query.fundId ?? ""} className="field">
              <option value="">{t("allFunds")}</option>
              {funds.map((f) => <option key={f.id} value={f.id}>{pick(locale, f.nameHi, f.nameEn)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fy" className="field-label">{t("fy")}</label>
            <select id="fy" name="fy" defaultValue={query.fy ?? ""} className="field">
              <option value="">{t("allYears")}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tier" className="field-label">{t("tier")}</label>
            <select id="tier" name="tier" defaultValue={query.tierId ?? ""} className="field">
              <option value="">{t("allTiers")}</option>
              {tiers.map((x) => <option key={x.id} value={x.id}>{pick(locale, x.nameHi, x.nameEn)}</option>)}
              <option value="private">{t("privateGroup")}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{tc("search")}</button>
            <a href={`/${locale}/donors`} className="btn btn-quiet">{tc("clear")}</a>
          </div>
        </form>
        </FilterSheet>
        <DonorWall query={query} initial={{ page, counts }} tiers={tiers} funds={funds} />
      </div>
    </>
  );
}
