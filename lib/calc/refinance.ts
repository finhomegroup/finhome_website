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
 * - `breakEvenMonths` — how long the monthly saving takes to repay the
 *   closing costs. Short is good, and it is the figure to use if you might
 *   sell or repay early.
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
   * Months for the monthly saving to repay the closing costs. Null when the
   * monthly payment does not fall, so there is nothing to break even on.
   * Rounded UP: month 8,2 means you are only ahead from month 9.
   */
  breakEvenMonths: number | null;
  /** True when the new term runs past the old one. */
  termExtended: boolean;
  /** How many months longer, or shorter, the new loan runs. */
  termChangeMonths: number;
};

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
    // Rounded up, because you are not ahead until the month completes.
    breakEvenMonths:
      monthlySaving > 0 ? Math.ceil(closingCosts / monthlySaving) : null,
    termExtended: newTermMonths > remainingMonths,
    termChangeMonths: newTermMonths - remainingMonths,
  };
}
