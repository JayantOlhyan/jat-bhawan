import { fyLabel } from "./fy";

/**
 * Receipt numbers: `{prefix}/{FY}/{0001}`, sequential per FY with no gaps.
 * A number is allocated only when a donation becomes verified, so failed or
 * pending attempts never consume one. Voided receipts keep their number.
 */

export function formatReceiptNo(prefix: string, fy: string, seq: number): string {
  if (!Number.isInteger(seq) || seq < 1) throw new Error("Receipt sequence must start at 1");
  return `${prefix}/${fy}/${String(seq).padStart(4, "0")}`;
}

export function parseReceiptNo(no: string): { prefix: string; fy: string; seq: number } | null {
  const m = /^([A-Z0-9]+)\/(\d{4}-\d{2})\/(\d{4,})$/.exec(no);
  if (!m) return null;
  return { prefix: m[1], fy: m[2], seq: Number(m[3]) };
}

/** Next receipt number for `at`, given every receipt number already issued. */
export function nextReceiptNo(prefix: string, at: Date, issued: readonly string[]): string {
  const fy = fyLabel(at);
  let max = 0;
  for (const no of issued) {
    const p = parseReceiptNo(no);
    if (p && p.prefix === prefix && p.fy === fy && p.seq > max) max = p.seq;
  }
  return formatReceiptNo(prefix, fy, max + 1);
}

/** True when the receipt numbers of one prefix+FY form 1..n with no gaps or duplicates. */
export function isGapFree(prefix: string, fy: string, issued: readonly string[]): boolean {
  const seqs = issued
    .map(parseReceiptNo)
    .filter((p): p is NonNullable<typeof p> => !!p && p.prefix === prefix && p.fy === fy)
    .map((p) => p.seq)
    .sort((a, b) => a - b);
  return seqs.every((s, i) => s === i + 1);
}
