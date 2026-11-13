import type { Metadata } from "next";
import { Suspense } from "react";
import { MembersAdmin } from "@/components/admin/MembersAdmin";

export const metadata: Metadata = { title: "Members" };

export default function Page() {
  return (
    <Suspense fallback={<p className="text-ink-2">Loading…</p>}>
      <MembersAdmin />
    </Suspense>
  );
}
