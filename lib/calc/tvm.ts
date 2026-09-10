/**
 * The time-value-of-money solver, for /cong-cu/gia-tri-tien-te-theo-thoi-gian/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `tvm.test.ts`.
 *
 * Five quantities — present value, future value, payment, number of periods,
 * rate per period — tied by one equation. Give four and this solves the
 * fifth. It is the financial-calculator keyboard, and every other loan or
 * savings tool in this suite is a special case of it with friendlier labels.
 *
 * SIGN CONVENTION. This is the one module in the suite that exposes
 * `finance.ts`'s Excel/HP-12C convention directly instead of hiding it:
 * money you pay out is NEGATIVE, money you receive is POSITIVE. It has to,
 * because a general solver cannot know which side of the transaction the user
 * is on. A borrower receives the principal (`presentValue` positive) and pays
 * instalments (`payment` negative); a saver pays contributions in (negative)
 * and receives a balance at the end (positive). Getting this wrong is the
 * single most common way to misuse a TVM calculator, so the page leads with
 * it and the module refuses the cases where the signs cannot describe a
 * transaction at all.
 *
 * `ratePercentPerPeriod` is PER PERIOD, not per year — as in `finance.ts`.
 * Monthly periods with a 12%/năm nominal rate means 1, not 12.
 *
 * The rate is the only one of the five with no closed form, and it is solved
 * with `solveRate`, which returns null rather than a guess when the cash
 * flows do not bracket a rate.
 */

import { fv, nper, pmt, pv, solveRate } from "@/lib/calc/finance";

export type TvmSolveFor =
  | "presentValue"
  | "futureValue"
  | "payment"
  | "periods"
  | "rate";

export type TvmInput = {
  /** Which of the five to solve for. The other four are required. */
  solveFor: TvmSolveFor;
  /** Value today. Positive when received. */
  presentValue?: number;
  /** Value at the end. Positive when received. */
  futureValue?: number;
  /** Cash flow each period. Negative when paid out. */
  payment?: number;
  /** Number of periods. */
  periods?: number;
  /** Rate PER PERIOD, in percent. */
  ratePercentPerPeriod?: number;
  /** True for payments at the START of each period (annuity due). */
  paymentAtBeginning?: boolean;
};

export type TvmResult = {
  /** Echoed back which one was solved. */
  solvedFor: TvmSolveFor;
  /** All five, with the solved one filled in. */
  presentValue: number;
  futureValue: number;
  payment: number;
  periods: number;
  ratePercentPerPeriod: number;
  paymentAtBeginning: boolean;
  /** `payment × periods` — every instalment added up, sign preserved. */
  totalPayments: number;
  /**
   * `presentValue + payment × periods + futureValue`.
   *
   * Under the sign convention this is interest EARNED when positive and
   * interest PAID when negative, which is the same statement either way:
   * what the transaction produced beyond the cash that moved.
   */
  netInterest: number;
  /** The rate restated as a nominal annual figure, for monthly periods. */
  annualRateIfMonthlyPercent: number;
};

/**
 * Solve a time-value-of-money problem for its missing quantity.
 *
 * Null when the inputs cannot describe one:
 *
 * - any of the four required values missing or non-finite;
 * - a non-positive number of periods, when periods is an input;
 * - a rate at or below −100% per period, where the growth term collapses;
 * - a solved result that is not finite, or a solved period count that is not
 *   positive — which is what "these cash flows never get there" looks like;
 * - a rate the solver cannot bracket.
 *
 * `periods` is deliberately NOT required to be a whole number: a fractional
 * answer is the honest one when solving for it, and the page rounds up for
 * display rather than the module rounding down and claiming the goal is met
 * a period early.
 */
export function solveTvm(input: TvmInput): TvmResult | null {
  const {
    solveFor,
    presentValue,
    futureValue,
    payment,
    periods,
    ratePercentPerPeriod,
    paymentAtBeginning = false,
  } = input;

  const type: 0 | 1 = paymentAtBeginning ? 1 : 0;

  /** Every input except the one being solved must be present and finite. */
  const need = (value: number | undefined): number | null =>
    value === undefined || !Number.isFinite(value) ? null : value;

  // Rates at or below −100% per period collapse `(1 + rate) ** periods`.
  const rateGiven =
    solveFor === "rate" ? 0 : (need(ratePercentPerPeriod) ?? Number.NaN);
  if (solveFor !== "rate") {
    if (!Number.isFinite(rateGiven) || rateGiven <= -100) return null;
  }
  const rate = rateGiven / 100;

  const periodsGiven =
    solveFor === "periods" ? 0 : (need(periods) ?? Number.NaN);
  if (solveFor !== "periods") {
    if (!Number.isFinite(periodsGiven) || periodsGiven <= 0) return null;
  }

  const pvGiven =
    solveFor === "presentValue" ? 0 : (need(presentValue) ?? Number.NaN);
  const fvGiven =
    solveFor === "futureValue" ? 0 : (need(futureValue) ?? Number.NaN);
  const pmtGiven = solveFor === "payment" ? 0 : (need(payment) ?? Number.NaN);

  for (const [target, value] of [
    ["presentValue", pvGiven],
    ["futureValue", fvGiven],
    ["payment", pmtGiven],
  ] as const) {
    if (solveFor !== target && !Number.isFinite(value)) return null;
  }

  let solvedPv = pvGiven;
  let solvedFv = fvGiven;
  let solvedPmt = pmtGiven;
  let solvedPeriods = periodsGiven;
  let solvedRate = rate;

  switch (solveFor) {
    case "presentValue":
      solvedPv = pv(rate, periodsGiven, pmtGiven, fvGiven, type);
      break;
    case "futureValue":
      solvedFv = fv(rate, periodsGiven, pmtGiven, pvGiven, type);
      break;
    case "payment":
      solvedPmt = pmt(rate, periodsGiven, pvGiven, fvGiven, type);
      break;
    case "periods":
      solvedPeriods = nper(rate, pmtGiven, pvGiven, fvGiven, type);
      // A non-positive or non-finite answer means the cash flows never
      // reach the target, not that the answer is zero.
      if (!Number.isFinite(solvedPeriods) || solvedPeriods <= 0) return null;
      break;
    case "rate": {
      const solved = solveRate(periodsGiven, pmtGiven, pvGiven, fvGiven, type);
      if (solved === null) return null;
      solvedRate = solved;
      break;
    }
  }

  const values = [solvedPv, solvedFv, solvedPmt, solvedPeriods, solvedRate];
  if (values.some((value) => !Number.isFinite(value))) return null;

  const totalPayments = solvedPmt * solvedPeriods;

  return {
    solvedFor: solveFor,
    presentValue: solvedPv,
    futureValue: solvedFv,
    payment: solvedPmt,
    periods: solvedPeriods,
    ratePercentPerPeriod: solvedRate * 100,
    paymentAtBeginning,
    totalPayments,
    netInterest: solvedPv + totalPayments + solvedFv,
    annualRateIfMonthlyPercent: solvedRate * 12 * 100,
  };
}
