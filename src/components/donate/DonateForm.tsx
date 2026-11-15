"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "@/components/ui/Field";
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
  });

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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8" data-testid="donate-form">
        {failed && (
          <div role="alert" className="rounded-md border border-bad bg-bad-tint p-4 font-medium text-bad" data-testid="pay-failed-msg">
            {t("retryFailed")}
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-md border border-bad bg-bad-tint p-4 text-bad">
            {error}
          </div>
        )}

        {/* Fund + amount */}
        <fieldset className="card space-y-5 p-4 md:p-6">
          <legend className="sr-only">{t("amount")}</legend>
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

          <div role="radiogroup" aria-labelledby="amount-label">
            <p id="amount-label" className="field-label">
              {t("amount")} <span aria-hidden="true" className="text-accent">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DONATION_PRESETS_RUPEES.map((r) => {
                const active = !custom && amount === r;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setCustom("");
                      setValue("amountRupees", r, { shouldValidate: true });
                    }}
                    className={`min-h-12 rounded-md border-2 px-2 text-lg font-medium tabular-nums ${
                      active ? "border-ink bg-ink text-paper" : "border-rule bg-paper-2 text-ink hover:border-accent"
                    }`}
                  >
                    {formatINR(rupeesToPaise(r))}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={t("custom")} error={overMax ? undefined : err(errors.amountRupees?.message)}>
            {(p) => (
              <input
                {...p}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t("customPlaceholder")}
                className="field max-w-xs text-lg tabular-nums"
                value={custom}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
                  setCustom(raw);
                  setValue("amountRupees", raw ? Number(raw) : (Number.NaN as number), { shouldValidate: true });
                }}
                data-testid="custom-amount"
              />
            )}
          </Field>
          {overMax && (
            <p role="alert" className="rounded-md border border-warn bg-warn-tint p-3 font-medium text-warn">
              {t("overMax")}
            </p>
          )}
        </fieldset>

        {/* Donor */}
        <fieldset className="card space-y-5 p-4 md:p-6">
          <legend className="float-left mb-2 w-full font-serif text-xl">{t("donorDetails")}</legend>
          <div className="clear-both grid gap-5 md:grid-cols-2">
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

          <fieldset>
            <legend className="field-label">{t("display")}</legend>
            <div className="space-y-2">
              {(
                [
                  ["full", t("displayFull")],
                  ["hide_amount", t("displayHide")],
                  ["anonymous", t("displayAnon")],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex min-h-11 cursor-pointer items-center gap-(--space-sm) border border-rule bg-paper-2 px-(--space-sm) py-(--space-xs) outline-ink has-[:checked]:border-ink has-[:checked]:outline-2 has-[:checked]:-outline-offset-2">
                  <input type="radio" value={value} {...register("display")} className="size-5 accent-accent" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </fieldset>

        {upiManual && (
          <fieldset className="card space-y-4 p-4 md:p-6" data-testid="upi-manual">
            <legend className="float-left mb-2 w-full font-serif text-xl">{t("upiTitle")}</legend>
            <p className="clear-both text-ink-2">{t("upiHelp")}</p>
            <div role="img" aria-label={t("qrHere")} className="flex size-48 items-center justify-center rounded-md border-2 border-dashed border-ink bg-paper-3 text-center text-ink-2">
              {t("qrHere")}
            </div>
            <Field label={t("utr")} error={err(errors.utr?.message)} required>
              {(p) => <input {...p} {...register("utr")} inputMode="numeric" maxLength={12} className="field max-w-xs tabular-nums" />}
            </Field>
          </fieldset>
        )}

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" {...register("consent")} className="mt-1 size-5 shrink-0 accent-accent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined} />
            <span>{t("consent")}</span>
          </label>
          {errors.consent && (
            <p id="consent-err" role="alert" className="field-error">
              {err(errors.consent.message)}
            </p>
          )}
          <p className="rounded-md bg-paper-3 p-3 text-[0.95rem] text-ink-2">{t("disclaimer")}</p>
          <button type="submit" className="btn btn-primary w-full text-lg sm:w-auto sm:px-10" disabled={isSubmitting || overMax} data-testid="donate-submit">
            {upiManual ? t("submitUpi") : amountLabel ? t("submit", { amount: amountLabel }) : t("submitNoAmount")}
          </button>
        </div>
      </form>

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
