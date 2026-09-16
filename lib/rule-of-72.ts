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

/**
 * The inverse direction: what rate doubles the principal in `years`?
 *
 * Rule-of-72 estimate, 72 / years. Null when `years` cannot describe a
 * doubling period.
 *
 * @param years Number of years, e.g. 10.
 * @returns Annual rate in percent — 7.2 means 7,2%/năm.
 */
export function rule72Rate(years: number): number | null {
  if (!Number.isFinite(years) || years <= 0) return null;
  return 72 / years;
}

/**
 * Exact inverse of `exactYears`: solving (1 + r)^t = 2 for r gives
 * r = 2^(1/t) - 1.
 *
 * @param years Number of years, e.g. 10.
 * @returns Annual rate in percent — 7.18 means 7,18%/năm.
 */
export function exactRate(years: number): number | null {
  if (!Number.isFinite(years) || years <= 0) return null;
  const rate = (2 ** (1 / years) - 1) * 100;
  // A term long enough that 2^(1/t) rounds to exactly 1 yields 0, which is not
  // a doubling rate; anything non-finite is likewise not a usable answer.
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/**
 * How far the mental estimate is from the exact answer, in MONTHS.
 *
 * Original row 17's lesson is "quy tắc nhẩm có sai số", and the honest way to
 * teach it is to quantify it at the reader's own rate rather than assert a
 * band. Positive means the estimate is LONGER than the truth — the rule is
 * pessimistic — and negative means it is optimistic.
 *
 * Months, not years: at 8%/năm the gap is 0,0065 năm, which rounds to "0,0
 * năm" and teaches nothing. In months it is −0,08, and the reader can see it
 * grow to more than a year once the rate leaves the 6–10% band.
 *
 * Null whenever either figure is null, i.e. at a non-positive rate.
 */
export function estimateErrorMonths(rate: number): number | null {
  const estimate = rule72Years(rate);
  const exact = exactYears(rate);
  if (estimate === null || exact === null) return null;
  const months = (estimate - exact) * 12;
  return Number.isFinite(months) ? months : null;
}

/** One rung of the doubling timeline: a multiple of the starting sum. */
export type GrowthMilestone = {
  /** 2, 4, 8 — each one a further doubling. */
  multiple: number;
  /** How many doublings that is: 1, 2, 3. */
  doublings: number;
  /** EXACT years to reach it, from the compound formula. */
  years: number;
};

/**
 * The default rungs: doubling, quadrupling, and eight times the starting sum.
 *
 * Three is enough to make the shape visible and short enough to read as a
 * line. Every rung is a power of two, which is the only reason this can be
 * "n doublings" rather than a second calculation.
 */
export const DEFAULT_GROWTH_MULTIPLES = [2, 4, 8] as const;

/**
 * The small timeline original row 17 asks for, instead of a chart.
 *
 * Reaching 2^k times the starting sum takes exactly k doubling periods,
 * because the growth is multiplicative — so this is `exactYears` times the
 * number of doublings and NOT a second model. Using the exact figure rather
 * than the 72 estimate is deliberate: multiplying an approximation by three
 * multiplies its error by three too, and the page is about that error.
 *
 * Null at a rate that does not double the money. An empty array is never
 * returned in place of null: "no answer" and "no milestones" are different.
 */
export function doublingMilestones(
  rate: number,
  multiples: readonly number[] = DEFAULT_GROWTH_MULTIPLES,
): GrowthMilestone[] | null {
  const single = exactYears(rate);
  if (single === null) return null;

  const rungs: GrowthMilestone[] = [];
  for (const multiple of multiples) {
    if (!Number.isFinite(multiple) || multiple <= 1) return null;
    const doublings = Math.log2(multiple);
    // Only powers of two are expressible as whole doublings. Anything else
    // would need its own log and would not be "k lần nhân đôi".
    if (!Number.isInteger(doublings)) return null;
    const years = single * doublings;
    if (!Number.isFinite(years)) return null;
    rungs.push({ multiple, doublings, years });
  }
  return rungs;
}
