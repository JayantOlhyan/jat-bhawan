"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLiveQuery } from "@/lib/data/hooks";
import type { CommitteePost } from "@/lib/data/types";
import { pick, type AppLocale } from "@/lib/format";
import { Avatar } from "./Avatar";
import { inScript } from "@/lib/translit";

export function CommitteeList({ initial }: { initial: CommitteePost[] }) {
  const t = useTranslations("Committee");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const list = useLiveQuery((r) => r.committee.listPublic(), [], ["committee"], initial);
  const [lead, rest] = [list.filter((c) => c.postRank <= 3), list.filter((c) => c.postRank > 3)];

  const card = (c: CommitteePost, big: boolean) => {
    const name = inScript(pick(locale, c.nameHi || c.name, c.name), locale);
    return (
      <li key={c.id} data-lift className={`card-raised flex items-start gap-(--space-md) p-(--space-md) ${big ? "border-t-4 border-t-maroon md:p-(--space-lg)" : ""}`}>
        <Avatar name={name} photo={c.photo} size={big ? "lg" : "md"} fallback="portrait" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-maroon">{pick(locale, c.postHi, c.postEn)}</p>
          <p className={`${big ? "text-xl" : "text-lg"} font-semibold break-words`}>{name}</p>
          <p className="text-[0.95rem] text-ink-soft break-words">{tc("sonOf", { name: inScript(c.fatherName, locale) })}</p>
          <p className="text-[0.95rem] text-muted">{t("term", { term: c.termLabel })}</p>
          {c.phone && <a href={`tel:${c.phone}`} className="inline-flex min-h-11 items-center text-maroon">{c.phone}</a>}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-(--space-lg)" data-testid="committee">
      <ul data-rise className="grid gap-(--space-md) md:grid-cols-3">{lead.map((c) => card(c, true))}</ul>
      <ul data-rise className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-3">{rest.map((c) => card(c, false))}</ul>
    </div>
  );
}
