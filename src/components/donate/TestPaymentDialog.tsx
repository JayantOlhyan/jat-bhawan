"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Method = "upi" | "card" | "netbanking";

/**
 * Neutral stand-in for the payment gateway. No branding, no card fields:
 * the presenter just picks the outcome.
 */
export function TestPaymentDialog({
  open,
  amountLabel,
  summary,
  busy,
  onSuccess,
  onFailure,
  onCancel,
}: {
  open: boolean;
  amountLabel: string;
  summary: string;
  busy: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Payment");
  const ref = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<Method>("upi");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const methods: Method[] = ["upi", "card", "netbanking"];
  const body: Record<Method, string> = { upi: t("upiBody"), card: t("cardBody"), netbanking: t("netbankingBody") };

  return (
    <dialog
      ref={ref}
      aria-labelledby="pay-title"
      className="well m-auto w-[min(30rem,calc(100vw-2rem))] p-0 text-ink"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      data-testid="payment-dialog"
    >
      <div className="border-b border-rule bg-paper-3 px-5 py-4">
        <h2 id="pay-title" className="font-sans text-lg font-medium">{t("title")}</h2>
        <p className="text-[0.95rem] text-ink-2">{t("lead")}</p>
      </div>
      <div className="px-5 py-4">
        <p className="text-ink-2">{summary}</p>
        <p className="mt-1 font-serif text-3xl tabular-nums text-ink">
          <span className="sr-only">{t("amount")}: </span>
          {amountLabel}
        </p>
        <div role="tablist" aria-label={t("method")} className="mt-4 grid grid-cols-3 gap-1 rounded-md bg-paper-3 p-1">
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              id={`tab-${m}`}
              aria-selected={method === m}
              aria-controls="pay-panel"
              tabIndex={method === m ? 0 : -1}
              onClick={() => setMethod(m)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const i = methods.indexOf(method);
                const next = methods[(i + (e.key === "ArrowRight" ? 1 : methods.length - 1)) % methods.length];
                setMethod(next);
                document.getElementById(`tab-${next}`)?.focus();
              }}
              className={`min-h-11 rounded px-2 font-medium ${method === m ? "bg-paper-2 text-accent shadow-sm" : "text-ink-2"}`}
            >
              {t(m)}
            </button>
          ))}
        </div>
        <div id="pay-panel" role="tabpanel" aria-labelledby={`tab-${method}`} className="mt-3 rounded-md border border-dashed border-rule p-3 text-ink-2">
          {body[method]}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn btn-primary bg-ok hover:bg-ok" disabled={busy} onClick={onSuccess} data-testid="pay-success">
            {t("success")}
          </button>
          <button type="button" className="btn btn-outline border-bad text-bad hover:bg-bad-tint" disabled={busy} onClick={onFailure} data-testid="pay-failure">
            {t("failure")}
          </button>
        </div>
        <button type="button" className="btn btn-quiet mt-2 w-full" disabled={busy} onClick={onCancel}>
          {t("cancel")}
        </button>
      </div>
    </dialog>
  );
}
