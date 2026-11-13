"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "./nav-items";

export function DesktopNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("mainNav")}>
      <ul className="flex items-center justify-center gap-(--space-lg)">
        {NAV_ITEMS.slice(1).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap no-underline transition-colors duration-(--dur-short) hover:text-accent ${
                  active ? "font-semibold text-accent underline decoration-2 underline-offset-8" : "text-ink-2"
                }`}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
