import { Suspense } from "react";
import { SuccessView } from "@/components/donate/SuccessView";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata({ params }: PageProps<"/[locale]/donate/success">) {
  const { locale } = await params;
  return pageMetadata(locale, "success", "/donate/success");
}

export default function SuccessPage() {
  return (
    <div className="container-site max-w-2xl py-10">
      <Suspense fallback={<p className="py-10 text-center text-ink-2">…</p>}>
        <SuccessView />
      </Suspense>
    </div>
  );
}
