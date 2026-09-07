/**
 * Side-by-side loan comparison for /cong-cu/so-sanh-khoan-vay/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `loan-compare.test.ts`.
 *
 * Each option is a plain amortizing loan, so the arithmetic delegates to
 * `computeLoan`. What this module adds is the comparison itself: the cost of
 * borrowing under each option, which option is cheapest, and by how much.
 *
 * Two decisions worth knowing about:
 *
 * 1. `rows` is POSITIONALLY ALIGNED with the options passed in, with `null` at
 *    any position that could not be computed. A comparison whose rows silently
 *    compacted would report "phương án B is cheapest" while pointing at the
 *    column the user typed into as C.
 *
 * 2. Options are ranked on the cost of BORROWING — interest plus the upfront
 *    fee — not on the monthly instalment and not on the total repaid. The
 *    instalment rewards a longer term, which is the opposite of cheaper, and
 *    the total repaid differs between options only by that same cost of
 *    borrowing, since the principal is shared. Vietnamese banks quote an
 *    arrangement fee as a percent of the amount drawn, and a lower headline
 *    rate paired with a higher fee is exactly the trade this tool exists to
 *    settle.
 */

import { computeLoan } from "@/lib/calc/loan";

export type LoanOption = {
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
  /** Upfront fee as a percent of the amount borrowed. */
  feePercent?: number;
};

export type LoanComparisonRow = {
  /** Position of this option in the input array. */
  index: number;
  /** Scheduled principal-and-interest instalment, per month. */
  monthlyPayment: number;
  /** Interest alone, across the whole term. */
  totalInterest: number;
  /** The arrangement fee in đồng, paid at drawdown. */
  upfrontFee: number;
  /** Interest plus fee: what borrowing under this option costs. */
  costOfBorrowing: number;
  /** Principal + interest + fee — everything that leaves the borrower. */
  totalOutlay: number;
  /** Months the schedule runs. */
  months: number;
  /** How much dearer than the cheapest option. Exactly 0 on the winner. */
  extraVsBest: number;
};

export type LoanComparison = {
  /** The shared principal every option is quoted against. */
  amount: number;
  /** Aligned with the input options; `null` where an option was unusable. */
  rows: (LoanComparisonRow | null)[];
  /** Index into `rows` of the cheapest option by `costOfBorrowing`. */
  bestIndex: number;
  /** Cost of borrowing under the dearest option less the cheapest. */
  spread: number;
};

/** One option's figures, before the cross-option comparison. */
function priceOption(
  amount: number,
  option: LoanOption,
  index: number,
): LoanComparisonRow | null {
  const { annualRatePercent, termMonths, feePercent = 0 } = option;

  const numbers = [annualRatePercent, termMonths, feePercent];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;

  const loan = computeLoan({ amount, annualRatePercent, termMonths });
  if (loan === null) return null;

  const upfrontFee = (feePercent / 100) * amount;
  const costOfBorrowing = loan.totalInterest + upfrontFee;

  return {
    index,
    monthlyPayment: loan.monthlyPrincipalInterest,
    totalInterest: loan.totalInterest,
    upfrontFee,
    costOfBorrowing,
    totalOutlay: loan.totalPrincipalInterest + upfrontFee,
    months: loan.months,
    // Filled in once every option has been priced.
    extraVsBest: 0,
  };
}

/**
 * Compare loan options quoted against the same principal.
 *
 * Null when there is nothing to compare: a non-positive or non-finite amount,
 * or fewer than two options that could be computed. A single option is a loan
 * calculation, not a comparison — /cong-cu/vay-mua-nha/ is the tool for that.
 *
 * Ties are resolved toward the FIRST option. It is the one the borrower listed
 * first, and declaring a later identical option the winner would suggest a
 * difference that does not exist.
 */
export function compareLoans(input: {
  amount: number;
  options: readonly LoanOption[];
}): LoanComparison | null {
  const { amount, options } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const rows = options.map((option, index) =>
    priceOption(amount, option, index),
  );
  const priced = rows.filter((row): row is LoanComparisonRow => row !== null);
  if (priced.length < 2) return null;

  let best = priced[0];
  let dearest = priced[0];
  for (const row of priced) {
    // Strict `<`, so a tie leaves the earlier option as the winner.
    if (row.costOfBorrowing < best.costOfBorrowing) best = row;
    if (row.costOfBorrowing > dearest.costOfBorrowing) dearest = row;
  }

  for (const row of priced) {
    row.extraVsBest = row.costOfBorrowing - best.costOfBorrowing;
  }

  return {
    amount,
    rows,
    bestIndex: best.index,
    spread: dearest.costOfBorrowing - best.costOfBorrowing,
  };
}
