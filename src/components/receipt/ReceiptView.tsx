"use client";

import { useEffect, useState } from "react";
import { getRepos } from "@/lib/data";
import type { Donation, Fund, TrustSettings } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { amountInWordsEn, amountInWordsHi, formatINR } from "@/lib/money";

export type ReceiptLabels = Record<
  | "title" | "receiptNo" | "date" | "receivedFrom" | "fatherName" | "village" | "amount"
  | "inWordsEn" | "inWordsHi" | "fund" | "mode" | "reference" | "regNo" | "signature"
  | "signatureHere" | "eightyG" | "print" | "paper" | "notFound" | "notIssued" | "void",
  string
> & { modes: Record<Donation["source"], string> };

/** Bilingual label: Hindi / English. Receipts carry both languages. */
function L({ hi, en }: { hi: string; en: string }) {
  return (
    <>
      <span lang="hi">{hi}</span> <span className="text-ink-2">/</span> <span lang="en">{en}</span>
    </>
  );
}

export function ReceiptView({
  id,
  initial,
  funds,
  trust,
  labels,
  uiLocale,
}: {
  id: string;
  initial: Donation | null;
  funds: Fund[];
  trust: TrustSettings;
  labels: { hi: ReceiptLabels; en: ReceiptLabels };
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

  const ui = labels[uiLocale];
  const { hi, en } = labels;

  if (loading) return <p className="py-10 text-center text-ink-2">…</p>;
  if (!donation || !donation.receiptNo) {
    return (
      <div className="card mx-auto max-w-xl p-6 text-center" data-testid="receipt-missing">
        <p className="text-lg">{donation ? ui.notIssued : ui.notFound}</p>
      </div>
    );
  }

  const fund = funds.find((f) => f.id === donation.fundId);
  const isVoid = donation.status === "void";

  return (
    <>
      <style>{`@page { size: ${paper}; margin: ${paper === "A4" ? "14mm" : "8mm"}; }`}</style>
      <div className="no-print mb-4 flex flex-wrap items-center justify-center gap-3">
        <span className="font-semibold">{ui.paper}:</span>
        {(["A4", "A5"] as const).map((p) => (
          <button key={p} type="button" aria-pressed={paper === p} onClick={() => setPaper(p)} className={`btn ${paper === p ? "btn-primary" : "btn-quiet"}`}>
            {p}
          </button>
        ))}
        <button type="button" className="btn btn-outline" onClick={() => window.print()} data-testid="print">
          {ui.print}
        </button>
      </div>

      <article
        data-paper={paper}
        data-testid="receipt"
        className={`receipt relative mx-auto overflow-hidden border-2 border-accent bg-white text-ink ${
          paper === "A4" ? "max-w-[190mm] p-6 sm:p-10" : "max-w-[136mm] p-5 text-[0.92rem]"
        }`}
      >
        {/* Watermark */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
          <div className="-rotate-[30deg] text-center font-sans font-bold leading-tight text-accent/15">
            {isVoid && <p className="text-[clamp(2rem,9vw,4.5rem)]">{hi.void} / {en.void}</p>}
            <p className="text-[clamp(1.6rem,7vw,3.6rem)]">नमूना: मान्य नहीं</p>
            <p className="text-[clamp(1.4rem,6vw,3.2rem)]">SAMPLE: NOT VALID</p>
          </div>
        </div>

        <header className="relative border-b-2 border-gold pb-4 text-center">
          <p lang="hi" className="font-serif text-2xl text-accent">{trust.nameHi}</p>
          <p lang="en" className="text-lg font-semibold">{trust.nameEn}</p>
          <p className="mt-1 text-[0.9rem] text-ink-2">
            <span lang="hi">{trust.addressHi}</span>
            <br />
            <span lang="en">{trust.addressEn}</span>
          </p>
          <p className="text-[0.9rem] text-ink-2">
            <L hi={hi.regNo} en={en.regNo} />: {trust.regNo}, {trust.phone}
          </p>
          <p className="mt-3 inline-block border border-ink px-3 font-semibold text-ink">
            <L hi={hi.title} en={en.title} />
          </p>
        </header>

        <dl className="relative mt-4 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-y-2 print:grid-cols-[minmax(0,13rem)_1fr] print:gap-y-2 [&>dd]:mb-2 sm:[&>dd]:mb-0">
          <dt className="font-semibold"><L hi={hi.receiptNo} en={en.receiptNo} /></dt>
          <dd className="whitespace-nowrap font-semibold tabular-nums" data-testid="receipt-number">{donation.receiptNo}</dd>
          <dt className="font-semibold"><L hi={hi.date} en={en.date} /></dt>
          <dd>{formatDate("en", donation.verifiedAt ?? donation.donatedAt)}</dd>
          <dt className="font-semibold"><L hi={hi.receivedFrom} en={en.receivedFrom} /></dt>
          <dd className="text-lg font-semibold break-words">{donation.donorName}</dd>
          <dt className="font-semibold"><L hi={hi.fatherName} en={en.fatherName} /></dt>
          <dd className="break-words">{donation.donorFatherName}</dd>
          <dt className="font-semibold"><L hi={hi.village} en={en.village} /></dt>
          <dd className="break-words">{donation.donorVillage}</dd>
          <dt className="font-semibold"><L hi={hi.amount} en={en.amount} /></dt>
          <dd className="font-serif text-2xl tabular-nums text-ink" data-testid="receipt-amount">{formatINR(donation.amountPaise)}</dd>
          <dt className="font-semibold"><L hi={hi.inWordsEn} en={en.inWordsEn} /></dt>
          <dd lang="en" data-testid="words-en">{amountInWordsEn(donation.amountPaise)}</dd>
          <dt className="font-semibold"><L hi={hi.inWordsHi} en={en.inWordsHi} /></dt>
          <dd lang="hi" data-testid="words-hi">{amountInWordsHi(donation.amountPaise)}</dd>
          <dt className="font-semibold"><L hi={hi.fund} en={en.fund} /></dt>
          <dd>{fund ? <L hi={fund.nameHi} en={fund.nameEn} /> : "—"}</dd>
          <dt className="font-semibold"><L hi={hi.mode} en={en.mode} /></dt>
          <dd><L hi={hi.modes[donation.source]} en={en.modes[donation.source]} /></dd>
          <dt className="font-semibold"><L hi={hi.reference} en={en.reference} /></dt>
          <dd className="break-all tabular-nums">{donation.paymentRef ?? "—"}</dd>
        </dl>

        {trust.has80g && (
          <p className="relative mt-4 rounded border border-rule p-2 text-[0.9rem]">
            <span lang="hi">{hi.eightyG}</span>
            <br />
            <span lang="en">{en.eightyG}</span>
          </p>
        )}

        <footer className="relative mt-10 flex justify-end">
          <div className="text-center">
            <div className="flex h-14 w-48 items-end justify-center border-b border-ink text-[0.85rem] text-ink-2">
              [<L hi={hi.signatureHere} en={en.signatureHere} />]
            </div>
            <p className="mt-1 text-[0.9rem] font-semibold"><L hi={hi.signature} en={en.signature} /></p>
          </div>
        </footer>
      </article>
    </>
  );
}
