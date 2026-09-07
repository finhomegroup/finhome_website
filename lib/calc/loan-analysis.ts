/**
 * Cost-structure analysis of a loan, for /cong-cu/phan-tich-khoan-vay/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `loan-analysis.test.ts`.
 *
 * The arithmetic of the loan itself is `computeLoan`'s. What this module adds
 * is the shape of the cost over time — the part a borrower cannot read off an
 * instalment figure:
 *
 * - how much interest costs relative to the sum borrowed;
 * - how lopsided the early payments are toward interest;
 * - when a payment finally repays more principal than interest;
 * - how much of the term passes before half the debt is gone.
 *
 * Every figure here is derived from the amortization schedule rather than from
 * a closed form, so the module cannot disagree with the schedule the loan
 * calculator prints. All returned figures are positive.
 */

import { computeLoan, type LoanResult } from "@/lib/calc/loan";
import type { ScheduleRow } from "@/lib/calc/finance";

export type LoanAnalysisInput = {
  /** Principal borrowed, in đồng. */
  amount: number;
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
};

/** One quarter of the term, as a block of the schedule. */
export type LoanSegment = {
  /** 1-based quarter index, 1 through 4. */
  quarter: number;
  /** First and last month of the segment, both inclusive, 1-based. */
  fromMonth: number;
  toMonth: number;
  /** Interest paid across the segment. */
  interest: number;
  /** Principal repaid across the segment. */
  principal: number;
  /** Interest as a share of the segment's payments, in percent. */
  interestSharePercent: number;
  /** Balance outstanding at the end of the segment. */
  balance: number;
};

export type LoanAnalysis = {
  /** The underlying loan, including its full schedule. */
  loan: LoanResult;
  /** Total interest as a percent of the sum borrowed. */
  interestToPrincipalPercent: number;
  /** Interest as a share of the FIRST instalment, in percent. */
  firstPaymentInterestSharePercent: number;
  /** Interest as a share of the LAST instalment, in percent. */
  lastPaymentInterestSharePercent: number;
  /**
   * First month whose instalment repays more principal than interest.
   * Null when no month does — a term short enough or a rate high enough that
   * the crossover never arrives inside the schedule.
   */
  crossoverMonth: number | null;
  /** First month by whose end half the principal has been repaid. */
  halfPrincipalMonth: number | null;
  /** `halfPrincipalMonth` as a share of the term, in percent. */
  halfPrincipalTermSharePercent: number | null;
  /**
   * First month by whose end half the total interest has been paid. Null on an
   * interest-free loan, where "half the interest" is not a moment in time.
   */
  halfInterestMonth: number | null;
  /** `halfInterestMonth` as a share of the term, in percent. */
  halfInterestTermSharePercent: number | null;
  /** The term split into four equal blocks of months. */
  segments: LoanSegment[];
};

/**
 * First month by whose end the running total of `key` reaches `target`.
 *
 * Null when the schedule never gets there, which callers surface as "no
 * result" rather than as the final month.
 */
function monthReaching(
  schedule: ScheduleRow[],
  key: "interest" | "principal",
  target: number,
): number | null {
  let running = 0;
  for (const row of schedule) {
    running += row[key];
    if (running >= target) return row.period;
  }
  return null;
}

/**
 * Split the schedule into four blocks of as-equal-as-possible length.
 *
 * Boundaries are rounded rather than truncated, and a block is emitted only
 * if it holds at least one month — so a schedule shorter than four months
 * returns fewer than four segments instead of empty ones.
 */
function quarters(schedule: ScheduleRow[]): LoanSegment[] {
  const months = schedule.length;
  const segments: LoanSegment[] = [];

  for (let quarter = 1; quarter <= 4; quarter += 1) {
    const from = Math.round(((quarter - 1) * months) / 4);
    const to = Math.round((quarter * months) / 4);
    if (to <= from) continue;

    const rows = schedule.slice(from, to);
    const interest = rows.reduce((sum, row) => sum + row.interest, 0);
    const principal = rows.reduce((sum, row) => sum + row.principal, 0);
    const paid = interest + principal;

    segments.push({
      quarter,
      fromMonth: from + 1,
      toMonth: to,
      interest,
      principal,
      // A zero-payment block cannot exist in a valid schedule, but guarding
      // costs nothing and keeps a 0/0 out of the percentage.
      interestSharePercent: paid > 0 ? (interest / paid) * 100 : 0,
      balance: rows[rows.length - 1].balance,
    });
  }

  return segments;
}

/**
 * Analyse a loan's cost structure.
 *
 * Null exactly when `computeLoan` rejects the inputs — a non-positive amount
 * or term, a negative rate, a non-integer number of months, or any non-finite
 * number.
 */
export function analyseLoan(input: LoanAnalysisInput): LoanAnalysis | null {
  const { amount, annualRatePercent, termMonths } = input;

  const loan = computeLoan({ amount, annualRatePercent, termMonths });
  if (loan === null) return null;

  const { schedule } = loan;
  const first = schedule[0];
  const last = schedule[schedule.length - 1];

  const crossover = schedule.find((row) => row.principal > row.interest);
  const halfPrincipalMonth = monthReaching(schedule, "principal", amount / 2);
  const halfInterestMonth =
    loan.totalInterest > 0
      ? monthReaching(schedule, "interest", loan.totalInterest / 2)
      : null;

  const shareOfTerm = (month: number | null) =>
    month === null ? null : (month / schedule.length) * 100;

  return {
    loan,
    interestToPrincipalPercent: (loan.totalInterest / amount) * 100,
    firstPaymentInterestSharePercent: (first.interest / first.payment) * 100,
    lastPaymentInterestSharePercent: (last.interest / last.payment) * 100,
    crossoverMonth: crossover ? crossover.period : null,
    halfPrincipalMonth,
    halfPrincipalTermSharePercent: shareOfTerm(halfPrincipalMonth),
    halfInterestMonth,
    halfInterestTermSharePercent: shareOfTerm(halfInterestMonth),
    segments: quarters(schedule),
  };
}
