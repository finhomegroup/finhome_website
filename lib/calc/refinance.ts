/**
 * Refinancing comparison for /cong-cu/tai-cap-von/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `refinance.test.ts`.
 *
 * The question is never "is the new rate lower" — it almost always is, or
 * nobody would be asking. It is whether the saving outlives the cost of
 * getting it, and whether the saving is real at all once the term is reset.
 *
 * Two figures do the work, and they can disagree:
 *
 * - `breakEvenMonths` — the first month at which the payments avoided have
 *   covered the closing costs. Solved month by month, not as
 *   `closingCosts ÷ monthlySaving`, because the saving is NOT a constant when
 *   the two terms differ: once the shorter loan is repaid the saving jumps to
 *   the whole of the other loan's instalment. The division assumed a constant
 *   saving forever and returned figures past the end of the loan — 704 months
 *   on a loan that is fully repaid at month 180. Short is good, and it is the
 *   figure to use if you might sell or repay early.
 * - `lifetimeSaving` — total interest avoided, less the costs, over the whole
 *   of both loans. This one can be NEGATIVE while the monthly payment falls,
 *   which is the trap: refinancing 18 remaining years into a fresh 20-year
 *   term lowers the instalment and costs more interest overall. The page has
 *   to show both, and the copy has to say which to trust when.
 *
 * `remainingMonths` on the current loan is an input rather than something
 * derived from an original term, because that is what a borrower can read off
 * a statement. Nothing here needs `Date`.
 */

import { computeLoan } from "@/lib/calc/loan";

export type RefinanceInput = {
  /** Outstanding balance on the current loan, in đồng. */
  balance: number;
  /** Current nominal annual rate in percent. */
  currentRatePercent: number;
  /** Months still to run on the current loan. */
  remainingMonths: number;
  /** Nominal annual rate on offer, in percent. */
  newRatePercent: number;
  /** Term of the new loan, in months. */
  newTermMonths: number;
  /** Fees to switch: appraisal, notary, registration, early-repayment penalty. */
  closingCosts?: number;
};

export type RefinanceResult = {
  /** Instalment on the current loan for its remaining term. */
  currentPayment: number;
  /** Instalment on the new loan. */
  newPayment: number;
  /** `currentPayment − newPayment`. Negative when the new loan costs more monthly. */
  monthlySaving: number;
  /** Interest still to pay on the current loan. */
  currentRemainingInterest: number;
  /** Interest on the new loan over its whole term. */
  newTotalInterest: number;
  /** Interest avoided, before costs. Negative when the new loan costs more. */
  interestSaving: number;
  /** `interestSaving − closingCosts`: the honest bottom line. */
  lifetimeSaving: number;
  /** Fees, echoed back. */
  closingCosts: number;
  /**
   * First completed month at which the payments avoided have covered the
   * closing costs, solved month by month. Rounded UP to that completed month:
   * if the costs are covered part-way through month 9 the answer is 9, because
   * you are only ahead once the month has been paid.
   *
   * Null in TWO situations, which the page has to tell apart: the monthly
   * instalment does not fall, so there is nothing to break even on; or it does
   * fall but the payments avoided never cover the costs over the whole of
   * either loan.
   */
  breakEvenMonths: number | null;
  /** True when the new term runs past the old one. */
  termExtended: boolean;
  /** True when the new term ends BEFORE the old one would have. */
  termShortened: boolean;
  /** How many months longer, or shorter, the new loan runs. */
  termChangeMonths: number;
};

/**
 * Half a đồng. The running total below adds up to 360 float instalments, and
 * that accumulation drifts from the exact product by up to 1,1e-5 ₫ (measured
 * over rates 8,5–10,9% and terms 120–360), so testing it against a bare `0`
 * could push the answer a month either way on a knife-edge case. Half a đồng
 * is far above that error and far below the smallest unit anyone quotes, so it
 * cannot move the reported month. Named, per docs §4, because this is a
 * threshold comparison against a computed float.
 */
const BREAK_EVEN_BAND_DONG = 0.5;

/**
 * First month at which the payments avoided have covered the closing costs.
 *
 * Month by month, because the saving is NOT constant when the two terms
 * differ. From month `newTermMonths + 1` the new loan is gone and the WHOLE
 * old instalment counts as saving; from month `remainingMonths + 1` the old
 * loan is gone and the new instalment counts AGAINST you, so the running total
 * can peak and then fall (the 300-month trap peaks at +811.825.093 ₫ in month
 * 216 and ends at −202.761.032 ₫). That is why the answer is the FIRST
 * crossing and not the last.
 *
 * Level instalments are used rather than the two amortisation schedules:
 * `computeLoan`'s rows are constant to within 4e-5 ₫ — only the final row is
 * nudged to zero the balance — which is inside the band above.
 *
 * Null when the monthly instalment does not fall (nothing to break even on),
 * and null when the payments avoided never cover the costs at all.
 */
function breakEvenMonth(
  currentPayment: number,
  remainingMonths: number,
  newPayment: number,
  newTermMonths: number,
  closingCosts: number,
): number | null {
  if (!(currentPayment - newPayment > 0)) return null;

  let cumulative = -closingCosts;
  // Zero fees are covered before the first month, not during it.
  if (cumulative >= -BREAK_EVEN_BAND_DONG) return 0;

  const horizon = Math.max(remainingMonths, newTermMonths);
  for (let month = 1; month <= horizon; month += 1) {
    cumulative +=
      (month <= remainingMonths ? currentPayment : 0) -
      (month <= newTermMonths ? newPayment : 0);
    if (cumulative >= -BREAK_EVEN_BAND_DONG) return month;
  }
  return null;
}

/**
 * Compare a current loan against a refinancing offer.
 *
 * Null when either side cannot describe a loan — a non-positive balance or
 * term, a negative rate or cost, a non-integer number of months, or any
 * non-finite number.
 */
export function compareRefinance(
  input: RefinanceInput,
): RefinanceResult | null {
  const {
    balance,
    currentRatePercent,
    remainingMonths,
    newRatePercent,
    newTermMonths,
    closingCosts = 0,
  } = input;

  if (!Number.isFinite(closingCosts) || closingCosts < 0) return null;

  // The current loan is modelled as a fresh loan of the outstanding balance
  // over the remaining months, which is exactly what it is from here on.
  const current = computeLoan({
    amount: balance,
    annualRatePercent: currentRatePercent,
    termMonths: remainingMonths,
  });
  if (current === null) return null;

  const next = computeLoan({
    amount: balance,
    annualRatePercent: newRatePercent,
    termMonths: newTermMonths,
  });
  if (next === null) return null;

  const monthlySaving =
    current.monthlyPrincipalInterest - next.monthlyPrincipalInterest;
  const interestSaving = current.totalInterest - next.totalInterest;

  return {
    currentPayment: current.monthlyPrincipalInterest,
    newPayment: next.monthlyPrincipalInterest,
    monthlySaving,
    currentRemainingInterest: current.totalInterest,
    newTotalInterest: next.totalInterest,
    interestSaving,
    lifetimeSaving: interestSaving - closingCosts,
    closingCosts,
    breakEvenMonths: breakEvenMonth(
      current.monthlyPrincipalInterest,
      remainingMonths,
      next.monthlyPrincipalInterest,
      newTermMonths,
      closingCosts,
    ),
    termExtended: newTermMonths > remainingMonths,
    termShortened: newTermMonths < remainingMonths,
    termChangeMonths: newTermMonths - remainingMonths,
  };
}
