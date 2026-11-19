import type { Metadata } from "next";
import { DemoBanner } from "@/components/site/DemoBanner";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin | Jat Bhawan (demo)", template: "%s | Admin | Jat Bhawan (demo)" },
  robots: { index: false, follow: false, nocache: true },
};

/** Admin is a separate root layout: English-only, no public header/footer. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} overflow-x-clip`}>
      <body className="min-h-dvh overflow-x-clip bg-ivory">
        <DemoBanner locale="en" />
        <div role="note" className="border-b border-warn bg-warn-tint px-4 py-2 text-center font-semibold text-warn">
          Demo admin: the real version uses secure login with 2-factor
        </div>
        {children}
      </body>
    </html>
  );
}
