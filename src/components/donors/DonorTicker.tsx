"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLiveQuery } from "@/lib/data/hooks";
import type { Fund, PublicDonation } from "@/lib/data/types";
import { startDonationSimulator } from "@/lib/demo/simulator";
import { formatDate, pick, relativeTime, type AppLocale } from "@/lib/format";
import { formatINR } from "@/lib/money";
import { inScript } from "@/lib/translit";

const LIMIT = 20;
/** Rows set on the ledger page; the full list lives on the donor wall. */
const VISIBLE = 6;

/**
 * Live list of the latest public donations. New donations slide in at the
 * top. While the pointer or keyboard focus is inside, updates are held
 * (paused) and applied when it leaves.
 */
export function DonorTicker({ initial, funds }: { initial: PublicDonation[]; funds: Fund[] }) {
  const t = useTranslations("Ticker");
  const tc = useTranslations("Common");
  const th = useTranslations("Home");
  const locale = useLocale() as AppLocale;
  const live = useLiveQuery((r) => r.donations.latestPublic(LIMIT), [], ["donations"], initial);

  const [paused, setPaused] = useState(false);
  const [shown, setShown] = useState(initial);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState<number | null>(null);
  const known = useRef(new Set(initial.map((d) => d.id)));
  const hover = useRef(false);
  const focus = useRef(false);

  // Apply live data unless paused.
  useEffect(() => {
    if (paused) return;
    const fresh = live.filter((d) => !known.current.has(d.id)).map((d) => d.id);
    live.forEach((d) => known.current.add(d.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external live data into view state
    setShown(live);
    if (fresh.length) setFreshIds(new Set(fresh));
  }, [live, paused]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clock starts after hydration to avoid mismatch
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    const stop = startDonationSimulator();
    return () => {
      clearInterval(id);
      stop();
    };
  }, []);

  const update = () => setPaused(hover.current || focus.current);
  const fundName = (id: string) => {
    const f = funds.find((x) => x.id === id);
    return f ? pick(locale, f.nameHi, f.nameEn) : "";
  };

  return (
    <section
      aria-labelledby="ticker-title"
      onMouseEnter={() => { hover.current = true; update(); }}
      onMouseLeave={() => { hover.current = false; update(); }}
      onFocus={() => { focus.current = true; update(); }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { focus.current = false; update(); }
      }}
    >
      <div className="grid gap-(--space-md) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-(--gap-columns)">
        <div className="flex flex-wrap items-center gap-x-(--space-lg) gap-y-(--space-xs)">
          <h2 id="ticker-title">{th("ledgerTitle")}</h2>
          <span
            role="status"
            className={`border px-(--space-xs) text-sm font-semibold leading-7 ${
              paused ? "border-muted text-muted" : "border-ink bg-ink text-paper"
            }`}
          >
            {paused ? t("paused") : t("live")}
          </span>
        </div>
        <p className="max-w-[48ch] text-ink-2 pointer-coarse:hidden lg:justify-self-end lg:text-right">{th("tickerHelp")}</p>
      </div>
      {shown.length === 0 ? (
        <p className="rule-bar mt-(--space-lg) pt-(--space-lg) text-ink-2">{t("empty")}</p>
      ) : (
        <ol
          className="ledger-rows rule-bar mt-(--space-lg)"
          tabIndex={0}
          aria-label={th("ledgerTitle")}
          data-testid="ticker"
        >
          {shown.slice(0, VISIBLE).map((d) => (
            <li
              key={d.id}
              data-id={d.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-(--space-md) gap-y-(--space-2xs) py-(--space-md) lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(9rem,auto)] lg:gap-x-(--gap-columns) ${freshIds.has(d.id) ? "ticker-new" : ""}`}
            >
              <p className="min-w-0 text-xl font-semibold break-words">
                {d.anonymous ? tc("anonymous") : inScript(d.donorName, locale)}
                {freshIds.has(d.id) && (
                  <span className="ml-(--space-xs) bg-ink px-(--space-xs) text-sm font-semibold text-paper">{t("new")}</span>
                )}
              </p>
              <p className="figure col-start-2 row-span-2 self-center text-right text-(length:--text-figure) text-ink lg:col-start-5 lg:row-span-1">
                {d.amountPaise === null ? <span className="font-sans text-sm font-semibold text-muted">{tc("amountHidden")}</span> : formatINR(d.amountPaise)}
              </p>
              <p className="col-start-1 flex min-w-0 flex-wrap gap-x-(--space-md) text-ink-2 lg:col-start-2 lg:row-start-1">
                {d.donorVillage && <span>{inScript(d.donorVillage, locale)}</span>}
                <span className="lg:hidden">{fundName(d.fundId)}</span>
              </p>
              <p className="hidden text-ink-2 lg:col-start-3 lg:row-start-1 lg:block">{fundName(d.fundId)}</p>
              <p className="col-start-1 text-sm text-muted lg:col-start-4 lg:row-start-1">
                <time dateTime={d.donatedAt}>
                  {now ? relativeTime(locale, d.donatedAt, now) : formatDate(locale, d.donatedAt, { month: "short" })}
                </time>
              </p>
            </li>
          ))}
        </ol>
      )}
      <div className="border-t border-ink pt-(--space-md)">
        <Link href="/donors" className="link-ink">
          {th("viewAllDonors")}
        </Link>
      </div>
    </section>
  );
}
