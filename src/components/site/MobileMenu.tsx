"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_ITEMS } from "./nav-items";

/** Full-height menu sheet for phones and tablets, on the native <dialog> (focus trap and Esc for free). Donate comes first. */
export function MobileMenu() {
  const t = useTranslations("Nav");
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-maroon lg:hidden"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only">{t("menu")}</span>
      </button>
      <dialog
        ref={ref}
        aria-label={t("menu")}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ivory p-0 text-ink"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-(--space-sm) border-b border-line px-(--gutter) py-(--space-sm)">
            <Link href="/donate" className="btn btn-primary flex-1 text-lg">
              {t("donate")}
            </Link>
            <button type="button" className="btn btn-quiet min-h-11" onClick={() => ref.current?.close()}>
              {t("close")}
            </button>
          </div>
          <nav aria-label={t("mainNav")} className="flex-1 overflow-y-auto px-(--gutter) py-(--space-xs)">
            <ul className="divide-y divide-line">
              {NAV_ITEMS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-16 items-center font-heading text-[1.6rem] no-underline ${active ? "text-maroon" : "text-ink"}`}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-line px-(--gutter) py-(--space-md)">
            <LanguageSwitcher className="text-lg" />
          </div>
        </div>
      </dialog>
    </>
  );
}
