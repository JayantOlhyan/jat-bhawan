import type { Metadata } from "next";
import { Suspense } from "react";
import { Dashboard } from "@/components/admin/Dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}
