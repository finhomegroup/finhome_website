/**
 * Vietnamese number parsing and formatting for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `number.test.ts`.
 *
 * Vietnamese convention is the inverse of English: "." groups thousands and
 * "," is the decimal mark. `500.000` is five hundred thousand, not five
 * hundred. That is why parsing a money field and parsing a rate field are two
 * separate functions rather than one with a flag — they have different
 * grammars, and conflating them is how 500.000 silently becomes 500.
 *
 * There are four input grammars, not two, and picking the wrong one is silent:
 * money -> `parseMoney`, a rate or plain decimal -> `parseDecimal`, a whole
 * count (năm, ngày, kỳ, tuổi) -> `parseCount`, a dimensionless magnitude
 * (m², km, g) -> `parseMagnitude`. The last two exist because neither of the
 * first two is correct for them: `parseMoney("3.0")` is 30 and
 * `parseDecimal("10.000")` is 10.
 *
 * Everything here is hand-rolled rather than `Intl.NumberFormat("vi-VN", …)`.
 * Calculator inputs are prefilled, so the server prerenders result strings the
 * client must hydrate to byte-identically; hand-rolling removes any
 * Node-ICU vs. browser-ICU divergence.
 */

/** Rendered in place of a number that does not exist or cannot be shown. */
export const PLACEHOLDER = "—";

/**
 * Above this magnitude `toFixed` drifts toward exponential notation (the
 * actual drift point is 1e21 — see `formatDecimal(1e21)` -> "1e+21"), and the
 * figure is meaningless in Vietnamese prose anyway. We show the placeholder
 * rather than emit "7.2e+302" into a sentence about đồng. 1e18 remains the
 * right ceiling for VND — Vietnam's GDP is on the order of 4.5e14 VND.
 */
const MAX_DISPLAY = 1e18;

/**
 * Non-finite and absurd magnitudes render as the placeholder, never as
 * "NaN", "Infinity", or scientific notation, in Vietnamese prose.
 */
function unrenderable(value: number): boolean {
  return !Number.isFinite(value) || Math.abs(value) >= MAX_DISPLAY;
}

/**
 * Plain decimal numbers only. Exponent notation, stray letters and a bare
 * separator are all rejected. A single trailing separator is allowed so
 * results don't blank out mid-typing when the user has entered "7,".
 */
const DECIMAL = /^-?(\d+[.]?\d*|[.]\d+)$/;

/** Digits with optional "." grouping and at most one "," decimal mark. */
const MONEY = /^-?[\d.]*,?\d*$/;

/** Digits only. A count has no decimal mark and no grouping: 30 năm, 91 ngày, tuổi 65. */
const COUNT = /^\d+$/;

/**
 * Strict Vietnamese thousands grouping: a dot followed by exactly three
 * digits, repeated, with at most one "," decimal part after it. "10.000",
 * "1.234.567" and "10.000,5" match; "1.5" and "10.00" do not.
 *
 * The leading group cannot start with a zero. No one writes five hundred as
 * "0.500", so a leading zero means the dot is a decimal point and the string
 * is an English-style decimal with trailing zeros — "0.500" is 0,5. Allowing
 * `\d{1,3}` there read every such value 1000x too large, silently and with no
 * invalid state, since parseMoney accepts it happily.
 */
const GROUPED = /^-?[1-9]\d{0,2}(\.\d{3})+(,\d*)?$/;

