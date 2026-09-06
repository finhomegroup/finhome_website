/**
 * Rule of 72 — the arithmetic behind /cong-cu/quy-tac-72/.
 *
 * Pure module: no React, no I/O, no DOM. Every export is unit-tested in
 * `lib/rule-of-72.test.ts`, which also pins the reference value table from
 * the design spec.
 */

const LN2 = Math.log(2);

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
  const years = LN2 / Math.log(1 + rate / 100);
  // A rate small enough that log1p underflows to 0 gives Infinity, which the
  // signature does not permit.
  return Number.isFinite(years) ? years : null;
}
