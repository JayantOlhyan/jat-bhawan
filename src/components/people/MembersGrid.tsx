"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useLiveQuery } from "@/lib/data/hooks";
import type { Member, MemberType } from "@/lib/data/types";
import { pick, type AppLocale } from "@/lib/format";
import { Avatar } from "./Avatar";
import { inScript } from "@/lib/translit";

const TYPES: MemberType[] = ["founder", "life", "general", "honorary"];

export function MembersGrid({ initial }: { initial: Member[] }) {
  const t = useTranslations("Members");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MemberType | "">("");
  const shown = useLiveQuery(
    (r) => r.members.listPublic({ search: search || undefined, memberType: type || undefined }),
    [search, type],
    ["members"],
    initial,
  );

  return (
    <>
      <div className="card-raised mb-(--space-lg) grid gap-(--space-md) p-(--space-md) sm:grid-cols-[2fr_1fr] lg:sticky lg:top-[5.5rem] lg:z-(--z-raised)" role="search">
        <div>
          <label htmlFor="msearch" className="field-label">{t("searchLabel")}</label>
          <input id="msearch" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="mtype" className="field-label">{t("type")}</label>
          <select id="mtype" value={type} onChange={(e) => setType(e.target.value as MemberType | "")} className="field">
            <option value="">{t("allTypes")}</option>
            {TYPES.map((x) => <option key={x} value={x}>{t(`types.${x}`)}</option>)}
          </select>
        </div>
      </div>
      <p className="mb-4 text-ink-soft" aria-live="polite">{tc("results", { count: shown.length })}</p>
      {shown.length === 0 ? (
        <p className="card p-(--space-xl) text-center text-lg text-ink-soft">{t("empty")}</p>
      ) : (
        <ul className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-3" data-testid="members">
          {shown.map((m) => {
            const name = inScript(pick(locale, m.nameHi || m.name, m.name), locale);
            return (
              <li key={m.id} className="card-raised flex gap-(--space-md) p-(--space-md)">
                <Avatar name={name} photo={m.photo} />
                <div className="min-w-0">
                  <p className="text-lg font-semibold break-words">{name}</p>
                  <p className="text-[0.95rem] text-ink-soft break-words">{tc("sonOf", { name: inScript(m.fatherName, locale) })}</p>
                  <p className="text-[0.95rem]">{tc("gotra")}: {inScript(m.gotra, locale)}</p>
                  <p className="text-[0.95rem]">{tc("village")}: {inScript(m.village, locale)}</p>
                  <p className="mt-(--space-2xs) inline-block rounded-(--radius-pill) border border-line bg-sand px-(--space-sm) text-[0.85rem] font-semibold text-maroon">{t(`types.${m.memberType}`)}</p>
                  {m.phone && (
                    <p className="mt-1">
                      <a href={`tel:${m.phone}`} className="inline-flex min-h-11 items-center text-maroon">{m.phone}</a>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