/** Parse a rate or plain decimal field. Accepts "7.5" and "7,5". */
export function parseDecimal(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parse a money field. "." is discarded as thousands grouping and "," is the
 * decimal mark, so "500.000.000" is 5e8 and "500,5" is 500.5.
 *
 * Grouping is not validated into strict triples — a user mid-entry has typed
 * "5000" long before they type "5.000".
 */
export function parseMoney(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "" || !MONEY.test(trimmed)) return null;
  const cleaned = trimmed.replace(/\./g, "").replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parse a whole-count field: a number of years, days, periods, or an age.
 *
 * The third grammar, and it exists because the other two are both wrong here.
 * `parseMoney` reads "3.0" as 30 — it discards "." as thousands grouping — so
 * an ordinary spreadsheet spelling of 3 silently became a 30-year forecast
 * that passed every `Number.isInteger` guard downstream, because the dot was
 * eaten before the guard ran. `parseDecimal` is no better: it reads "1.000"
 * as 1. A count has neither a decimal mark nor grouping in either grammar, so
 * anything but digits is rejected and the field's own "nhập một số nguyên"
 * error becomes reachable.
 *
 * No sign: every count field in the suite has a non-negative range, and
 * "-3 năm" is a rejection, not a negative count.
 */
export function parseCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!COUNT.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Parse a dimensionless magnitude — a length, an area, a weight.
 *
 * The case §4 of the suite doc does not cover, because a magnitude is neither
 * money nor a rate. `parseMoney` is wrong for it: these fields are routinely
 * used below 10, and it reads "1,5 chỉ" typed the English way as "1.5" -> 15,
 * i.e. 56,25 g of gold instead of 5,625 g. `parseDecimal` is wrong the other
 * way: it reads "10.000" — which is how this page's own option labels write
 * ten thousand, "Mẫu Bắc Bộ (3.600 m²)" — as 10, and reports 1 ha as
 * 0,002778 mẫu with no error shown.
 *
 * So the grammar decides rather than the semantic: a dot followed by exactly
 * three digits, repeated to the end of the string (optionally with a ","
 * decimal part), is thousands grouping; any other dot is a decimal point.
 * That is the only reading under which "10.000" and "1.5" are both what a
 * Vietnamese user meant, and "," stays the decimal mark either way.
 */
export function parseMagnitude(raw: string): number | null {
  const trimmed = raw.trim();
  return GROUPED.test(trimmed) ? parseMoney(trimmed) : parseDecimal(trimmed);
}

/**
 * True when a value has already rounded away to zero at the requested
 * precision. Both formatters take the sign from the ROUNDED value, not the
 * raw one, so a float residue like -4e-15 (or -0.4 at dp 0) never renders as
 * "-0". `finance.ts`'s `toEffective` at one period a year computes
 * (1 + r) ** 1 - 1, which is not bit-identical to r, and the difference is a
 * signed residue that reaches the formatters as a supposedly-zero gain.
 */
function roundsToZero(whole: string, fraction: string | undefined): boolean {
  return /^0+$/.test(whole) && (!fraction || /^0+$/.test(fraction));
}

/** 11.8957 -> "11,90". */
export function formatDecimal(value: number, dp = 2): string {
  if (unrenderable(value)) return PLACEHOLDER;
  const [whole, fraction] = Math.abs(value).toFixed(dp).split(".");
  // See `roundsToZero`: a negative that rounds to zero renders unsigned.
  const sign = value < 0 && !roundsToZero(whole, fraction) ? "-" : "";
  return `${sign}${whole}${fraction ? `,${fraction}` : ""}`;
}

/** 1440000 -> "1.440.000". `dp` defaults to 0: VND has no circulating subunit. */
export function formatMoney(value: number, dp = 0): string {
  if (unrenderable(value)) return PLACEHOLDER;
  const [whole, fraction] = Math.abs(value).toFixed(dp).split(".");
  // See `roundsToZero`: a negative that rounds to zero renders unsigned.
  const sign = value < 0 && !roundsToZero(whole, fraction) ? "-" : "";
  // Insert "." at every thousands boundary, right to left.
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped}${fraction ? `,${fraction}` : ""}`;
}

/** 12.6825 -> "12,68%". */
export function formatPercent(value: number, dp = 2): string {
  if (unrenderable(value)) return PLACEHOLDER;
  return `${formatDecimal(value, dp)}%`;
}
