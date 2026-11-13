"use client";

import Link from "next/link";
import { useState } from "react";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import type { FundTotals } from "@/lib/data/repos";
import type { Fund } from "@/lib/data/types";
import { formatINR } from "@/lib/money";

interface DashData {
  totals: FundTotals[];
  funds: Fund[];
  pending: number;
  enquiries: number;
  upiManual: boolean;
}

export function Dashboard() {
  const data = useLiveQuery<DashData | null>(
    async (r) => {
      const [totals, funds, pending, enquiries, demo] = await Promise.all([
        r.donations.totalsByFund(),
        r.funds.list(),
        r.donations.pendingCount(),
        r.bookings.newEnquiryCount(),
        r.demo.get(),
      ]);
      return { totals, funds, pending, enquiries, upiManual: demo.upiManual };
    },
    [],
    ["donations", "bookings", "settings"],
    null,
  );
  const [confirmReset, setConfirmReset] = useState(false);

  if (!data) return <p className="text-ink-2">Loading…</p>;
  const sum = (k: keyof Omit<FundTotals, "fundId">) => data.totals.reduce((s, x) => s + x[k], 0);

  return (
    <div className="space-y-8">
      <h1 className="text-[2rem]">Dashboard</h1>

      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["Today", "todayPaise"],
            ["This month", "monthPaise"],
            ["All time", "allTimePaise"],
          ] as const
        ).map(([label, key]) => (
          <div key={key} className="card p-4">
            <p className="text-ink-2">{label}</p>
            <p className="text-2xl font-semibold tabular-nums text-accent" data-testid={`total-${key}`}>{formatINR(sum(key))}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/donations?status=pending" className="card flex items-center justify-between p-4 no-underline hover:border-accent">
          <span className="text-lg text-ink">Pending verifications</span>
          <span className={`rounded-full px-3 text-xl font-bold ${data.pending ? "bg-warn-tint text-warn" : "bg-paper-3 text-ink-2"}`}>{data.pending}</span>
        </Link>
        <Link href="/admin/bookings" className="card flex items-center justify-between p-4 no-underline hover:border-accent">
          <span className="text-lg text-ink">New hall enquiries</span>
          <span className={`rounded-full px-3 text-xl font-bold ${data.enquiries ? "bg-warn-tint text-warn" : "bg-paper-3 text-ink-2"}`}>{data.enquiries}</span>
        </Link>
      </section>

      <section className="card overflow-x-auto p-4">
        <h2 className="mb-3 font-sans text-xl font-semibold">Verified totals by fund</h2>
        <table className="w-full min-w-[32rem] text-left">
          <thead className="border-b border-rule text-ink-2">
            <tr>
              <th className="py-2 pr-4 font-semibold">Fund</th>
              <th className="py-2 pr-4 text-right font-semibold">Today</th>
              <th className="py-2 pr-4 text-right font-semibold">This month</th>
              <th className="py-2 text-right font-semibold">All time</th>
            </tr>
          </thead>
          <tbody>
            {data.totals.map((t) => (
              <tr key={t.fundId} className="border-b border-rule/60">
                <td className="py-2 pr-4">{data.funds.find((f) => f.id === t.fundId)?.nameEn}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{formatINR(t.todayPaise)}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{formatINR(t.monthPaise)}</td>
                <td className="py-2 text-right tabular-nums">{formatINR(t.allTimePaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card space-y-4 p-4">
        <h2 className="font-sans text-xl font-semibold">Demo settings</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="size-5 accent-accent"
            checked={data.upiManual}
            onChange={(e) => getRepos().demo.set({ upiManual: e.target.checked })}
            data-testid="toggle-upi"
          />
          <span>
            Use the <strong>UPI-manual fallback</strong> on the donate page (QR + UTR, creates a pending donation) instead of the test gateway.
          </span>
        </label>
        <div className="border-t border-rule pt-4">
          <p className="text-ink-2">Reset removes every donation, booking and edit made during the demo (in this browser) and returns to the sample data.</p>
          {confirmReset ? (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="btn btn-primary bg-bad"
                onClick={() => {
                  getRepos().reset();
                  setConfirmReset(false);
                }}
              >
                Yes, reset demo data
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn btn-quiet mt-2" onClick={() => setConfirmReset(true)}>Reset demo data…</button>
          )}
        </div>
      </section>
    </div>
  );
}
