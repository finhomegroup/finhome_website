/**
 * Vehicle finance for /cong-cu/vay-mua-xe/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `auto-loan.test.ts`.
 *
 * A car loan is a plain amortizing loan, so the arithmetic delegates to
 * `computeLoan`. What this module adds is the part specific to buying a
 * vehicle: the amount borrowed is derived rather than entered, from the price
 * less a deposit and less any trade-in allowance. That derivation is here
 * rather than in the page so it can be tested — getting it wrong would
 * silently finance the wrong amount.
 */

import { computeLoan, type LoanResult } from "@/lib/calc/loan";

export type AutoLoanInput = {
  /** On-road price of the vehicle, in đồng. */
  price: number;
  /** Cash deposit paid up front. */
  downPayment?: number;
  /** Allowance for a vehicle being traded in. */
  tradeIn?: number;
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Term in months. Vehicle loans are typically 12–84. */
  termMonths: number;
};

export type AutoLoanResult = {
  /** Price less deposit and trade-in: what is actually borrowed. */
  amountFinanced: number;
  /** Deposit plus trade-in, as a share of the price, in percent. */
  downPaymentPercent: number;
  /** The underlying loan. */
  loan: LoanResult;
};

/**
 * Compute a vehicle loan.
 *
 * Null when the inputs cannot describe one — including the case where the
 * deposit and trade-in already cover the price, since then there is nothing to
 * finance and the buyer does not need this tool.
 */
export function computeAutoLoan(
  input: AutoLoanInput,
): AutoLoanResult | null {
  const {
    price,
    downPayment = 0,
    tradeIn = 0,
    annualRatePercent,
    termMonths,
  } = input;

  const numbers = [price, downPayment, tradeIn, annualRatePercent, termMonths];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (price <= 0) return null;

  const contribution = downPayment + tradeIn;
  const amountFinanced = price - contribution;
  // Nothing left to borrow — or the buyer is contributing more than the price.
  if (amountFinanced <= 0) return null;

  const loan = computeLoan({
    amount: amountFinanced,
    annualRatePercent,
    termMonths,
  });
  if (loan === null) return null;

  return {
    amountFinanced,
    downPaymentPercent: (contribution / price) * 100,
    loan,
  };
}
