/**
 * Searching the tool catalogue, for the /cong-cu/ hub.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `tool-search.test.ts`.
 *
 * This lives in `lib/` rather than inside the hub's client component for one
 * reason: the vitest glob is `{lib,content,components}/**‌/*.test.ts` — `.ts`,
 * not `.tsx` — and there is no jsdom in this environment, so logic left in a
 * `.tsx` component cannot be tested at all. docs §6 records that three of the
 * suite's five worst defects were invisible to a green test run precisely
 * because they lived in a component. The filter is the hub's only real logic,
 * so it belongs here where it can be asserted.
 *
 * DIACRITIC FOLDING. A buyer types "kha nang mua nha" on a keyboard with no
 * Vietnamese input method, or "lai suat" from a phone in a hurry. Matching
 * only the accented spelling makes a 75-tool catalogue unsearchable for them,
 * so both the haystack and the needle are folded to unaccented lower case
 * before comparison.
 *
 * `normalize("NFD")` is used for that, and it is NOT the `Intl` /
 * `toLocaleString` ban in docs §4. That ban exists because number FORMATTING
 * differs between Node's ICU build and a browser's, and calculator results are
 * prerendered on the server and must hydrate byte-identically. Unicode
 * normalization is locale-independent and fixed by the Unicode standard, and
 * nothing here is rendered: the hub prerenders with an empty query, which
 * returns the input list unchanged, so the server never computes a folded
 * string at all.
 *
 * `đ`/`Đ` are handled separately because they are not a base letter plus a
 * combining mark — NFD leaves them untouched, so "doi don vi" would never
 * match "Đổi đơn vị" without this.
 */

/** A catalogue entry as far as search is concerned. */
export type SearchableTool = {
  slug: string;
  title: string;
  /** One line from the registry. */
  summary: string;
  /** The buyer's question from the plan disposition. */
  question: string;
  /** e.g. "Vay & Thế chấp" — people search by section name too. */
  categoryLabel: string;
  /** e.g. "Thư viện Hoa Kỳ", when the tool is shelved. */
  libraryLabel?: string;
};

/**
 * Lower-case and strip Vietnamese diacritics.
 *
 * "Khả năng mua nhà" -> "kha nang mua nha"; "Đổi đơn vị" -> "doi don vi".
 */
export function foldVietnamese(raw: string): string {
  return raw
    .normalize("NFD")
    // Combining diacritical marks: U+0300–U+036F covers every tone mark and
    // the breve/circumflex/horn Vietnamese adds to its vowels.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** Everything about one tool that a query may match. */
function haystack(tool: SearchableTool): string {
  return foldVietnamese(
    [
      tool.title,
      tool.summary,
      tool.question,
      tool.categoryLabel,
      tool.libraryLabel ?? "",
      // The slug matters: it is what a returning visitor remembers from the
      // URL bar, and it is already unaccented.
      tool.slug.replace(/-/g, " "),
    ].join(" "),
  );
}

/** The query, split into the tokens that must ALL be found. */
export function queryTokens(query: string): string[] {
  return foldVietnamese(query).split(/\s+/).filter((t) => t.length > 0);
}

/**
 * A token must start where a WORD starts — not just appear somewhere.
 *
 * THIS REPLACED A PLAIN `text.includes(token)`, and the reason is a defect
 * found by driving the hub in a browser on 2026-09-16. Searching `het uu dai`
 * — the unaccented spelling of "hết ưu đãi", the end of a promotional rate —
 * returned THREE tools: the floating-rate loan, which is right, plus two
 * retirement tools, which is nonsense. The cause is the interaction of the two
 * features above. Folding strips diacritics, so "hưu trí" becomes "huu tri",
 * and `"huu tri".includes("uu")` is true. The token `uu` was reaching inside
 * the word `huu`, and `dai` likewise reached inside `dài`.
 *
 * So every short token silently matched every longer word that happened to
 * contain those letters, and the more the reader folded away, the worse it got.
 *
 * WORD-START, NOT WHOLE-WORD, and the difference is load-bearing. Whole-word
 * matching would break typing: `l`, `la`, `lai` must each still find "lãi
 * suất" while the reader is mid-word, and `tool-search.test.ts` asserts that
 * every prefix of a query returns a superset of the longer query's results.
 * A prefix anchored at a word start preserves that — if a token matches at
 * position p, so does every prefix of it — while `uu` no longer matches `huu`,
 * because `h` is there first.
 *
 * `[^a-z0-9]` as the boundary rather than `\b`: the haystack is already folded
 * to unaccented lower case, and it has to treat `(`, `-`, `/` and `,` as
 * separators so that `(apr)` in a title and a hyphenated slug both still match.
 */
function tokenMatcher(token: string): RegExp {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}`);
}

/**
 * Does this tool match the query?
 *
 * Every token must begin at a word start somewhere in the tool's searchable
 * text, in any order and not necessarily in the same field. "vay nha"
 * therefore finds "Tính khoản vay mua nhà", and an empty query matches
 * everything.
 *
 * Tokens are ANDed rather than ORed deliberately: with 75 tools, an OR over
 * "vay" and "nha" returns most of the catalogue and the search stops being
 * useful exactly when the user gets more specific.
 */
export function matchesQuery(tool: SearchableTool, query: string): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;
  const text = haystack(tool);
  return tokens.map(tokenMatcher).every((matcher) => matcher.test(text));
}

/**
 * Filter the catalogue, preserving the input order.
 *
 * An empty or whitespace-only query returns the tools unchanged — the same
 * array contents in the same order, which is what the hub prerenders before
 * hydration.
 */
export function filterTools<T extends SearchableTool>(
  tools: readonly T[],
  query: string,
): T[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [...tools];
  // The matchers are built ONCE here rather than per tool. Going through
  // `matchesQuery` would recompile the same regexes 75 times on every
  // keystroke, and this runs in a client island on each `onChange`.
  const matchers = tokens.map(tokenMatcher);
  return tools.filter((tool) => {
    const text = haystack(tool);
    return matchers.every((matcher) => matcher.test(text));
  });
}
