"use client";

import { useEffect, useState } from "react";
import { HallCalendar } from "@/components/hall/HallCalendar";
import { todayKeyIST } from "@/lib/calendar";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import { BookingConflictError, type PublicBookingDay } from "@/lib/data/repos";
import type { Booking, BookingStatus } from "@/lib/data/types";
import { formatDay } from "@/lib/format";

const NEXT: Record<BookingStatus, BookingStatus[]> = {
  enquiry: ["tentative", "confirmed", "rejected"],
  tentative: ["confirmed", "rejected", "cancelled"],
  confirmed: ["cancelled"],
  rejected: [],
  cancelled: [],
};
const STYLE: Record<BookingStatus, string> = {
  enquiry: "bg-sand text-ink border-line",
  tentative: "bg-warn-tint text-warn border-warn",
  confirmed: "bg-success-tint text-success border-success",
  rejected: "bg-error-tint text-error border-error",
  cancelled: "bg-ink text-ivory border-ink",
};
const SLOT = { full: "Full day", morning: "Morning", evening: "Evening" } as const;
const ACTION: Record<BookingStatus, string> = { enquiry: "", tentative: "Mark tentative", confirmed: "Confirm", rejected: "Reject", cancelled: "Cancel" };

export function BookingsAdmin() {
  const bookings = useLiveQuery<Booking[] | null>((r) => r.bookings.list(), [], ["bookings"], null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [focused, setFocused] = useState("");
  useEffect(() => {
    const k = todayKeyIST();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser clock after hydration
    setToday(k);
    setView({ year: Number(k.slice(0, 4)), month: Number(k.slice(5, 7)) - 1 });
    setFocused(k);
  }, []);

  const change = async (b: Booking, status: BookingStatus) => {
    try {
      await getRepos().bookings.setStatus(b.id, status);
      setMessage({ kind: "ok", text: `${b.name} — ${formatDay("en", b.date)} (${SLOT[b.slot]}) is now ${status}.` });
    } catch (e) {
      setMessage({
        kind: "bad",
        text: e instanceof BookingConflictError ? `Cannot confirm: ${formatDay("en", b.date)} (${SLOT[b.slot]}) is already confirmed for another booking.` : String(e),
      });
    }
  };

  if (!bookings) return <p className="text-ink-soft">Loading…</p>;
  const calendarEntries: PublicBookingDay[] = bookings
    .filter((b) => b.status === "confirmed" || b.status === "tentative")
    .map((b) => ({ date: b.date, slot: b.slot, status: b.status as "confirmed" | "tentative" }));
  const shown = bookings.filter((b) => (!statusFilter || b.status === statusFilter) && (!dayFilter || b.date === dayFilter));

  return (
    <div className="space-y-6">
      <h1 className="text-[2rem]">Hall bookings</h1>
      {message && (
        <p role="alert" className={`rounded-md border p-3 font-semibold ${message.kind === "ok" ? "border-success bg-success-tint text-success" : "border-error bg-error-tint text-error"}`} data-testid="booking-msg">
          {message.text}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div>
          {view && today && (
            <HallCalendar
              year={view.year}
              month={view.month}
              onMonthChange={(year, month) => setView({ year, month })}
              entries={calendarEntries}
              today="0000-00-00"
              focused={focused}
              onFocusDay={setFocused}
              selected={dayFilter}
              onSelect={(k) => setDayFilter((d) => (d === k ? null : k))}
            />
          )}
          {dayFilter && (
            <button type="button" className="btn btn-quiet mt-2" onClick={() => setDayFilter(null)}>
              Clear day filter ({formatDay("en", dayFilter)})
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="bst" className="field-label">Status</label>
              <select id="bst" className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}>
                <option value="">All</option>
                {(Object.keys(NEXT) as BookingStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="pb-2 text-ink-soft">{shown.length} bookings</p>
          </div>
          <ul className="space-y-3" data-testid="bookings-list">
            {shown.map((b) => (
              <li key={b.id} className="card p-4" data-id={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{formatDay("en", b.date, { weekday: "short" })}, {SLOT[b.slot]}</p>
                    <p>{b.name}, {b.mobile}</p>
                    <p className="text-ink-soft">{b.eventType}, {b.guests} guests</p>
                    {b.message && <p className="mt-1 text-[0.95rem] italic text-ink-soft">“{b.message}”</p>}
                  </div>
                  <span className={`rounded border px-2 text-[0.85rem] font-semibold ${STYLE[b.status]}`}>{b.status}</span>
                </div>
                {NEXT[b.status].length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {NEXT[b.status].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn min-h-10 px-3 ${s === "confirmed" ? "btn-primary" : "btn-quiet"}`}
                        onClick={() => change(b, s)}
                        data-action={s}
                      >
                        {ACTION[s]}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
