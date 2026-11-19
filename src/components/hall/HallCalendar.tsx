"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, MQ } from "@/lib/motion";
import type { PublicBookingDay } from "@/lib/data/repos";
import { addDays, dayStatus, monthGrid, type DayStatus } from "@/lib/calendar";
import { intlLocale, type AppLocale } from "@/lib/format";

/** Booked: maroon fill. Tentative: a 2px brass outline. Available: ivory with a grey-ink outline. Each also carries a mark and a label. */
const STATUS_STYLE: Record<DayStatus | "past", string> = {
  available: "bg-ivory text-ink border border-grey-line hover:border-maroon",
  booked: "bg-maroon text-ivory border border-maroon",
  partial: "bg-ivory text-ink border border-maroon [background-image:linear-gradient(135deg,transparent_50%,rgb(122_31_31/0.22)_50%)]",
  tentative: "bg-ivory text-ink border-2 border-brass",
  past: "bg-transparent text-muted border border-transparent opacity-70",
};

const STATUS_MARK: Record<DayStatus, string> = { available: "", booked: "●", partial: "◐", tentative: "○" };

/**
 * Month calendar (Mon-first) with roving tabindex: arrow keys move by day or
 * week, PageUp/PageDown change month, Home/End jump within the week.
 * Every status has a text label (legend + accessible name), not just colour.
 */
export function HallCalendar({
  year,
  month,
  onMonthChange,
  entries,
  today,
  focused,
  onFocusDay,
  selected,
  onSelect,
}: {
  year: number;
  month: number;
  onMonthChange: (y: number, m: number) => void;
  entries: PublicBookingDay[];
  today: string;
  focused: string;
  onFocusDay: (key: string) => void;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const t = useTranslations("Calendar");
  const locale = useLocale() as AppLocale;
  const grid = useRef<HTMLTableElement>(null);
  const shown = useRef(year * 12 + month);

  // Month change: the grid slides in from the side it came from.
  useGSAP(
    () => {
      const now = year * 12 + month;
      const dir = Math.sign(now - shown.current);
      shown.current = now;
      if (!dir || !grid.current) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(grid.current!.tBodies[0], { xPercent: 8 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: DUR.slide, ease: EASE.transition, clearProps: "transform,opacity" });
      });
      return () => mm.revert();
    },
    { dependencies: [year, month] },
  );
  const weeks = monthGrid(year, month);
  const weekdays = t.raw("weekdays") as string[];
  const title = new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month, 1)),
  );
  const byDay = new Map<string, PublicBookingDay[]>();
  for (const e of entries) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);

  const label = (s: DayStatus | "past") => t(s);
  const slotLabel = (list: PublicBookingDay[]) =>
    list.map((e) => `${t(`slots.${e.slot}`)}: ${t(e.status === "confirmed" ? "booked" : "tentative")}`).join(", ");

  const moveTo = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    if (y !== year || m - 1 !== month) onMonthChange(y, m - 1);
    onFocusDay(key);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus());
  };

  const onKey = (e: React.KeyboardEvent, key: string) => {
    const dow = (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -dow, End: 6 - dow };
    if (e.key in map) {
      e.preventDefault();
      moveTo(addDays(key, map[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const d = new Date(`${key}T00:00:00Z`);
      d.setUTCMonth(d.getUTCMonth() + (e.key === "PageDown" ? 1 : -1));
      moveTo(d.toISOString().slice(0, 10));
    }
  };

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    onMonthChange(d.getUTCFullYear(), d.getUTCMonth());
    onFocusDay(d.toISOString().slice(0, 10));
  };

  return (
    <div data-testid="hall-calendar">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" className="btn btn-quiet px-3" onClick={() => shift(-1)} aria-label={t("prev")}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h3 className="text-center font-heading text-xl font-normal text-maroon" aria-live="polite" id="cal-title">{title}</h3>
        <button type="button" className="btn btn-quiet px-3" onClick={() => shift(1)} aria-label={t("next")}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      <p id="cal-help" className="sr-only">{t("help")}</p>
      <table ref={grid} role="grid" aria-labelledby="cal-title" aria-describedby="cal-help" className="w-full table-fixed border-separate border-spacing-1">
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w} scope="col" className="pb-1 text-center text-[0.85rem] font-medium text-ink-soft">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((key, j) => {
                if (!key) return <td key={j} />;
                const list = byDay.get(key) ?? [];
                const past = key < today;
                const status = dayStatus(list);
                const style = past ? "past" : status;
                const isSel = selected === key;
                const dayNum = Number(key.slice(8));
                const full = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", weekday: "long", timeZone: "UTC" }).format(
                  new Date(`${key}T00:00:00Z`),
                );
                const name = [full, past ? label("past") : label(status), list.length && !past ? slotLabel(list) : "", isSel ? t("selected") : ""]
                  .filter(Boolean)
                  .join(" — ");
                return (
                  <td key={key} role="gridcell" aria-selected={isSel}>
                    <button
                      type="button"
                      data-day={key}
                      data-status={style}
                      tabIndex={key === focused ? 0 : -1}
                      aria-label={name}
                      disabled={past}
                      onClick={() => {
                        onFocusDay(key);
                        onSelect(key);
                      }}
                      onKeyDown={(e) => onKey(e, key)}
                      className={`relative flex aspect-square min-h-11 w-full flex-col items-center justify-center rounded-[10px] text-base font-medium tabular-nums ${STATUS_STYLE[style]} ${
                        isSel ? "ring-3 ring-ink ring-offset-2 ring-offset-ivory" : ""
                      } ${key === today ? "underline decoration-2 underline-offset-4" : ""}`}
                    >
                      {dayNum}
                      {!past && STATUS_MARK[status] && (
                        <span aria-hidden="true" className="text-[0.7rem] leading-none">{STATUS_MARK[status]}</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-(--space-md) border-t border-line pt-(--space-sm)">
        <p className="font-semibold">{t("legend")}</p>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-[0.95rem]">
          {(["available", "booked", "partial", "tentative"] as const).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span aria-hidden="true" className={`inline-flex size-7 items-center justify-center rounded-[8px] text-[0.7rem] ${STATUS_STYLE[s]}`}>
                {STATUS_MARK[s]}
              </span>
              {label(s)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
