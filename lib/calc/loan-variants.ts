/**
 * Repayment-structure variants of a standard loan.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `loan-variants.test.ts`.
 *
 * Presentation-shaped like `loan.ts`: every figure returned is positive.
 *
 * Both variants here answer "what if I repay the same debt differently?", so
 * each returns its own result alongside the plain monthly baseline — the
 * comparison IS the answer, and computing the baseline separately in a page
 * would invite the two from drifting apart.
 */

import { amortize, pmt, type ScheduleRow } from "@/lib/calc/finance";

/**
 * Amortize with a FIXED payment, running until the balance clears.
 *
 * `amortize` in `finance.ts` derives the payment from a term. This is the
 * inverse shape: the payment is given and the term falls out of it, which is
 * what a bi-weekly schedule needs (you choose the instalment, the payoff date
 * follows).
 *
 * Null when the payment cannot service the interest — a payment at or below
 * the first period's interest charge never reduces the balance, so the loan
 * would run forever. `maxPeriods` is a backstop, not the term.
 */
export function amortizeFixedPayment(
  principal: number,
  ratePerPeriod: number,
  payment: number,
  maxPeriods = 5000,
): ScheduleRow[] | null {
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(ratePerPeriod) || ratePerPeriod < 0) return null;
  if (!Number.isFinite(payment) || payment <= 0) return null;
  // A payment that does not cover the first interest charge never amortizes.
  if (payment <= principal * ratePerPeriod) return null;

  const rows: ScheduleRow[] = [];
  let balance = principal;

  for (let period = 1; period <= maxPeriods && balance > 0; period += 1) {
    const interest = balance * ratePerPeriod;
    let principalPart = payment - interest;
    if (principalPart > balance) principalPart = balance;
    const paid = interest + principalPart;
    balance -= principalPart;
    rows.push({ period, payment: paid, interest, principal: principalPart, balance });
  }

  // Ran out of periods without clearing: the caller's inputs are pathological.
  return balance > 0 ? null : rows;
}

function sumOf(rows: ScheduleRow[], key: "interest" | "payment"): number {
  return rows.reduce((sum, row) => sum + row[key], 0);
}

export type BiweeklyInput = {
  amount: number;
  annualRatePercent: number;
  termMonths: number;
};

export type BiweeklyResult = {
  /** The ordinary monthly instalment, for reference. */
  monthlyPayment: number;
  /** Half of it, paid every fortnight. */
  biweeklyPayment: number;
  /** Total interest on the ordinary monthly schedule. */
  monthlyTotalInterest: number;
  /** Total interest on the fortnightly schedule. */
  biweeklyTotalInterest: number;
  /** Interest avoided by paying fortnightly. */
  interestSaving: number;
  /** Number of fortnightly payments made. */
  biweeklyPeriods: number;
  /** Those payments expressed in years, for a readable payoff time. */
  biweeklyYears: number;
  /** Months knocked off compared with the monthly schedule. */
  monthsSaved: number;
  biweeklySchedule: ScheduleRow[];
};

/**
 * Paying half the monthly instalment every fortnight.
 *
 * The saving comes from arithmetic, not magic: 26 fortnights a year is 13
 * monthly instalments' worth rather than 12, so an extra month of principal
 * goes in every year AND interest is charged on a balance that drops sooner.
 *
 * The fortnightly period rate is the annual rate over 26. Null when the
 * inputs cannot describe a loan.
 */
export function computeBiweekly(input: BiweeklyInput): BiweeklyResult | null {
  const { amount, annualRatePercent, termMonths } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlySchedule = amortize({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
  });
  if (monthlySchedule === null) return null;

  const monthlyPayment = Math.abs(pmt(monthlyRate, termMonths, amount));
  if (!Number.isFinite(monthlyPayment)) return null;

  const biweeklyPayment = monthlyPayment / 2;
  const biweeklyRate = annualRatePercent / 100 / 26;
  const biweeklySchedule = amortizeFixedPayment(
    amount,
    biweeklyRate,
    biweeklyPayment,
  );
  if (biweeklySchedule === null) return null;

  const monthlyTotalInterest = sumOf(monthlySchedule, "interest");
  const biweeklyTotalInterest = sumOf(biweeklySchedule, "interest");
  const biweeklyYears = biweeklySchedule.length / 26;

  return {
    monthlyPayment,
    biweeklyPayment,
    monthlyTotalInterest,
    biweeklyTotalInterest,
    interestSaving: monthlyTotalInterest - biweeklyTotalInterest,
    biweeklyPeriods: biweeklySchedule.length,
    biweeklyYears,
    monthsSaved: termMonths - biweeklyYears * 12,
    biweeklySchedule,
  };
}

export type InterestOnlyInput = {
  amount: number;
  annualRatePercent: number;
  /** Total term in months, including the interest-only phase. */
  termMonths: number;
  /** How many months are interest-only. Must be shorter than the term. */
  interestOnlyMonths: number;
};

export type InterestOnlyResult = {
  /** Payment during the interest-only phase — interest alone, no principal. */
  interestOnlyPayment: number;
  /** Payment once principal repayment starts. */
  amortizingPayment: number;
  /** How much the instalment jumps when the interest-only phase ends. */
  paymentIncrease: number;
  /** Interest paid during the interest-only phase. */
  interestOnlyPhaseInterest: number;
  /** Total interest across the whole term. */
  totalInterest: number;
  /** Total interest had the loan amortized from day one. */
  comparableTotalInterest: number;
  /** Extra interest the interest-only phase costs. */
  extraInterest: number;
  amortizingSchedule: ScheduleRow[];
};

/**
 * A loan that charges interest only for an opening phase, then repays
 * principal over what remains of the term.
 *
 * The balance does not move during the interest-only phase, so the same
 * principal must be repaid over a shorter amortizing period — which is why
 * the instalment jumps. `paymentIncrease` exists to put a number on that
 * jump, because it is the part borrowers are surprised by.
 *
 * Null when the inputs cannot describe such a loan, including an
 * interest-only phase as long as the term (nothing would ever be repaid).
 */
export function computeInterestOnly(
  input: InterestOnlyInput,
): InterestOnlyResult | null {
  const { amount, annualRatePercent, termMonths, interestOnlyMonths } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (!Number.isFinite(interestOnlyMonths) || interestOnlyMonths < 0) return null;
  if (!Number.isInteger(interestOnlyMonths)) return null;
  if (interestOnlyMonths >= termMonths) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const amortizingMonths = termMonths - interestOnlyMonths;

  const amortizingSchedule = amortize({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: amortizingMonths,
  });
  if (amortizingSchedule === null) return null;

  const amortizingPayment = Math.abs(
    pmt(monthlyRate, amortizingMonths, amount),
  );
  if (!Number.isFinite(amortizingPayment)) return null;

  const interestOnlyPayment = amount * monthlyRate;
  const interestOnlyPhaseInterest = interestOnlyPayment * interestOnlyMonths;
  const totalInterest =
    interestOnlyPhaseInterest + sumOf(amortizingSchedule, "interest");

  // The same loan amortizing over the full term from the start.
  const comparable = amortize({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
  });
  const comparableTotalInterest =
    comparable === null ? totalInterest : sumOf(comparable, "interest");

  return {
    interestOnlyPayment,
    amortizingPayment,
    paymentIncrease: amortizingPayment - interestOnlyPayment,
    interestOnlyPhaseInterest,
    totalInterest,
    comparableTotalInterest,
    extraInterest: totalInterest - comparableTotalInterest,
    amortizingSchedule,
  };
}
