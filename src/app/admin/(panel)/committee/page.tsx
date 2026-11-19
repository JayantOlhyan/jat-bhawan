import type { Metadata } from "next";
import { Suspense } from "react";
import { CommitteeAdmin } from "@/components/admin/CommitteeAdmin";

export const metadata: Metadata = { title: "Committee" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <CommitteeAdmin />
    </Suspense>
  );
}
