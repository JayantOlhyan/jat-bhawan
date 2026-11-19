import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "OG template (dev only)",
  robots: { index: false, follow: false, nocache: true },
};

/** Bare root layout for the social-image template: the site's fonts and tokens, nothing else. */
export default function OgLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={fontVariables}>
      <body className="m-0 bg-ivory">{children}</body>
    </html>
  );
}
