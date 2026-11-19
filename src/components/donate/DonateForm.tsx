"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AnimatedAmount, press } from "@/components/motion/AnimatedAmount";
import { BrassRule } from "@/components/site/BrassRule";
import { Field } from "@/components/ui/Field";
import { LineIcon } from "@/components/ui/LineIcon";
import { ICONS } from "@/lib/brand";
import { useRouter } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import type { Fund, TrustSettings } from "@/lib/data/types";
import { pick, type AppLocale } from "@/lib/format";
import { DONATION_PRESETS_RUPEES, formatINR, rupeesToPaise } from "@/lib/money";
import {
  donationFormSchema,
  MAX_DONATION_RUPEES,
  type DonationFormInput,
  type DonationFormValues,
} from "@/lib/schemas";
import { TestPaymentDialog } from "./TestPaymentDialog";

export function DonateForm({
  funds,
  trust,
  initialUpiManual,
  initialAmount,
}: {
  funds: Fund[];
  trust: TrustSettings;
  initialUpiManual: boolean;
  /** Rupees chosen on the home page's slip (?amount=). */
  initialAmount?: number;
}) {
  const t = useTranslations("Donate");
  const tv = useTranslations("Validation");
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  // Demo setting: UPI-manual fallback instead of the test gateway.
  const [upiManual, setUpiManual] = useState(initialUpiManual);
  useEffect(() => {
    const repos = getRepos();
    const load = () => repos.demo.get().then((s) => setUpiManual(s.upiManual));
    load();
    return repos.subscribe("settings", load);
  }, []);

  const schema = donationFormSchema({ has80g: trust.has80g, upiManual });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fundId: funds[0]?.id ?? "",
      amountRupees: initialAmount && initialAmount <= MAX_DONATION_RUPEES ? initialAmount : 1100,
      display: "full",
      donorName: "",
      donorFatherName: "",
      donorVillage: "",
      donorGotra: "",
      donorMobile: "",
      donorEmail: "",
      donorPan: "",
      utr: "",
    },
    mode: "onTouched",
    shouldFocusError: false,
  });

  // On a failed submit, focus the first invalid field in page order, once the errors have rendered.
  const formRef = useRef<HTMLFormElement>(null);
  const [invalidSubmits, setInvalidSubmits] = useState(0);
  const focusFirstError = () => setInvalidSubmits((n) => n + 1);
  useEffect(() => {
    if (invalidSubmits) formRef.current?.querySelector<HTMLElement>("[aria-invalid=\"true\"]")?.focus();
  }, [invalidSubmits]);

  const amount = useWatch({ control, name: "amountRupees" });
  const fundId = useWatch({ control, name: "fundId" });
  const [custom, setCustom] = useState(() =>
    initialAmount && initialAmount <= MAX_DONATION_RUPEES && !(DONATION_PRESETS_RUPEES as readonly number[]).includes(initialAmount)
      ? String(initialAmount)
      : "",
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountOk = typeof amount === "number" && Number.isInteger(amount) && amount >= 1 && amount <= MAX_DONATION_RUPEES;
  const overMax = typeof amount === "number" && amount > MAX_DONATION_RUPEES;
  const amountLabel = amountOk ? formatINR(rupeesToPaise(amount)) : "";
  const fund = funds.find((f) => f.id === fundId);
  const fundLabel = fund ? pick(locale, fund.nameHi, fund.nameEn) : "";
  const err = (key?: string) => (key ? tv(key as Parameters<typeof tv>[0]) : undefined);

  const onSubmit = async (v: DonationFormValues) => {
    setError(null);
    setFailed(false);
    try {
      const repos = getRepos();
      const created = await repos.donations.create({
        fundId: v.fundId,
        amountPaise: rupeesToPaise(v.amountRupees),
        donorName: v.donorName,
        donorFatherName: v.donorFatherName,
        donorVillage: v.donorVillage,
        donorGotra: v.donorGotra || undefined,
        donorMobile: v.donorMobile,
        donorEmail: v.donorEmail || undefined,
        donorPan: trust.has80g ? v.donorPan || undefined : undefined,
        display: v.display,
        source: upiManual ? "upi_manual" : "online",
        paymentRef: upiManual ? v.utr : undefined,
      });
      if (upiManual) {
        router.push({ pathname: "/donate/success", query: { id: created.id } });
      } else {
        setPendingId(created.id);
      }
    } catch (e) {
      console.error(e);
      setError(t("error"));
    }
  };

  const onPaySuccess = async () => {
    if (!pendingId) return;
    setBusy(true);
    try {
      await getRepos().donations.verify(pendingId, `TESTPAY${Date.now().toString(36).toUpperCase()}`);
      router.push({ pathname: "/donate/success", query: { id: pendingId } });
    } catch (e) {
      console.error(e);
      setError(t("error"));
      setBusy(false);
      setPendingId(null);
    }
  };

  const onPayFailure = async () => {
    if (!pendingId) return;
    setBusy(true);
    try {
      await getRepos().donations.markFailed(pendingId);
    } finally {
      setBusy(false);
      setPendingId(null);
      setFailed(true);
    }
  };

  const onPayCancel = async () => {
    // Leaving the gateway is treated as a failed attempt; it never shows publicly.
    await onPayFailure();
  };

  const displayOptions = [
    ["full", t("displayFull")],
    ["hide_amount", t("displayHide")],
    ["anonymous", t("displayAnon")],
  ] as const;
  const display = useWatch({ control, name: "display" });
  const displayLabel = displayOptions.find(([v]) => v === display)?.[1] ?? "";
  const customActive = custom !== "";
  const amountError = overMax ? undefined : err(errors.amountRupees?.message);

  // "₹2,100 दान करें": the amount part counts to each new value.
  const submitLabel = (() => {
    if (upiManual) return t("submitUpi");
    if (!amountOk) return t("submitNoAmount");
    const [before, after] = t("submit", { amount: "\u0001" }).split("\u0001");
    return (
      <>
        {before}
        <AnimatedAmount paise={rupeesToPaise(amount)} />
        {after}
      </>
    );
  })();

  const stepHead = (n: number, id: string, text: string) => (
    <>
      <BrassRule step={n} />
      <h2 id={id} className="mt-(--space-sm) text-[1.45rem] leading-snug">{text}</h2>
    </>
  );

  return (
    <>
      <div className="mx-auto grid max-w-[640px] gap-(--space-xl) lg:max-w-none lg:grid-cols-[minmax(0,640px)_minmax(0,300px)] lg:justify-center lg:gap-(--space-2xl)">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit, focusFirstError)} noValidate className="min-w-0 space-y-(--space-xl) max-md:pb-24" data-testid="donate-form">
          {failed && (
            <div role="alert" className="rounded-(--radius-card) border border-error bg-error-tint p-4 font-medium text-error" data-testid="pay-failed-msg">
              {t("retryFailed")}
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-(--radius-card) border border-error bg-error-tint p-4 text-error">
              {error}
            </div>
          )}

          {/* 1. Fund + amount */}
          <section aria-labelledby="step-amount" className="space-y-(--space-md)">
            {stepHead(1, "step-amount", t("stepAmount"))}
            <Field label={t("fund")} error={err(errors.fundId?.message)} required>
              {(p) => (
                <select {...p} {...register("fundId")} className="field">
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {pick(locale, f.nameHi, f.nameEn)}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <div>
              <p id="amount-label" className="field-label">
                {t("amount")} <span aria-hidden="true" className="text-maroon">*</span>
              </p>
              <div className="grid grid-cols-3 gap-(--space-xs) sm:gap-(--space-sm)">
                <div role="radiogroup" aria-labelledby="amount-label" className="contents">
                  {DONATION_PRESETS_RUPEES.map((r) => {
                    const active = !custom && amount === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onPointerDown={(e) => press(e.currentTarget)}
                        onClick={() => {
                          setCustom("");
                          setValue("amountRupees", r, { shouldValidate: true });
                        }}
                        className="chip max-[380px]:text-base"
                      >
                        {formatINR(rupeesToPaise(r))}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label htmlFor="custom-amount" className="sr-only">{t("custom")}</label>
                  <input
                    id="custom-amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={t("customPlaceholder")}
                    aria-invalid={!!amountError}
                    aria-describedby={amountError ? "amount-err" : undefined}
                    className={`chip w-full min-w-0 px-(--space-sm) text-center placeholder:text-[0.9rem] placeholder:font-medium placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-maroon ${
                      customActive ? "border-maroon bg-surface shadow-(--shadow-glow)" : ""
                    }`}
                    value={custom}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
                      setCustom(raw);
                      setValue("amountRupees", raw ? Number(raw) : (Number.NaN as number), { shouldValidate: true });
                    }}
                    data-testid="custom-amount"
                  />
                </div>
              </div>
              {amountError && (
                <p id="amount-err" role="alert" className="field-error">{amountError}</p>
              )}
            </div>
            {overMax && (
              <p role="alert" className="rounded-(--radius-card) border border-warn bg-warn-tint p-3 font-medium text-warn">
                {t("overMax")}
              </p>
            )}
          </section>

          {/* 2. Donor */}
          <section aria-labelledby="step-details" className="space-y-(--space-md)">
            {stepHead(2, "step-details", t("donorDetails"))}
            <div className="grid gap-(--space-md)">
              <Field label={t("name")} error={err(errors.donorName?.message)} required>
                {(p) => <input {...p} {...register("donorName")} autoComplete="name" className="field" />}
              </Field>
              <Field label={t("fatherName")} error={err(errors.donorFatherName?.message)} required>
                {(p) => <input {...p} {...register("donorFatherName")} className="field" />}
              </Field>
              <Field label={t("village")} error={err(errors.donorVillage?.message)} required>
                {(p) => <input {...p} {...register("donorVillage")} className="field" />}
              </Field>
              <Field label={t("gotra")} error={err(errors.donorGotra?.message)}>
                {(p) => <input {...p} {...register("donorGotra")} className="field" />}
              </Field>
              <Field label={t("mobile")} hint={t("mobileHint")} error={err(errors.donorMobile?.message)} required>
                {(p) => <input {...p} {...register("donorMobile")} type="tel" inputMode="tel" autoComplete="tel-national" className="field tabular-nums" />}
              </Field>
              <Field label={t("email")} error={err(errors.donorEmail?.message)}>
                {(p) => <input {...p} {...register("donorEmail")} type="email" autoComplete="email" className="field" />}
              </Field>
              {trust.has80g && (
                <Field label={t("pan")} error={err(errors.donorPan?.message)}>
                  {(p) => <input {...p} {...register("donorPan")} autoCapitalize="characters" className="field uppercase" />}
                </Field>
              )}
            </div>
          </section>

          {upiManual && (
            <fieldset className="card space-y-4 p-4 md:p-6" data-testid="upi-manual">
              <legend className="float-left mb-2 w-full font-heading text-xl text-maroon">{t("upiTitle")}</legend>
              <p className="clear-both text-ink-soft">{t("upiHelp")}</p>
              <div role="img" aria-label={t("qrHere")} className="flex size-48 items-center justify-center rounded-(--radius-card) border-2 border-dashed border-brass bg-sand text-center text-ink-soft">
                {t("qrHere")}
              </div>
              <Field label={t("utr")} error={err(errors.utr?.message)} required>
                {(p) => <input {...p} {...register("utr")} inputMode="numeric" maxLength={12} className="field max-w-xs tabular-nums" />}
              </Field>
            </fieldset>
          )}

          {/* 3. Display choice, consent */}
          <section aria-labelledby="step-display" className="space-y-(--space-md)">
            {stepHead(3, "step-display", t("stepDisplay"))}
            <fieldset>
              <legend className="field-label">{t("display")}</legend>
              <div className="mt-(--space-2xs) grid overflow-hidden rounded-(--radius-card) border border-brass bg-surface sm:grid-cols-3">
                {displayOptions.map(([value, label], i) => (
                  <label
                    key={value}
                    className={`flex min-h-14 cursor-pointer items-center justify-center px-(--space-sm) py-(--space-xs) text-center text-[0.95rem] leading-snug font-medium has-[:checked]:bg-maroon has-[:checked]:text-ivory has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-ivory ${
                      i ? "border-t border-line sm:border-t-0 sm:border-l" : ""
                    }`}
                  >
                    <input type="radio" value={value} {...register("display")} className="sr-only" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-start gap-(--space-sm) pt-(--space-xs)">
              <input type="checkbox" {...register("consent")} className="mt-0.5 size-6 shrink-0 accent-maroon" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined} />
              <span>{t("consent")}</span>
            </label>
            {errors.consent && (
              <p id="consent-err" role="alert" className="field-error">
                {err(errors.consent.message)}
              </p>
            )}
            <p className="flex items-start gap-(--space-sm) text-ink-soft">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand text-brass-deep">
                <LineIcon name="lock" className="size-[18px]" />
              </span>
              <span className="pt-0.5">{t("reassure")}</span>
            </p>
            <p className="small-print">{t("disclaimer")}</p>
          </section>

          {/* Phones: a pay bar fixed to the bottom of the screen (the form keeps room for it). Desktop: the button ends the form. */}
          <div data-paybar className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-(--z-sticky) max-md:border-t max-md:border-line max-md:bg-ivory max-md:px-(--gutter) max-md:pt-(--space-xs) max-md:pb-[max(var(--space-xs),env(safe-area-inset-bottom))]">
            <button
              type="submit"
              className="btn btn-primary relative min-h-14 w-full gap-(--space-sm) text-lg md:w-auto md:px-(--space-2xl)"
              disabled={isSubmitting || overMax}
              data-testid="donate-submit"
            >
              <span>{submitLabel}</span>
              <Image src={ICONS.diya} alt="" width={36} height={36} sizes="36px" className="-my-2 size-9 md:hidden" />
            </button>
          </div>
        </form>

        {/* Desktop: a short summary beside the form. */}
        <aside className="hidden lg:block">
          <div className="card-raised sticky top-28 p-(--space-lg) text-center">
            <Image src={ICONS.diya} alt="" width={64} height={64} sizes="64px" className="mx-auto size-16" />
            <p className="mt-(--space-xs) font-semibold text-muted">{t("summaryTitle")}</p>
            <p className="figure mt-(--space-2xs) text-[2rem] text-maroon">
              {amountOk ? <AnimatedAmount paise={rupeesToPaise(amount)} /> : "—"}
            </p>
            <p className="mt-(--space-xs) text-ink-soft">{fundLabel}</p>
            <hr className="my-(--space-md) border-0 border-t border-line" />
            <p className="text-sm text-ink-soft">{displayLabel}</p>
          </div>
        </aside>
      </div>

      <TestPaymentDialog
        open={pendingId !== null}
        amountLabel={amountLabel}
        summary={t("summary", { amount: amountLabel, fund: fundLabel })}
        busy={busy}
        onSuccess={onPaySuccess}
        onFailure={onPayFailure}
        onCancel={onPayCancel}
      />
    </>
  );
}
