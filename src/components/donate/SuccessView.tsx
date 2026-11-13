"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import type { Donation } from "@/lib/data/types";
import { whatsappLink } from "@/lib/format";
import { formatINR } from "@/lib/money";

export function SuccessView() {
  const t = useTranslations("Success");
  const locale = useLocale();
  const id = useSearchParams().get("id");
  const [state, setState] = useState<{ loading: boolean; donation: Donation | null }>({ loading: true, donation: null });

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no id means nothing to load
      setState({ loading: false, donation: null });
      return;
    }
    getRepos().donations.get(id).then((donation) => setState({ loading: false, donation }));
  }, [id]);

  if (state.loading) return <p className="py-10 text-center text-ink-2">…</p>;
  const d = state.donation;
  if (!d || (d.status !== "verified" && d.status !== "pending")) {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg">{t("notFound")}</p>
        <Link href="/donate" className="btn btn-primary mt-4">{t("donateAgain")}</Link>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? `${window.location.origin}/${locale}/donate` : "";
  const shareText =
    d.display === "full"
      ? t("shareTextFull", { amount: formatINR(d.amountPaise), url })
      : t("shareText", { url });

  if (d.status === "pending") {
    return (
      <div className="card p-6 md:p-8" data-testid="success-pending">
        <h1 className="text-[1.9rem]">{t("pendingTitle")}</h1>
        <hr className="rule-gold mt-3" />
        <p className="mt-4 text-lg">{t("pendingLead")}</p>
        <Link href="/" className="btn btn-outline mt-6">{t("donateAgain")}</Link>
      </div>
    );
  }

  return (
    <div className="card p-6 md:p-8" data-testid="success">
      <h1 className="text-[1.9rem]">{t("title")}</h1>
      <hr className="rule-gold mt-3" />
      <p className="mt-4 text-lg text-ink-2">{t("lead")}</p>
      <dl className="mt-6 rounded-md bg-paper-3 p-4">
        <dt className="text-ink-2">{t("receiptNo")}</dt>
        <dd className="font-serif text-3xl tabular-nums text-ink" data-testid="receipt-no">{d.receiptNo}</dd>
      </dl>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/receipt/${d.id}`} className="btn btn-primary" data-testid="view-receipt">
          {t("viewReceipt")}
        </Link>
        <a href={whatsappLink(shareText)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          {t("share")}
        </a>
      </div>
    </div>
  );
}
