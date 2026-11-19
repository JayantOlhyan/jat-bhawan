"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { toCsv } from "@/lib/csv";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import type { AdminDonationFilter } from "@/lib/data/repos";
import type { Donation, DonationSource, DonationStatus, Fund } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { fyLabel, istDateKey } from "@/lib/fy";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { offlineDonationSchema, type OfflineDonationInput, type OfflineDonationValues } from "@/lib/schemas";

const STATUSES: DonationStatus[] = ["created", "pending", "verified", "failed", "void"];
const SOURCES: DonationSource[] = ["online", "cash", "cheque", "upi_manual", "legacy"];
const STATUS_STYLE: Record<DonationStatus, string> = {
  verified: "bg-success-tint text-success border-success",
  pending: "bg-warn-tint text-warn border-warn",
  created: "bg-sand text-ink-soft border-line",
  failed: "bg-error-tint text-error border-error",
  void: "bg-ink text-ivory border-ink",
};
const SOURCE_LABEL: Record<DonationSource, string> = { online: "Online", cash: "Cash", cheque: "Cheque", upi_manual: "UPI (manual)", legacy: "Legacy" };
const DISPLAY_LABEL = { full: "Name + amount", hide_amount: "Hide amount", anonymous: "Anonymous" } as const;

export function DonationsAdmin() {
  const params = useSearchParams();
  const [filter, setFilter] = useState<AdminDonationFilter>({
    status: (params.get("status") as DonationStatus) || undefined,
  });
  const [adding, setAdding] = useState(false);
  const [voiding, setVoiding] = useState<Donation | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const funds = useLiveQuery<Fund[]>((r) => r.funds.list(), [], ["donations"], []);
  const rows = useLiveQuery<Donation[] | null>((r) => r.donations.list(filter), [filter], ["donations"], null);
  const fyOptions = ["2027-28", "2026-27", "2025-26"];
  const fundName = (id: string) => funds.find((f) => f.id === id)?.nameEn ?? id;
  const set = (patch: Partial<AdminDonationFilter>) => setFilter((f) => ({ ...f, ...patch }));

  const verify = async (d: Donation) => {
    const v = await getRepos().donations.verify(d.id);
    setFlash(`Verified. Receipt ${v.receiptNo} issued to ${v.donorName}.`);
  };

  const exportCsv = () => {
    if (!rows) return;
    const csv = toCsv(
      ["Receipt no", "Date", "FY", "Status", "Source", "Fund", "Amount (₹)", "Donor", "Father/Husband", "Village", "Gotra", "Mobile", "Email", "Display", "Reference", "Void reason"],
      rows.map((d) => [
        d.receiptNo ?? "", istDateKey(new Date(d.donatedAt)), fyLabel(new Date(d.donatedAt)), d.status, SOURCE_LABEL[d.source], fundName(d.fundId),
        (d.amountPaise / 100).toFixed(2), d.donorName, d.donorFatherName, d.donorVillage, d.donorGotra ?? "", d.donorMobile, d.donorEmail ?? "",
        DISPLAY_LABEL[d.display], d.paymentRef ?? "", d.voidReason ?? "",
      ]),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${istDateKey(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem]">Donations</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet" onClick={exportCsv} disabled={!rows?.length}>Export CSV</button>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)} data-testid="add-offline">Add offline donation</button>
        </div>
      </div>

      {flash && (
        <p role="status" className="flex items-center justify-between rounded-md border border-success bg-success-tint p-3 text-success">
          {flash}
          <button type="button" className="btn btn-quiet min-h-9 px-2" onClick={() => setFlash(null)} aria-label="Dismiss">✕</button>
        </p>
      )}

      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <div className="lg:col-span-1">
          <label htmlFor="as" className="field-label">Search</label>
          <input id="as" type="search" className="field" placeholder="Name, village, receipt, ref, mobile" value={filter.search ?? ""} onChange={(e) => set({ search: e.target.value || undefined })} />
        </div>
        <Select id="ast" label="Status" value={filter.status} options={STATUSES.map((s) => [s, s])} onChange={(v) => set({ status: v as DonationStatus })} />
        <Select id="asr" label="Source" value={filter.source} options={SOURCES.map((s) => [s, SOURCE_LABEL[s]])} onChange={(v) => set({ source: v as DonationSource })} />
        <Select id="afu" label="Fund" value={filter.fundId} options={funds.map((f) => [f.id, f.nameEn])} onChange={(v) => set({ fundId: v })} />
        <Select id="afy" label="Financial year" value={filter.fy} options={fyOptions.map((y) => [y, y])} onChange={(v) => set({ fy: v })} />
      </div>

      {!rows ? (
        <p className="text-ink-soft">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <p className="border-b border-line px-4 py-2 text-ink-soft">
            {rows.length} donations, verified total {formatINR(rows.filter((d) => d.status === "verified").reduce((s, d) => s + d.amountPaise, 0))}
          </p>
          <table className="w-full min-w-[64rem] text-left text-[0.95rem]" data-testid="donations-table">
            <thead className="border-b border-line bg-sand/60">
              <tr>
                {["Date", "Receipt", "Donor", "Fund", "Amount", "Source / ref", "Status", "Display", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((d) => (
                <tr key={d.id} className="border-b border-line/60 align-top" data-id={d.id}>
                  <td className="whitespace-nowrap px-3 py-2">{formatDate("en", d.donatedAt, { month: "short" })}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{d.receiptNo ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="font-semibold">{d.donorName}</span>
                    <span className="block text-ink-soft">{d.donorVillage}</span>
                    <span className="block text-ink-soft">{d.donorMobile}</span>
                  </td>
                  <td className="px-3 py-2">{fundName(d.fundId)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums">{formatINR(d.amountPaise)}</td>
                  <td className="px-3 py-2">
                    {SOURCE_LABEL[d.source]}
                    <span className="block break-all text-ink-soft">{d.paymentRef}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded border px-2 text-[0.85rem] font-semibold ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                    {d.voidReason && <span className="block text-[0.85rem] text-ink-soft">{d.voidReason}</span>}
                  </td>
                  <td className="px-3 py-2">{DISPLAY_LABEL[d.display]}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {d.status === "pending" && (
                        <button type="button" className="btn btn-primary min-h-9 px-2 text-[0.9rem]" onClick={() => verify(d)}>Verify</button>
                      )}
                      {d.receiptNo && (
                        <Link href={`/en/receipt/${d.id}`} target="_blank" className="btn btn-quiet min-h-9 px-2 text-[0.9rem]">Receipt</Link>
                      )}
                      {d.status !== "void" && d.status !== "failed" && (
                        <button type="button" className="btn btn-quiet min-h-9 px-2 text-[0.9rem] text-error" onClick={() => setVoiding(d)}>Void</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={adding} title="Add offline donation" onClose={() => setAdding(false)} wide>
        <OfflineForm
          funds={funds}
          onDone={(d) => {
            setAdding(false);
            setFlash(`Saved. Receipt ${d.receiptNo ?? "(pending)"} for ${d.donorName}.`);
          }}
        />
      </Modal>

      <Modal open={!!voiding} title="Void donation" onClose={() => setVoiding(null)}>
        {voiding && (
          <VoidForm
            donation={voiding}
            onDone={() => {
              setFlash(`Voided ${voiding.receiptNo ?? voiding.id}. The record is kept; the receipt number is not reused.`);
              setVoiding(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function Select({
  id, label, value, options, onChange,
}: { id: string; label: string; value?: string; options: Array<[string, string]>; onChange: (v: string | undefined) => void }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} className="field" value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function OfflineForm({ funds, onDone }: { funds: Fund[]; onDone: (d: Donation) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OfflineDonationInput, unknown, OfflineDonationValues>({
    resolver: zodResolver(offlineDonationSchema),
    defaultValues: {
      fundId: funds[0]?.id ?? "fund-general", source: "cash", display: "full", donatedAt: istDateKey(new Date()),
      paymentRef: "", donorName: "", donorFatherName: "", donorVillage: "", donorGotra: "", donorMobile: "",
    },
  });
  const onSubmit = async (v: OfflineDonationValues) => {
    // Noon IST on the chosen day keeps the FY correct.
    const donatedAt = new Date(`${v.donatedAt}T12:00:00+05:30`).toISOString();
    const d = await getRepos().donations.create({
      fundId: v.fundId, amountPaise: rupeesToPaise(v.amountRupees), source: v.source, paymentRef: v.paymentRef,
      donorName: v.donorName, donorFatherName: v.donorFatherName, donorVillage: v.donorVillage, donorGotra: v.donorGotra || undefined,
      donorMobile: v.donorMobile, display: v.display, donatedAt,
    });
    onDone(d);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2" data-testid="offline-form">
      <Field label="Mode" required error={errors.source?.message}>
        {(p) => (
          <select {...p} {...register("source")} className="field">
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="upi_manual">UPI (manual) — creates a pending entry</option>
          </select>
        )}
      </Field>
      <Field label="Reference no. (cash book / cheque / UTR)" required error={errors.paymentRef?.message}>
        {(p) => <input {...p} {...register("paymentRef")} className="field" />}
      </Field>
      <Field label="Fund" required error={errors.fundId?.message}>
        {(p) => <select {...p} {...register("fundId")} className="field">{funds.map((f) => <option key={f.id} value={f.id}>{f.nameEn}</option>)}</select>}
      </Field>
      <Field label="Amount (₹)" required error={errors.amountRupees?.message}>
        {(p) => <input {...p} {...register("amountRupees", { valueAsNumber: true })} type="number" min={1} inputMode="numeric" className="field" />}
      </Field>
      <Field label="Date received" required error={errors.donatedAt?.message}>
        {(p) => <input {...p} {...register("donatedAt")} type="date" className="field" />}
      </Field>
      <Field label="Donor wall display" required>
        {(p) => (
          <select {...p} {...register("display")} className="field">
            <option value="full">Name + amount</option>
            <option value="hide_amount">Name, hide amount</option>
            <option value="anonymous">Anonymous</option>
          </select>
        )}
      </Field>
      <Field label="Donor name" required error={errors.donorName?.message}>
        {(p) => <input {...p} {...register("donorName")} className="field" />}
      </Field>
      <Field label="Father's / husband's name" required error={errors.donorFatherName?.message}>
        {(p) => <input {...p} {...register("donorFatherName")} className="field" />}
      </Field>
      <Field label="Village" required error={errors.donorVillage?.message}>
        {(p) => <input {...p} {...register("donorVillage")} className="field" />}
      </Field>
      <Field label="Gotra" error={errors.donorGotra?.message}>
        {(p) => <input {...p} {...register("donorGotra")} className="field" />}
      </Field>
      <Field label="Mobile" required error={errors.donorMobile?.message}>
        {(p) => <input {...p} {...register("donorMobile")} type="tel" className="field" />}
      </Field>
      <div className="flex items-end">
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>Save donation</button>
      </div>
    </form>
  );
}

function VoidForm({ donation, onDone }: { donation: Donation; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (reason.trim().length < 5) return setError("Give a reason (at least 5 characters).");
        await getRepos().donations.void(donation.id, reason);
        onDone();
      }}
    >
      <p>
        Void <strong>{donation.receiptNo ?? donation.id}</strong>: {donation.donorName}, {formatINR(donation.amountPaise)}. The record is never deleted and
        disappears from public pages.
      </p>
      <Field label="Reason (required)" required error={error ?? undefined}>
        {(p) => <textarea {...p} rows={3} className="field" value={reason} onChange={(e) => setReason(e.target.value)} />}
      </Field>
      <button type="submit" className="btn btn-primary bg-error">Void donation</button>
    </form>
  );
}
