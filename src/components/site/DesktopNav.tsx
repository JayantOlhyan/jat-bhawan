"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "./nav-items";

export function DesktopNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("mainNav")}>
      <ul className="flex items-center justify-center gap-(--space-md) xl:gap-(--space-lg)">
        {NAV_ITEMS.slice(1).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap font-medium no-underline hover:text-maroon ${
                  active ? "text-maroon underline decoration-brass decoration-2 underline-offset-[10px]" : "text-ink-soft"
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
