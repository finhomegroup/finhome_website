/**
 * Commercial loans with a grace period or a balloon, for
 * /cong-cu/vay-thuong-mai/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `commercial-loan.test.ts`.
 *
 * Business lending differs from a household mortgage in two structural ways,
 * and both make the repayment profile uneven rather than flat:
 *
 * - **A grace period** (kỳ ân hạn gốc): for the first stretch the borrower
 *   pays interest only. The balance does not move, so the interest payment
 *   does not move either — and when the grace ends the amortizing payment
 *   has to clear the whole principal over a SHORTER remaining term.
 * - **A balloon** (trả gốc cuối kỳ): a share of the principal is not
 *   amortized at all and falls due in one lump at maturity. The instalments
 *   are smaller and the borrower needs a plan for the lump.
 *
 * Both make the loan cheaper per month and dearer in total, and both shift
 * risk to a single future date. The module therefore reports the three
 * payments a borrower will actually face — grace, amortizing, and the
 * balloon — rather than a single "monthly payment" that is true for neither
 * stretch.
 *
 * The balloon is handled by `pmt`'s future-value argument, not by amortizing
 * a smaller principal: interest accrues on the WHOLE balance including the
 * balloon portion for the entire term, which is the point of the structure
 * and the reason it costs more.
 */

import { amortize, pmt, type ScheduleRow } from "@/lib/calc/finance";

export type CommercialLoanInput = {
  /** Principal drawn, in đồng. */
  amount: number;
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Total term in months, grace period included. */
  termMonths: number;
  /** Months of interest-only payments at the start. */
  graceMonths?: number;
  /** Share of the principal falling due in one lump at maturity, in percent. */
  balloonPercent?: number;
};

export type CommercialLoanResult = {
  /** Interest-only payment during the grace period. 0 when there is none. */
  gracePayment: number;
  /** Months of grace, echoed back. */
  graceMonths: number;
  /** The amortizing instalment once the grace period ends. */
  amortizingPayment: number;
  /** Months the amortizing instalment runs for. */
  amortizingMonths: number;
  /** The lump due at maturity. 0 when there is no balloon. */
  balloonAmount: number;
  /** Interest paid during the grace period. */
  graceInterest: number;
  /** Interest paid after it. */
  amortizingInterest: number;
  /** Interest across the whole term. */
  totalInterest: number;
  /** Every payment plus the balloon: everything that leaves the borrower. */
  totalPaid: number;
  /** Interest as a percent of the amount drawn. */
  interestToPrincipalPercent: number;
  /**
   * Interest a plain amortizing loan of the same size, rate and term would
   * have cost — the cost of the structure, made visible.
   */
  plainTotalInterest: number;
  /** `totalInterest − plainTotalInterest`: what grace and balloon cost. */
  structureCost: number;
  /** Monthly schedule, all figures positive. */
  schedule: ScheduleRow[];
};

/**
 * Price a commercial loan.
 *
 * Null when the inputs cannot describe one: a non-positive amount or term, a
 * negative rate, a grace period as long as the term (nothing would be left to
 * amortize), a balloon at or above 100% of the principal (nothing would be
 * amortized either), a non-integer month count, or any non-finite number.
 *
 * A balloon of exactly 100% is rejected rather than treated as a bullet loan:
 * that structure is interest-only throughout, which is what `graceMonths`
 * equal to the term would express — and that is rejected too, for the same
 * reason. Both are real products, but neither is what this tool computes, and
 * silently reinterpreting the input would be a guess.
 */
export function computeCommercialLoan(
  input: CommercialLoanInput,
): CommercialLoanResult | null {
  const {
    amount,
    annualRatePercent,
    termMonths,
    graceMonths = 0,
    balloonPercent = 0,
  } = input;

  const numbers = [
    amount,
    annualRatePercent,
    termMonths,
    graceMonths,
    balloonPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (amount <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths) || !Number.isInteger(graceMonths)) {
    return null;
  }
  if (graceMonths >= termMonths) return null;
  if (balloonPercent >= 100) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const balloonAmount = amount * (balloonPercent / 100);
  const amortizingMonths = termMonths - graceMonths;

  // Interest only, so the balance never moves during the grace period.
  const gracePayment = amount * monthlyRate;

  // The balloon goes in as a future value, NOT by amortizing a smaller
  // principal: interest accrues on the whole balance for the whole term.
  const amortizingPayment = Math.abs(
    pmt(monthlyRate, amortizingMonths, amount, -balloonAmount),
  );
  if (!Number.isFinite(amortizingPayment)) return null;

  const schedule: ScheduleRow[] = [];
  let balance = amount;
  let graceInterest = 0;
  let amortizingInterest = 0;

  for (let month = 1; month <= graceMonths; month += 1) {
    const interest = balance * monthlyRate;
    graceInterest += interest;
    schedule.push({
      period: month,
      payment: interest,
      interest,
      principal: 0,
      balance,
    });
  }

  for (let step = 1; step <= amortizingMonths; step += 1) {
    const month = graceMonths + step;
    const interest = balance * monthlyRate;
    let principal = amortizingPayment - interest;
    // On the final scheduled month, repay down to the balloon exactly, so
    // the residual lands on the balloon by construction rather than on a
    // rounding residue.
    if (step >= amortizingMonths) principal = balance - balloonAmount;
    if (principal > balance) principal = balance;
    balance -= principal;
    amortizingInterest += interest;
    schedule.push({
      period: month,
      payment: interest + principal,
      interest,
      principal,
      balance,
    });
  }

  const totalInterest = graceInterest + amortizingInterest;

  // What the same money over the same term would have cost with no grace and
  // no balloon — the yardstick for the structure's cost.
  const plain = amortize({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
  });
  if (plain === null) return null;
  const plainTotalInterest = plain.reduce(
    (sum, row) => sum + row.interest,
    0,
  );

  return {
    gracePayment: graceMonths > 0 ? gracePayment : 0,
    graceMonths,
    amortizingPayment,
    amortizingMonths,
    balloonAmount,
    graceInterest,
    amortizingInterest,
    totalInterest,
    totalPaid: amount + totalInterest,
    interestToPrincipalPercent: (totalInterest / amount) * 100,
    plainTotalInterest,
    structureCost: totalInterest - plainTotalInterest,
    schedule,
  };
}
