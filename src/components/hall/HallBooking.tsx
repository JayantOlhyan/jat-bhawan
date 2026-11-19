"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { slotTaken, todayKeyIST } from "@/lib/calendar";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import type { PublicBookingDay } from "@/lib/data/repos";
import type { BookingSlot } from "@/lib/data/types";
import { formatDay, whatsappLink, type AppLocale } from "@/lib/format";
import { enquirySchema, type EnquiryInput, type EnquiryValues } from "@/lib/schemas";
import { HallCalendar } from "./HallCalendar";

const EVENTS = ["wedding", "engagement", "bhaat", "birthday", "meeting", "other"] as const;
const SLOTS: BookingSlot[] = ["full", "morning", "evening"];

function rangeFor(year: number, month: number) {
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(year, month + 2, 0)).toISOString().slice(0, 10);
  return { from, to };
}

export function HallBooking({ officePhone }: { officePhone: string }) {
  const t = useTranslations("Enquiry");
  const tc = useTranslations("Calendar");
  const tv = useTranslations("Validation");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as AppLocale;

  // Clock-dependent state starts after mount so the static HTML never disagrees with the browser.
  const [today, setToday] = useState<string | null>(null);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [focused, setFocused] = useState<string>("");
  useEffect(() => {
    const k = todayKeyIST();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialise from the browser clock after hydration
    setToday(k);
    setView({ year: Number(k.slice(0, 4)), month: Number(k.slice(5, 7)) - 1 });
    setFocused(k);
  }, []);

  const range = view ? rangeFor(view.year, view.month) : { from: "", to: "" };
  const entries = useLiveQuery<PublicBookingDay[]>(
    (r) => (range.from ? r.bookings.publicCalendar(range.from, range.to) : Promise.resolve([])),
    [range.from, range.to],
    ["bookings"],
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: (values, ctx, opts) => zodResolver(enquirySchema(today ?? "0000-00-00"))(values, ctx, opts),
    defaultValues: { name: "", mobile: "", eventType: "wedding", date: "", slot: "full", guests: 200, message: "" },
    mode: "onTouched",
  });
  const date = useWatch({ control, name: "date" });
  const slot = useWatch({ control, name: "slot" });
  const dayEntries = entries.filter((e) => e.date === date);
  const unavailable = !!date && slotTaken(dayEntries, slot);
  const [done, setDone] = useState<{ date: string; slot: BookingSlot } | null>(null);
  const err = (k?: string) => (k ? tv(k as Parameters<typeof tv>[0]) : undefined);

  const onSubmit = async (v: EnquiryValues) => {
    if (unavailable) return;
    await getRepos().bookings.createEnquiry({
      date: v.date,
      slot: v.slot,
      name: v.name,
      mobile: v.mobile,
      eventType: t(`events.${v.eventType as (typeof EVENTS)[number]}`),
      guests: v.guests,
      message: v.message,
    });
    setDone({ date: v.date, slot: v.slot });
    track("hall_enquiry", { event_type: v.eventType, slot: v.slot });
  };

  return (
    <div className="grid gap-(--space-lg)">
      <div>
        {view && today ? (
          <HallCalendar
            year={view.year}
            month={view.month}
            onMonthChange={(year, month) => setView({ year, month })}
            entries={entries}
            today={today}
            focused={focused}
            onFocusDay={setFocused}
            selected={date || null}
            onSelect={(k) => {
              setValue("date", k, { shouldValidate: true });
              document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-(--radius-card) bg-sand text-ink-soft" role="status">{tCommon("loading")}</div>
        )}
      </div>

      <div id="enquiry" className="border-t border-line pt-(--space-lg)">
        {done ? (
          <div className="rounded-(--radius-card) border border-success bg-success-tint p-(--space-lg)" role="status" data-testid="enquiry-done">
            <h3 className="font-heading text-2xl font-normal text-maroon">{t("thanksTitle")}</h3>
            <p className="mt-3 text-lg">{t("thanksBody", { date: formatDay(locale, done.date), slot: tc(`slots.${done.slot}`) })}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
                href={whatsappLink(t("waText", { date: formatDay(locale, done.date), slot: tc(`slots.${done.slot}`) }), officePhone)}
              >
                {tCommon("whatsapp")}
              </a>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  reset();
                  setDone(null);
                }}
              >
                {t("another")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" data-testid="enquiry-form">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("date")} error={err(errors.date?.message)} required>
                {(p) => <input {...p} {...register("date")} type="date" min={today ?? undefined} className="field" />}
              </Field>
              <Field label={t("slot")} error={undefined} required>
                {(p) => (
                  <select {...p} {...register("slot")} className="field">
                    {SLOTS.map((s) => <option key={s} value={s}>{tc(`slots.${s}`)}</option>)}
                  </select>
                )}
              </Field>
            </div>
            {unavailable && (
              <p role="alert" className="rounded-(--radius-card) border border-error bg-error-tint p-3 font-medium text-error">{t("unavailable")}</p>
            )}
            <Field label={t("name")} error={err(errors.name?.message)} required>
              {(p) => <input {...p} {...register("name")} autoComplete="name" className="field" />}
            </Field>
            <Field label={t("mobile")} error={err(errors.mobile?.message)} required>
              {(p) => <input {...p} {...register("mobile")} type="tel" inputMode="tel" autoComplete="tel-national" className="field" />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("eventType")} error={err(errors.eventType?.message)} required>
                {(p) => (
                  <select {...p} {...register("eventType")} className="field">
                    {EVENTS.map((e) => <option key={e} value={e}>{t(`events.${e}`)}</option>)}
                  </select>
                )}
              </Field>
              <Field label={t("guests")} error={err(errors.guests?.message)} required>
                {(p) => <input {...p} {...register("guests", { valueAsNumber: true })} type="number" inputMode="numeric" min={1} max={2000} className="field" />}
              </Field>
            </div>
            <Field label={t("message")} error={err(errors.message?.message)}>
              {(p) => <textarea {...p} {...register("message")} rows={3} className="field" />}
            </Field>
            <button type="submit" className="btn btn-primary w-full text-lg" disabled={isSubmitting || unavailable || !today}>
              {t("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
