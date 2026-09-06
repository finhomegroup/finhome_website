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

/** 11.8957 -> "11,90". */
export function formatDecimal(value: number, dp = 2): string {
  if (unrenderable(value)) return PLACEHOLDER;
  return value.toFixed(dp).replace(".", ",");
}

/** 1440000 -> "1.440.000". `dp` defaults to 0: VND has no circulating subunit. */
export function formatMoney(value: number, dp = 0): string {
  if (unrenderable(value)) return PLACEHOLDER;
  const [whole, fraction] = Math.abs(value).toFixed(dp).split(".");
  // Determine the sign from the ROUNDED value, not the raw one, so a float
  // residue like -0.4 (which rounds to 0) never renders as "-0".
  const roundedIsZero = /^0+$/.test(whole) && (!fraction || /^0+$/.test(fraction));
  const sign = value < 0 && !roundedIsZero ? "-" : "";
  // Insert "." at every thousands boundary, right to left.
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped}${fraction ? `,${fraction}` : ""}`;
}

/** 12.6825 -> "12,68%". */
export function formatPercent(value: number, dp = 2): string {
  if (unrenderable(value)) return PLACEHOLDER;
  return `${formatDecimal(value, dp)}%`;
}
