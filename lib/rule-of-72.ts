/**
 * Rule of 72 — the arithmetic behind /cong-cu/quy-tac-72/.
 *
 * Pure module: no React, no I/O, no DOM. Every export is unit-tested in
 * `lib/rule-of-72.test.ts`, which also pins the reference value table from
 * the design spec.
 */

const LN2 = Math.log(2);

/**
 * Plain decimal numbers only. Anything else — exponent notation, stray
 * letters, a bare separator — is rejected. A single trailing separator is
 * allowed so results don't blank out mid-typing when the user hits "7,".
 */
const DECIMAL = /^-?(\d+[.]?\d*|[.]\d+)$/;

/** Parse the rate field. Accepts "7.5" and "7,5" (Vietnamese decimal comma). */
export function parseRate(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Rule-of-72 estimate: 72 / rate.
 *
 * Null when `rate` is not a doubling rate — at 0% the principal never doubles
 * (and 72/0 is Infinity), and at a negative rate it shrinks.
 *
 * @param rate Annual rate in percent — 6 means 6%/năm.
 */
export function rule72Years(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return 72 / rate;
}

/**
 * Exact solution of (1 + r)^t = 2, i.e. t = ln2 / ln(1 + r).
 *
 * @param rate Annual rate in percent — 6 means 6%/năm.
 */
export function exactYears(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return LN2 / Math.log(1 + rate / 100);
}

/**
 * 11.8957 -> "11,90".
 *
 * Hand-rolled rather than `Intl.NumberFormat("vi-VN", …)`: the input is
 * prefilled, so the server prerenders a result string the client must hydrate
 * to identically, and this removes any Node-ICU vs. browser-ICU mismatch.
 */
export function formatYears(value: number): string {
  return value.toFixed(2).replace(".", ",");
}
