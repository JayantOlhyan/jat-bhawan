"use client";

import { useLocale, useTranslations } from "next-intl";
import { TierBadge } from "@/components/ui/TierBadge";
import { Link } from "@/i18n/navigation";
import { useLiveQuery } from "@/lib/data/hooks";
import type { PublicDonationQuery } from "@/lib/data/repos";
import { tierCountQuery } from "@/lib/data/query";
import type { Fund, Paged, PublicDonation, Tier } from "@/lib/data/types";
import { formatDate, pick, type AppLocale } from "@/lib/format";
import { formatINR } from "@/lib/money";
import { inScript } from "@/lib/translit";

interface WallData {
  page: Paged<PublicDonation>;
  counts: Record<string, number>;
}

/**
 * Renders the server-rendered first page immediately, then keeps it in sync
 * with the browser repo (demo-created and other-tab donations).
 */
export function DonorWall({
  query,
  initial,
  tiers,
  funds,
}: {
  query: PublicDonationQuery;
  initial: WallData;
  tiers: Tier[];
  funds: Fund[];
}) {
  const t = useTranslations("Donors");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const countQuery = tierCountQuery(query);

  const data = useLiveQuery<WallData>(
    async (r) => ({
      page: await r.donations.listPublic(query),
      counts: await r.donations.publicTierCounts(countQuery),
    }),
    [query],
    ["donations"],
    initial,
  );

  const groups: Array<{ id: string; tier: Tier | null; items: PublicDonation[] }> = [];
  for (const d of data.page.items) {
    const id = d.tierId ?? "private";
    let g = groups.find((x) => x.id === id);
    if (!g) groups.push((g = { id, tier: tiers.find((x) => x.id === id) ?? null, items: [] }));
    g.items.push(d);
  }
  const fundName = (id: string) => {
    const f = funds.find((x) => x.id === id);
    return f ? pick(locale, f.nameHi, f.nameEn) : "";
  };
  const href = (page: number) => ({
    pathname: "/donors" as const,
    query: Object.fromEntries(
      Object.entries({ q: query.search, fund: query.fundId, fy: query.fy, tier: query.tierId, page: page > 1 ? String(page) : undefined }).filter(
        ([, v]) => v,
      ) as Array<[string, string]>,
    ),
  });

  return (
    <div>
      {/* Tier counts */}
      <ul className="mb-6 flex flex-wrap gap-2" aria-label={t("tier")}>
        {[...tiers.map((tier) => ({ id: tier.id, name: pick(locale, tier.nameHi, tier.nameEn) })), { id: "private", name: t("privateGroup") }].map((x) => (
          <li key={x.id} className="rounded-(--radius-pill) border border-line bg-surface px-(--space-sm) py-(--space-2xs) text-[0.95rem]">
            <span className="font-medium">{x.name}</span>: <span className="tabular-nums">{t("count", { count: data.counts[x.id] ?? 0 })}</span>
          </li>
        ))}
      </ul>

      <p className="mb-4 text-ink-soft" aria-live="polite" data-testid="wall-total">
        {t("total", { count: data.page.total })}
      </p>

      {groups.length === 0 && <p className="card p-(--space-xl) text-center text-lg text-ink-soft">{t("empty")}</p>}

      <div className="space-y-(--space-2xl)" data-testid="donor-wall">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`grp-${g.id}`} className="grid gap-(--space-md) lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-(--gap-columns)">
            <div className="flex items-center gap-(--space-md) lg:flex-col lg:items-start lg:gap-(--space-sm)">
              {g.tier && <TierBadge tierId={g.tier.id} size={72} />}
              <div>
                <h2 id={`grp-${g.id}`} className="text-[clamp(1.5rem,1.2vw+1.1rem,2.1rem)]">
                  {g.tier ? pick(locale, g.tier.nameHi, g.tier.nameEn) : t("privateGroup")}
                </h2>
                <p className="small-print tabular-nums">{t("count", { count: data.counts[g.id] ?? 0 })}</p>
              </div>
            </div>
            <ul className="ledger-rows card-raised px-(--space-md)">
              {g.items.map((d) => (
                <li key={d.id} data-id={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-(--space-md) gap-y-(--space-2xs) py-(--space-md) sm:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_auto]">
                  <div className="min-w-0">
                    <p className="text-lg font-medium break-words">{d.anonymous ? tc("anonymous") : inScript(d.donorName, locale)}</p>
                    {(d.donorFatherName || d.donorVillage) && (
                      <p className="flex flex-wrap gap-x-(--space-md) text-sm text-ink-soft">
                        {d.donorFatherName && <span className="break-words">{inScript(d.donorFatherName, locale)}</span>}
                        {d.donorVillage && <span className="break-words">{inScript(d.donorVillage, locale)}</span>}
                      </p>
                    )}
                  </div>
                  <p className="col-start-1 row-start-2 flex flex-wrap gap-x-(--space-md) text-sm text-muted sm:col-start-2 sm:row-start-1">
                    <span>{fundName(d.fundId)}</span>
                    <time dateTime={d.donatedAt}>{formatDate(locale, d.donatedAt, { month: "short" })}</time>
                  </p>
                  <p className="figure col-start-2 row-span-2 row-start-1 text-right text-xl text-maroon sm:col-start-3 sm:row-span-1">
                    {d.amountPaise === null ? <span className="font-sans text-sm font-medium text-muted">{tc("amountHidden")}</span> : formatINR(d.amountPaise)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {data.page.pageCount > 1 && (
        <nav aria-label={tc("pagination")} className="mt-8 flex items-center justify-between gap-3">
          {data.page.page > 1 ? (
            <Link href={href(data.page.page - 1)} className="btn btn-quiet" rel="prev">{tc("previous")}</Link>
          ) : <span />}
          <span className="text-ink-soft">{tc("pageOf", { page: data.page.page, count: data.page.pageCount })}</span>
          {data.page.page < data.page.pageCount ? (
            <Link href={href(data.page.page + 1)} className="btn btn-quiet" rel="next">{tc("next")}</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
