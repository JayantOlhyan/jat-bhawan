"use client";

import { useEffect, useState } from "react";
import { getRepos } from "@/lib/data";
import type { Donation, Fund, TrustSettings } from "@/lib/data/types";
import { formatDate, formatPaymentRef, formatPlaceholderMark, pick } from "@/lib/format";
import { amountInWordsEn, amountInWordsHi, formatINR } from "@/lib/money";
import { inScript } from "@/lib/translit";

export type ReceiptLabels = Record<
  | "title" | "receiptNo" | "date" | "receivedFrom" | "fatherName" | "village" | "amount"
  | "inWords" | "fund" | "mode" | "reference" | "regNo" | "signature"
  | "signatureHere" | "eightyG" | "print" | "paper" | "paperA4" | "paperA5" | "notFound" | "notIssued" | "void" | "watermark",
  string
> & { modes: Record<Donation["source"], string> };

/** One receipt, printed wholly in the page's language. */
export function ReceiptView({
  id,
  initial,
  funds,
  trust,
  labels: ui,
  uiLocale: locale,
}: {
  id: string;
  initial: Donation | null;
  funds: Fund[];
  trust: TrustSettings;
  labels: ReceiptLabels;
  uiLocale: "hi" | "en";
}) {
  const [donation, setDonation] = useState<Donation | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [paper, setPaper] = useState<"A4" | "A5">("A4");

  useEffect(() => {
    const repos = getRepos();
    const load = () =>
      repos.donations.get(id).then((d) => {
        setDonation(d);
        setLoading(false);
      });
    load();
    return repos.subscribe("donations", load);
  }, [id]);

  if (loading) return <p className="py-10 text-center text-ink-soft">…</p>;
  if (!donation || !donation.receiptNo) {
    return (
      <div className="card mx-auto max-w-xl p-(--space-lg) text-center" data-testid="receipt-missing">
        <p className="text-lg">{donation ? ui.notIssued : ui.notFound}</p>
      </div>
    );
  }

  const fund = funds.find((f) => f.id === donation.fundId);
  const isVoid = donation.status === "void";
  const sizes = { A4: ui.paperA4, A5: ui.paperA5 } as const;

  return (
    <>
      <style>{`@page { size: ${paper}; margin: ${paper === "A4" ? "14mm" : "8mm"}; }`}</style>
      <div className="no-print mb-(--space-lg) flex flex-wrap items-center justify-center gap-(--space-sm)">
        <span className="font-medium">{ui.paper}:</span>
        {(["A4", "A5"] as const).map((p) => (
          <button key={p} type="button" aria-pressed={paper === p} onClick={() => setPaper(p)} className="btn btn-quiet">
            {sizes[p]}
          </button>
        ))}
        <button type="button" className="btn btn-outline" onClick={() => window.print()} data-testid="print">
          {ui.print}
        </button>
      </div>

      <article
        data-ivory={paper}
        data-testid="receipt"
        className={`receipt frame relative mx-auto overflow-hidden bg-surface text-ink ${
          paper === "A4" ? "max-w-[190mm] p-(--space-lg) sm:p-(--space-xl)" : "max-w-[136mm] p-(--space-md) text-[0.92rem]"
        }`}
      >
        {/* Watermark */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
          <div className="display -rotate-[24deg] text-center text-maroon/15">
            {isVoid && <p className="text-[clamp(2.5rem,10vw,5rem)]">{ui.void}</p>}
            <p className="text-[clamp(2rem,8vw,4.5rem)]">{ui.watermark}</p>
          </div>
        </div>

        <header className="relative border-b-2 border-maroon pb-(--space-md) text-center">
          <p className="font-heading text-2xl text-maroon">{pick(locale, trust.nameHi, trust.nameEn)}</p>
          <p className="mt-(--space-2xs) text-[0.9rem] text-ink-soft">{pick(locale, trust.addressHi, trust.addressEn)}</p>
          <p className="text-[0.9rem] text-ink-soft">
            {ui.regNo}: {formatPlaceholderMark(locale, trust.regNo)}, {trust.phone}
          </p>
          <p className="mt-(--space-sm) inline-block border-y border-brass px-(--space-sm) py-(--space-2xs) text-lg font-semibold">{ui.title}</p>
        </header>

        <dl className="relative mt-(--space-md) grid grid-cols-1 gap-x-(--space-md) gap-y-(--space-2xs) sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-y-(--space-xs) print:grid-cols-[minmax(0,13rem)_1fr] [&>dd]:mb-(--space-xs) sm:[&>dd]:mb-0">
          <dt className="font-medium">{ui.receiptNo}</dt>
          <dd className="whitespace-nowrap font-medium tabular-nums" data-testid="receipt-number">{donation.receiptNo}</dd>
          <dt className="font-medium">{ui.date}</dt>
          <dd>{formatDate(locale, donation.verifiedAt ?? donation.donatedAt)}</dd>
          <dt className="font-medium">{ui.receivedFrom}</dt>
          <dd className="text-lg font-medium break-words">{inScript(donation.donorName, locale)}</dd>
          <dt className="font-medium">{ui.fatherName}</dt>
          <dd className="break-words">{inScript(donation.donorFatherName, locale)}</dd>
          <dt className="font-medium">{ui.village}</dt>
          <dd className="break-words">{inScript(donation.donorVillage, locale)}</dd>
          <dt className="font-medium">{ui.amount}</dt>
          <dd className="figure text-[2rem] text-ink" data-testid="receipt-amount">{formatINR(donation.amountPaise)}</dd>
          <dt className="font-medium">{ui.inWords}</dt>
          {locale === "hi" ? (
            <dd data-testid="words-hi">{amountInWordsHi(donation.amountPaise)}</dd>
          ) : (
            <dd data-testid="words-en">{amountInWordsEn(donation.amountPaise)}</dd>
          )}
          <dt className="font-medium">{ui.fund}</dt>
          <dd>{fund ? pick(locale, fund.nameHi, fund.nameEn) : ""}</dd>
          <dt className="font-medium">{ui.mode}</dt>
          <dd>{ui.modes[donation.source]}</dd>
          <dt className="font-medium">{ui.reference}</dt>
          <dd className="break-all tabular-nums">{formatPaymentRef(locale, donation.paymentRef)}</dd>
        </dl>

        {trust.has80g && <p className="relative mt-(--space-md) border border-line p-(--space-xs) text-[0.9rem]">{ui.eightyG}</p>}

        <footer className="relative mt-(--space-xl) flex justify-end">
          <div className="text-center">
            <div className="flex h-14 w-48 items-end justify-center border-b border-ink text-[0.85rem] text-ink-soft">[{ui.signatureHere}]</div>
            <p className="mt-(--space-2xs) text-[0.9rem] font-medium">{ui.signature}</p>
          </div>
        </footer>
      </article>
    </>
  );
}
