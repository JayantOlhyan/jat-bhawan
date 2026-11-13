"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NAV_ITEMS } from "./nav-items";

/** Menu sheet for phones and tablets, on the native <dialog> (focus trap and Esc for free). */
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
        className="btn btn-quiet min-h-11 px-(--space-sm) lg:hidden"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only">{t("menu")}</span>
      </button>
      <dialog
        ref={ref}
        aria-label={t("menu")}
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-paper p-0 text-ink"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b-[5px] border-double border-gold p-(--space-md)">
            <span className="font-serif text-2xl">{t("menu")}</span>
            <button type="button" className="btn btn-quiet min-h-11" onClick={() => ref.current?.close()}>
              {t("close")}
            </button>
          </div>
          <nav aria-label={t("mainNav")} className="flex-1 overflow-y-auto px-(--space-md) py-(--space-xs)">
            <ul className="divide-y divide-rule">
              {NAV_ITEMS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 items-center font-serif text-xl no-underline ${active ? "text-accent" : "text-ink"}`}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex flex-col gap-(--space-sm) border-t border-rule p-(--space-md)">
            <Link href="/donate" className="btn btn-primary w-full text-lg">
              {t("donate")}
            </Link>
            <LanguageSwitcher className="w-full" />
          </div>
        </div>
      </dialog>
    </>
  );
}
