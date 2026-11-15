import { ALL_PAIRS } from "./data/seed/names";
import { inScript } from "./translit";

/**
 * Bilingual search: lowercases, normalises whitespace, and expands known
 * name/gotra/village words to their other script so "Dahiya" finds "दहिया".
 */

export function normalise(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Text to match a record against: the fields plus any known cross-script forms. */
export function searchHaystack(fields: Array<string | null | undefined>): string {
  // Each field in both scripts, as the pages display it, so a search finds what is shown.
  const present = fields.filter((f): f is string => !!f);
  const base = normalise([...present, ...present.map((f) => inScript(f, "hi")), ...present.map((f) => inScript(f, "en"))].join(" | "));
  const extra: string[] = [];
  for (const p of ALL_PAIRS) {
    const en = normalise(p.en);
    const hi = normalise(p.hi);
    if (base.includes(en)) extra.push(hi);
    else if (base.includes(hi)) extra.push(en);
  }
  return extra.length ? `${base} | ${extra.join(" | ")}` : base;
}

export function matchesSearch(query: string | undefined, fields: Array<string | null | undefined>): boolean {
  if (!query) return true;
  const q = normalise(query);
  if (!q) return true;
  return searchHaystack(fields).includes(q);
}
