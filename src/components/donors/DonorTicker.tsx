"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLiveQuery } from "@/lib/data/hooks";
import type { Fund, PublicDonation } from "@/lib/data/types";
import { startDonationSimulator } from "@/lib/demo/simulator";
import { formatDate, pick, relativeTime, type AppLocale } from "@/lib/format";
import { formatINR } from "@/lib/money";

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
      className="well flex min-h-0 flex-col"
      onMouseEnter={() => { hover.current = true; update(); }}
      onMouseLeave={() => { hover.current = false; update(); }}
      onFocus={() => { focus.current = true; update(); }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { focus.current = false; update(); }
      }}
    >
      <div className="flex items-start justify-between gap-(--space-md) px-(--space-lg) pt-(--space-lg) pb-(--space-sm) sm:px-(--space-xl) sm:pt-(--space-xl)">
        <div className="min-w-0">
          <h2 id="ticker-title" className="font-serif text-[clamp(1.6rem,1.5vw+1.1rem,2.3rem)]">{th("ledgerTitle")}</h2>
          <hr className="rule-gold mt-(--space-xs)" />
          <p className="mt-(--space-sm) max-w-[40ch] text-sm text-ink-2 pointer-coarse:hidden">{th("tickerHelp")}</p>
        </div>
        <span
          role="status"
          className={`shrink-0 border px-(--space-xs) text-sm font-semibold leading-7 ${
            paused ? "border-warn bg-warn-tint text-warn" : "border-ok bg-ok-tint text-ok"
          }`}
        >
          {paused ? t("paused") : t("live")}
        </span>
      </div>
      {shown.length === 0 ? (
        <p className="px-(--space-xl) pb-(--space-xl) text-ink-2">{t("empty")}</p>
      ) : (
        <ol
          className="ledger-rows mx-(--space-lg) mb-(--space-lg) border-t-2 border-ink sm:mx-(--space-xl) sm:mb-(--space-xl)"
          tabIndex={0}
          aria-label={th("ledgerTitle")}
          data-testid="ticker"
        >
          {shown.slice(0, VISIBLE).map((d) => (
            <li
              key={d.id}
              data-id={d.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-(--space-md) py-(--space-sm) ${freshIds.has(d.id) ? "ticker-new" : ""}`}
            >
              <p className="min-w-0 text-lg font-semibold break-words">
                {d.anonymous ? tc("anonymous") : d.donorName}
                {freshIds.has(d.id) && (
                  <span className="ml-(--space-xs) bg-gold-tint px-(--space-2xs) text-sm font-semibold text-ink-2">{t("new")}</span>
                )}
              </p>
              <p className="text-right font-serif text-xl leading-none tabular-nums text-ink">
                {d.amountPaise === null ? <span className="font-sans text-sm font-semibold text-muted">{tc("amountHidden")}</span> : formatINR(d.amountPaise)}
              </p>
              <p className="flex min-w-0 flex-wrap gap-x-(--space-md) text-sm text-ink-2">
                {d.donorVillage && <span>{d.donorVillage}</span>}
                <span>{fundName(d.fundId)}</span>
              </p>
              <p className="text-right text-sm text-muted">
                <time dateTime={d.donatedAt}>
                  {now ? relativeTime(locale, d.donatedAt, now) : formatDate(locale, d.donatedAt, { month: "short" })}
                </time>
              </p>
            </li>
          ))}
        </ol>
      )}
      <Link href="/donors" className="btn btn-outline mx-(--space-lg) mb-(--space-lg) self-start sm:mx-(--space-xl)">
        {th("viewAllDonors")}
      </Link>
    </section>
  );
}
