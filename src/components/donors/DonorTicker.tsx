"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ICONS } from "@/lib/brand";
import { useLiveQuery } from "@/lib/data/hooks";
import type { Fund, PublicDonation } from "@/lib/data/types";
import { startDonationSimulator } from "@/lib/demo/simulator";
import { formatDate, pick, relativeTime, type AppLocale } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatINR } from "@/lib/money";
import { DUR, EASE, MQ } from "@/lib/motion";
import { inScript } from "@/lib/translit";

const LIMIT = 20;
/** Cards in the row; four show at once on desktop, the rest scroll. */
const VISIBLE = 8;

/** A lotus for each end of the brass rail (decorative). */
function Lotus({ flip = false }: { flip?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 28" className={`h-6 w-14 shrink-0 text-[#5c421c] max-sm:hidden ${flip ? "-scale-x-100" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M32 24c-4-4-5-10 0-18 5 8 4 14 0 18Z" fill="rgb(255 240 205 / 0.35)" />
      <path d="M31 24c-6-1-11-6-12-13 6 1 10 5 12 13ZM33 24c6-1 11-6 12-13-6 1-10 5-12 13Z" />
      <path d="M20 24c-5 0-9-2-12-6 5-1 9 1 12 6ZM44 24c5 0 9-2 12-6-5-1-9 1-12 6Z" />
      <path d="M4 25h56" />
    </svg>
  );
}

/**
 * Live row of the latest public donations under a brass rail. A new donation
 * slides in at the front, a sheen crosses it once, its diya lights and the
 * amount counts up. While the pointer or keyboard focus is inside, updates are
 * held (paused) and applied when it leaves. A polite live region announces new
 * donations in words, independent of the animation.
 */
