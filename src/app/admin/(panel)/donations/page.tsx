import type { Metadata } from "next";
import { Suspense } from "react";
import { DonationsAdmin } from "@/components/admin/DonationsAdmin";

export const metadata: Metadata = { title: "Donations" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-ink-2">Loading…</p>}>
      <DonationsAdmin />
    </Suspense>
  );
}
