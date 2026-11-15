import { ALL_PAIRS, type Pair } from "./data/seed/names";
import type { AppLocale } from "./format";

/**
 * Shows a person or place name in the page's own script, so a Hindi page is
 * all Devanagari and an English page all Latin, whatever script the donor
 * typed. Known words come from the name dictionary (exact, both ways); any
 * other word is transliterated by rule. The stored record is never changed.
 *
 * Production: store both spellings per record (see PLAN.md Suggestions); this
 * display-time conversion is the demo's stand-in.
 */

const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN = /[A-Za-z]/;

/** Honorifics and common name parts beyond the seed's name list. */
const EXTRA: Pair[] = [
  { en: "Late Sh.", hi: "स्व. श्री" }, { en: "Sh.", hi: "श्री" }, { en: "Smt.", hi: "श्रीमती" },
  { en: "Late", hi: "स्व." }, { en: "Shri", hi: "श्री" }, { en: "Singh", hi: "सिंह" },
  { en: "Kumar", hi: "कुमार" }, { en: "Devi", hi: "देवी" }, { en: "Ram", hi: "राम" },
  { en: "Chand", hi: "चंद" }, { en: "Prakash", hi: "प्रकाश" }, { en: "Kalan", hi: "कलां" },
  { en: "Khurd", hi: "खुर्द" }, { en: "New Delhi", hi: "नई दिल्ली" }, { en: "Delhi", hi: "दिल्ली" },
  { en: "Jat Bhawan Committee", hi: "जाट भवन समिति" }, { en: "Inauguration", hi: "उद्घाटन" },
];

// Whole pairs plus their single words, longest first so phrases win.
const PAIRS: Pair[] = (() => {
  const all = [...EXTRA, ...ALL_PAIRS];
  const seen = new Set<string>();
  const out: Pair[] = [];
  const add = (p: Pair) => {
    const k = p.en.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(p);
  };
  all.forEach(add);
  for (const p of all) {
    const en = p.en.split(" ");
    const hi = p.hi.split(" ");
    if (en.length > 1 && en.length === hi.length) en.forEach((w, i) => add({ en: w, hi: hi[i] }));
  }
  return out.sort((a, b) => b.en.length - a.en.length);
})();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fromDictionary(text: string, to: AppLocale): string {
  let s = text;
  for (const p of PAIRS) {
    if (to === "hi") {
      s = s.replace(new RegExp(`(^|[^A-Za-z])${escape(p.en)}(?![A-Za-z])`, "gi"), (_m, pre: string) => pre + p.hi);
    } else {
      s = s.replace(new RegExp(`(^|[\\s(,/])${escape(p.hi)}(?=$|[\\s),/])`, "g"), (_m, pre: string) => pre + p.en);
    }
  }
  return s;
}

/* ---------- Devanagari → Latin ---------- */

const CONS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n", च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "sh",
  ष: "sh", स: "s", ह: "h", ळ: "l",
};
const NUKTA_CONS: Record<string, string> = { क: "q", ख: "kh", ग: "gh", ज: "z", ड: "r", ढ: "rh", फ: "f" };
const VOWELS: Record<string, string> = {
  अ: "a", आ: "a", इ: "i", ई: "i", उ: "u", ऊ: "u", ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऑ: "o",
};
const MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};

type Syl = { c: string; v: string | null; inherent: boolean } | { lit: string };