export function DonorTicker({ initial, funds }: { initial: PublicDonation[]; funds: Fund[] }) {
  const t = useTranslations("Ticker");
  const tc = useTranslations("Common");
  const th = useTranslations("Home");
  const locale = useLocale() as AppLocale;
  const live = useLiveQuery((r) => r.donations.latestPublic(LIMIT), [], ["donations"], initial);

  const [paused, setPaused] = useState(false);
  const [shown, setShown] = useState(initial);
  const [freshIds, setFreshIds] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const known = useRef(new Set(initial.map((d) => d.id)));
  const hover = useRef(false);
  const focus = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);

  const nameOf = (d: PublicDonation) => (d.anonymous ? tc("anonymous") : inScript(d.donorName, locale));
  const amountOf = (d: PublicDonation) => (d.amountPaise === null ? tc("amountHidden") : formatINR(d.amountPaise));

  // Apply live data unless paused.
  useEffect(() => {
    if (paused) return;
    const fresh = live.filter((d) => !known.current.has(d.id));
    live.forEach((d) => known.current.add(d.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external live data into view state
    setShown(live);
    if (fresh.length) {
      setFreshIds(fresh.map((d) => d.id));
      setAnnounce(fresh.map((d) => t("announce", { name: nameOf(d), amount: amountOf(d) })).join(". "));
    }
    // nameOf/amountOf only depend on locale and messages
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // New cards: slide in, one sheen pass, the diya lights, the amount counts up.
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list || !freshIds.length) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        freshIds.forEach((id) => {
          const card = list.querySelector<HTMLElement>(`[data-id="${id}"]`);
          if (!card) return;
          const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
          tl.from(card, { x: -40, opacity: 0, duration: DUR.medium })
            .fromTo(card.querySelector(".sheen-bar"), { xPercent: 0 }, { xPercent: 420, duration: DUR.long, ease: EASE.transition }, 0.2)
            .fromTo(card.querySelector("[data-diya]"), { scale: 0.8 }, { scale: 1, duration: DUR.medium, ease: EASE.celebrate }, 0.2)
            .fromTo(card.querySelector("[data-diya-glow]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.1, duration: DUR.medium, yoyo: true, repeat: 1 }, 0.2);
          const amount = card.querySelector<HTMLElement>("[data-amount]");
          const paise = Number(amount?.dataset.amount);
          if (amount && paise > 0) {
            const final = amount.firstChild?.nodeValue ?? "";
            const n = { v: 0 };
            tl.to(n, {
              v: paise / 100,
              duration: DUR.long,
              ease: EASE.enter,
              onUpdate: () => { amount.firstChild!.nodeValue = formatINR(Math.round(n.v) * 100); },
              onComplete: () => { amount.firstChild!.nodeValue = final; },
              onInterrupt: () => { amount.firstChild!.nodeValue = final; },
            }, 0.2);
          }
        });
      });
      return () => mm.revert();
    },
    { dependencies: [freshIds], scope: listRef, revertOnUpdate: false },
  );

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
      <div className="brass-rail">
        <Lotus />
        <h2 id="ticker-title" className="mx-auto min-w-0 truncate text-center font-heading text-[clamp(1.2rem,1vw+1rem,1.6rem)] leading-tight text-[#241a0e]">
          {th("tickerTitle")}
        </h2>
        <span
          role="status"
          className={`relative z-[1] inline-flex shrink-0 items-center gap-(--space-2xs) rounded-(--radius-pill) px-(--space-sm) text-sm font-semibold leading-7 ${
            paused ? "bg-ivory/80 text-muted" : "bg-maroon text-ivory"
          }`}
        >
          {!paused && <span aria-hidden="true" className="size-1.5 rounded-full bg-brass-light" />}
          {paused ? t("paused") : t("live")}
        </span>
        <Lotus flip />
      </div>

      <p className="sr-only" aria-live="polite">{announce}</p>

      {shown.length === 0 ? (
        <p className="card mt-(--space-md) p-(--space-lg) text-center text-ink-soft">{t("empty")}</p>
      ) : (
        <ol
          ref={listRef}
          className="-mx-(--gutter) mt-(--space-md) flex snap-x snap-mandatory gap-(--space-sm) overflow-x-auto px-(--gutter) pt-(--space-2xs) pb-(--space-sm) [scrollbar-width:thin] lg:mx-0 lg:px-0"
          tabIndex={0}
          aria-label={th("tickerTitle")}
          data-testid="ticker"
        >
          {shown.slice(0, VISIBLE).map((d) => {
            const fresh = freshIds.includes(d.id);
            return (
              <li
                key={d.id}
                data-id={d.id}
                className="card-raised relative flex w-[min(19rem,82%)] shrink-0 snap-start items-center gap-(--space-sm) overflow-hidden p-(--space-sm) sm:w-[calc((100%-var(--space-sm))/2)] lg:w-[calc((100%-3*var(--space-sm))/4)]"
              >
                <span className="relative shrink-0">
                  <span data-diya-glow aria-hidden="true" className="diya-glow !left-1/2 !top-[18%] !w-8" style={{ opacity: 0 }} />
                  <Image data-diya src={ICONS.diya} alt="" width={44} height={44} sizes="44px" className="relative size-11" />
                </span>
                <span aria-hidden="true" className="h-12 w-px shrink-0 bg-line" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">
                    {nameOf(d)}
                    {fresh && <span className="ml-(--space-xs) rounded-(--radius-pill) bg-maroon px-(--space-xs) align-middle text-xs font-semibold text-ivory">{t("new")}</span>}
                  </p>
                  <p className="truncate text-sm text-ink-soft">
                    {[d.donorVillage ? inScript(d.donorVillage, locale) : "", fundName(d.fundId)].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-(--space-3xs) flex items-baseline justify-between gap-(--space-xs)">
                    {d.amountPaise === null ? (
                      <span className="text-sm font-medium text-muted">{tc("amountHidden")}</span>
                    ) : (
                      <span data-amount={d.amountPaise} className="figure text-lg text-maroon">{formatINR(d.amountPaise)}</span>
                    )}
                    <time dateTime={d.donatedAt} className="shrink-0 text-xs text-muted">
                      {now ? relativeTime(locale, d.donatedAt, now) : formatDate(locale, d.donatedAt, { month: "short" })}
                    </time>
                  </p>
                </div>
                <span className="sheen" aria-hidden="true"><span className="sheen-bar" /></span>
              </li>
            );
          })}
        </ol>
      )}
      <div className="mt-(--space-xs) flex flex-wrap items-center justify-between gap-x-(--space-lg)">
        <Link href="/donors" className="link-ink">
          {th("viewAllDonors")}
        </Link>
        <p className="small-print pointer-coarse:hidden">{th("tickerHelp")}</p>
      </div>
    </section>
  );
}
