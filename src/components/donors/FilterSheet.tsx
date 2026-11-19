"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LineIcon } from "@/components/ui/LineIcon";

/**
 * Holds the donor-wall filter form. Desktop: a sticky bar. Phones: hidden
 * behind a "Filters" button that opens it as a bottom sheet. Without script
 * the form simply shows inline at every width.
 */
export function FilterSheet({ children, active = 0 }: { children: React.ReactNode; active?: number }) {
  const t = useTranslations("Donors");
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the sheet behaviour starts after hydration
    setReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    sheet.current?.querySelector<HTMLElement>("input, select, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        opener.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const sheetCls = !ready
    ? ""
    : open
      ? "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-(--z-modal) max-lg:max-h-[85dvh] max-lg:overflow-y-auto max-lg:rounded-t-[20px] max-lg:border-t max-lg:border-brass max-lg:bg-ivory max-lg:p-(--gutter) max-lg:shadow-(--shadow-raised)"
      : "max-lg:hidden";

  return (
    <div className="mb-(--space-xl) lg:sticky lg:top-[5.5rem] lg:z-(--z-raised)">
      {ready && (
        <button
          ref={opener}
          type="button"
          className="btn btn-quiet lg:hidden"
          aria-expanded={open}
          aria-controls="donor-filters"
          onClick={() => setOpen(true)}
        >
          <LineIcon name="filter" className="size-5 text-maroon" />
          {t("filters")}
          {active > 0 && <span className="rounded-(--radius-pill) bg-maroon px-(--space-xs) text-sm text-ivory">{active}</span>}
        </button>
      )}
      {ready && open && <div aria-hidden="true" className="fixed inset-0 z-[350] bg-scrim lg:hidden" onClick={() => setOpen(false)} />}
      <div ref={sheet} id="donor-filters" role={ready && open ? "dialog" : undefined} aria-modal={ready && open ? true : undefined} aria-label={t("filters")} className={sheetCls}>
        {ready && open && (
          <div className="mb-(--space-md) flex items-center justify-between lg:hidden">
            <p className="font-heading text-xl text-maroon">{t("filters")}</p>
            <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-line" onClick={() => setOpen(false)}>
              <LineIcon name="close" className="size-5" />
              <span className="sr-only">{t("filtersClose")}</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
