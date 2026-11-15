import { getTranslations } from "next-intl/server";
import { ReceiptView, type ReceiptLabels } from "@/components/receipt/ReceiptView";
import { getRepos } from "@/lib/data";
import type { DonationSource } from "@/lib/data/types";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/receipt/[id]">) {
  const { locale, id } = await params;
  return pageMetadata(locale, "receipt", `/receipt/${id}`);
}

const KEYS = [
  "title", "receiptNo", "date", "receivedFrom", "fatherName", "village", "amount", "inWords",
  "fund", "mode", "reference", "regNo", "signature", "signatureHere", "eightyG",
  "print", "paper", "paperA4", "paperA5", "notFound", "notIssued", "void", "watermark",
] as const;
const SOURCES: DonationSource[] = ["online", "cash", "cheque", "upi_manual", "legacy"];

async function labelsFor(locale: "hi" | "en"): Promise<ReceiptLabels> {
  const t = await getTranslations({ locale, namespace: "Receipt" });
  const out = Object.fromEntries(KEYS.map((k) => [k, t(k)])) as Omit<ReceiptLabels, "modes">;
  const modes = Object.fromEntries(SOURCES.map((s) => [s, t(`modes.${s}`)])) as ReceiptLabels["modes"];
  return { ...out, modes };
}

export default async function ReceiptPage({ params }: PageProps<"/[locale]/receipt/[id]">) {
  const { locale, id } = await params;
  const repos = getRepos();
  // Seed records render on the server; demo-created ones load in the browser.
  const [donation, funds, trust, labels] = await Promise.all([
    repos.donations.get(id),
    repos.funds.list(),
    repos.trust.get(),
    labelsFor(locale as "hi" | "en"),
  ]);
  return (
    <div className="bg-paper-3 py-(--space-2xl) print:bg-paper-2 print:py-0">
      <div className="container-site">
        <ReceiptView id={id} initial={donation} funds={funds} trust={trust} labels={labels} uiLocale={locale as "hi" | "en"} />
      </div>
    </div>
  );
}