function devaWordToLatin(word: string): string {
  // NFD splits precomposed nukta letters (ड़ → ड + ़).
  const w = word.normalize("NFD");
  const syl: Syl[] = [];
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    if (CONS[ch]) {
      let c = CONS[ch];
      if (w[i + 1] === "़") {
        c = NUKTA_CONS[ch] ?? c;
        i++;
      }
      const next = w[i + 1];
      if (next === "्") {
        syl.push({ c, v: "", inherent: false });
        i++;
      } else if (next && MATRAS[next] !== undefined) {
        syl.push({ c, v: MATRAS[next], inherent: false });
        i++;
      } else {
        syl.push({ c, v: "a", inherent: true });
      }
    } else if (VOWELS[ch]) {
      syl.push({ lit: VOWELS[ch] });
    } else if (ch === "ं" || ch === "ँ") {
      const nxt = w[i + 1] && CONS[w[i + 1]];
      syl.push({ lit: nxt && /^[pbm]/.test(nxt) ? "m" : "n" });
    } else if (ch === "ः") {
      syl.push({ lit: "h" });
    } else if (ch === "़" || ch === "्") {
      // stray mark: skip
    } else {
      syl.push({ lit: ch });
    }
  }
  // Schwa deletion: drop the final inherent vowel, then a medial one between
  // a voiced syllable and a consonant that keeps its vowel.
  const isCons = (s: Syl | undefined): s is { c: string; v: string | null; inherent: boolean } => !!s && "c" in s;
  const consIdx = syl.map((s, i) => (isCons(s) ? i : -1)).filter((i) => i >= 0);
  if (consIdx.length > 1) {
    const last = syl[consIdx[consIdx.length - 1]];
    if (isCons(last) && last.inherent && consIdx[consIdx.length - 1] === syl.length - 1) last.v = "";
  }
  for (let k = syl.length - 2; k >= 1; k--) {
    const s = syl[k];
    const prev = syl[k - 1];
    const next = syl[k + 1];
    if (!isCons(s) || !s.inherent || !isCons(next) || !next.v) continue;
    const prevVoiced = isCons(prev) ? !!prev.v : "lit" in prev && /[aeiou]$/.test(prev.lit);
    if (prevVoiced) s.v = "";
  }
  return syl.map((s) => ("lit" in s ? s.lit : s.c + (s.v ?? ""))).join("");
}

/* ---------- Latin → Devanagari ---------- */

const L_CONS: Array<[string, string]> = [
  ["chh", "छ"], ["kh", "ख"], ["gh", "घ"], ["ch", "च"], ["jh", "झ"], ["th", "थ"], ["dh", "ध"],
  ["ph", "फ"], ["bh", "भ"], ["sh", "श"], ["k", "क"], ["g", "ग"], ["c", "क"], ["j", "ज"],
  ["t", "त"], ["d", "द"], ["n", "न"], ["p", "प"], ["b", "ब"], ["m", "म"], ["y", "य"],
  ["r", "र"], ["l", "ल"], ["v", "व"], ["w", "व"], ["s", "स"], ["h", "ह"], ["f", "फ़"],
  ["z", "ज़"], ["q", "क"], ["x", "क्स"],
];
const L_VOWELS: Array<[string, string, string]> = [
  // latin, independent, matra
  ["aa", "आ", "ा"], ["ai", "ऐ", "ै"], ["au", "औ", "ौ"], ["ee", "ई", "ी"], ["oo", "ऊ", "ू"],
  ["a", "अ", ""], ["i", "इ", "ि"], ["u", "उ", "ु"], ["e", "ए", "े"], ["o", "ओ", "ो"],
];

function latinWordToDeva(word: string): string {
  const w = word.toLowerCase();
  let out = "";
  let afterCons = false;
  let i = 0;
  while (i < w.length) {
    const v = L_VOWELS.find(([l]) => w.startsWith(l, i));
    if (v) {
      const [l, ind, matra] = v;
      const atEnd = i + l.length === w.length;
      if (afterCons) out += l === "a" && atEnd && i > 1 ? "ा" : matra;
      else out += ind;
      afterCons = false;
      i += l.length;
      continue;
    }
    const c = L_CONS.find(([l]) => w.startsWith(l, i));
    if (c) {
      const [l, deva] = c;
      const rest = w.slice(i + l.length);
      // n or m after a vowel and before another consonant is a nasal mark.
      if ((l === "n" || l === "m") && !afterCons && out && rest && !/^[aeiouyh]/.test(rest)) {
        out += "ं";
        i += 1;
        continue;
      }
      if (afterCons) out += "्";
      out += deva;
      afterCons = true;
      i += l.length;
      continue;
    }
    out += w[i];
    afterCons = false;
    i++;
  }
  return out;
}

const cap = (s: string) => s.replace(/(^|[\s(/-])([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());

/** The name or place in the page's own script. */
export function inScript(text: string | null | undefined, locale: AppLocale): string {
  if (!text) return "";
  const wrong = locale === "hi" ? LATIN : DEVANAGARI;
  if (!wrong.test(text)) return text;
  const s = fromDictionary(text, locale);
  if (!wrong.test(s)) return s;
  return s
    .split(/(\s+|[(),/])/)
    .map((tok) => {
      if (!wrong.test(tok)) return tok;
      if (locale === "en") return cap(devaWordToLatin(tok.replace(/\.$/, "")) + (tok.endsWith(".") ? "." : ""));
      return tok.replace(/[A-Za-z]+/g, (m) => latinWordToDeva(m));
    })
    .join("");
}
