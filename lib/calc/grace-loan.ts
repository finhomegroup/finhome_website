/**
 * Ân hạn gốc AND a rate reset, in one schedule — for /cong-cu/chi-tra-lai/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `grace-loan.test.ts`.
 * Presentation-shaped like `loan.ts`: every figure returned is positive.
 *
 * WHY THIS EXISTS RATHER THAN `computeInterestOnly`.
 *
 * `computeInterestOnly` takes ONE rate. A Vietnamese borrower with a grace
 * period almost always has a promotional rate as well, and the two periods are
 * NOT the same period — ân hạn gốc might run 24 months while the promotional
 * rate runs 12, or the other way round. Modelling them separately forced the
 * reader through two disconnected calculations and gave them no single debt
 * path, which original row 14 explicitly rejects: "ghép với thay đổi lãi để
 * tránh người dùng phải tính hai lần".
 *
 * THE MECHANIC, in the order the months happen.
 *
 * - While `month <= graceMonths` only interest is charged, so the balance does
 *   NOT move. The obligation is unchanged: this is the lesson the page teaches.
 *   The payment still changes if the RATE changes inside the grace period,
 *   because interest is charged on the same balance at a different rate.
 * - The first month after the grace period, the FULL outstanding balance is
 *   amortized over the months that remain of the original term.
 * - At a rate change the balance standing at that moment is re-amortized over
 *   the months that remain. That happens whether the change lands inside the
 *   grace period or after it.
 *
 * So there are up to three payment levels and two independent dates, and one
 * schedule carries all of them.
 *
 * NOTHING HERE IS A BANK PRODUCT. A grace period, its length, the promotional
 * rate and the rate after it are all terms the reader enters from their own
 * offer or types as a hypothesis. This module describes the arithmetic of a
 * contract shaped that way; it does not claim any lender offers one.
 */

import { pmt, type ScheduleRow } from "@/lib/calc/finance";
import { MAX_FLOATING_MONTHS } from "@/lib/calc/floating-loan";

export type GraceLoanInput = {
  /** Principal borrowed, in đồng. */
  amount: number;
  /** The whole term in months, INCLUDING the grace period. */
  termMonths: number;
  /**
   * Months paying interest only — ân hạn gốc. 0 for none.
   *
   * Must be shorter than the term: a grace period as long as the term repays
   * nothing, which is a balloon loan and not this shape.
   */
  graceMonths: number;
  /** Months at the promotional rate. 0 for none, and independent of the grace. */
  promoMonths: number;
  /** The promotional rate, in percent per year. */
  promoRatePercent: number;
  /** The rate once the promotion ends, in percent per year. */
  postRatePercent: number;
};

/** A stretch of months at one rate and one payment level. */
export type GracePhase = {
  /** 1-based inclusive month range. */
  fromMonth: number;
  toMonth: number;
  annualRatePercent: number;
  /** True while only interest is charged and the balance does not move. */
  interestOnly: boolean;
  /** The instalment through this stretch. */
  payment: number;
  interest: number;
  principal: number;
  /** Balance outstanding at the end of the stretch. */
  balance: number;
};

export type GraceLoanResult = {
  /** Months the schedule runs. Equals the term. */
  months: number;
  schedule: ScheduleRow[];
  phases: GracePhase[];

  /** The instalment in month 1 — what the offer sheet usually quotes. */
  firstPayment: number;

  /** The last month of ân hạn gốc, or null when there is no grace period. */
  graceEndMonth: number | null;
  /** The last promotional month, or null when there is no promotion. */
  promoEndMonth: number | null;
  /**
   * The balance standing when the grace period ends.
   *
   * Equal to `amount` by construction whenever there is a grace period — no
   * principal has been repaid. It is returned rather than implied because it
   * is the figure the page's whole lesson rests on.
   */
  balanceAtGraceEnd: number | null;
  /** The balance standing when the promotion ends. */
  balanceAtPromoEnd: number | null;

  /** The instalment in the last grace month. Null with no grace period. */
  lastGracePayment: number | null;
  /** The first month that repays principal. */
  firstAmortizingMonth: number;
  /** The instalment in that month. */
  firstAmortizingPayment: number;
  /**
   * `firstAmortizingPayment − lastGracePayment`: the ân-hạn-gốc jump.
   *
   * Null with no grace period, where there is no jump to report rather than a
   * jump of zero.
   */
  graceJump: number | null;
  /**
   * The instalment from the month the rate resets, when that reset happens
   * AFTER the grace period. Null when it does not — inside the grace period
   * the reset changes the interest-only payment instead, which the phases show.
   */
  postResetPayment: number | null;
  /** The month `postResetPayment` starts. */
  postResetMonth: number | null;
  /** The highest instalment anywhere in the schedule. */
  highestPayment: number;

  totalInterest: number;
  totalPaid: number;
  /**
   * Interest on the SAME rate path with no grace period at all.
   *
   * The honest comparison for "what does ân hạn gốc cost me": it isolates the
   * grace period by holding the promotional path fixed, rather than comparing
   * against a constant-rate loan the reader was never offered.
   *
   * NULL WHEN THE COMPARISON COULD NOT BE BUILT, which is not the same as
   * "the grace period costs nothing". It used to fall back to this schedule's
   * own interest, which made `extraInterest` exactly 0 — indistinguishable
   * from a genuinely free grace period. A synthetic extreme makes it real: at
   * a term of 1.200 months and a 1.200%/năm rate, the no-grace annuity's
   * `(1 + rate) ** periods` overflows float64 while the interest-only path
   * stays finite, so there is no comparable figure to report.
   */
  comparableTotalInterest: number | null;
  /** `totalInterest − comparableTotalInterest`, or null with no comparison. */
  extraInterest: number | null;
};

/** The rate in force in a given 1-based month. */
function rateInMonth(input: GraceLoanInput, month: number): number {
  const annual =
    month <= input.promoMonths
      ? input.promoRatePercent
      : input.postRatePercent;
  return annual / 100 / 12;
}

/** Validate, and say nothing about the answer. */
function usable(input: GraceLoanInput): boolean {
  const numbers = [
    input.amount,
    input.termMonths,
    input.graceMonths,
    input.promoMonths,
    input.promoRatePercent,
    input.postRatePercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) {
    return false;
  }
  if (input.amount <= 0) return false;
  if (!Number.isInteger(input.termMonths) || input.termMonths < 1) return false;
  // The same disclosed horizon as the rest of the suite, checked BEFORE the
  // month loop allocates a row per month.
  if (input.termMonths > MAX_FLOATING_MONTHS) return false;
  if (!Number.isInteger(input.graceMonths)) return false;
  if (!Number.isInteger(input.promoMonths)) return false;
  // A grace period as long as the term never repays principal.
  if (input.graceMonths >= input.termMonths) return false;
  // A promotion running the whole term is a constant-rate loan; say so with
  // the rates rather than by stretching the promotion past the maturity.
  if (input.promoMonths >= input.termMonths) return false;
  return true;
}

/** Build the whole monthly schedule. Null when a figure goes non-finite. */
function buildSchedule(input: GraceLoanInput): ScheduleRow[] | null {
  const { amount, termMonths, graceMonths } = input;

  const rows: ScheduleRow[] = [];
  let balance = amount;
  let payment = 0;
  let previousRate: number | null = null;

  for (let month = 1; month <= termMonths; month += 1) {
    const rate = rateInMonth(input, month);
    const amortizing = month > graceMonths;
    const rateChanged = previousRate === null || rate !== previousRate;

    if (amortizing) {
      // Recompute at the first amortizing month AND at every rate change: the
      // remaining balance over the months that are left, which is what a bank
      // does at a reset and what makes the jump the size it is.
      const startsAmortizing = month === graceMonths + 1;
      if (startsAmortizing || rateChanged) {
        const remaining = termMonths - month + 1;
        payment = Math.abs(pmt(rate, remaining, balance));
        if (!Number.isFinite(payment)) return null;
      }
    } else {
      // Interest only. It still moves when the rate moves.
      payment = balance * rate;
      if (!Number.isFinite(payment)) return null;
    }
    previousRate = rate;

    const interest = balance * rate;
    let principal = amortizing ? payment - interest : 0;
    // Never repay more than is outstanding, and force the payoff on the final
    // scheduled month so the balance lands on exactly zero.
    if (amortizing && (month === termMonths || principal > balance)) {
      principal = balance;
    }
    if (principal < 0) principal = 0;
    balance -= principal;

    const paid = interest + principal;
    if (!Number.isFinite(paid) || !Number.isFinite(balance)) return null;
    rows.push({ period: month, payment: paid, interest, principal, balance });
  }

  return rows;
}

/** Collapse the schedule into one entry per (rate, payment level) stretch. */
function phasesOf(
  input: GraceLoanInput,
  schedule: ScheduleRow[],
): GracePhase[] {
  const phases: GracePhase[] = [];
  const { graceMonths } = input;

  for (const row of schedule) {
    const rate = rateInMonth(input, row.period) * 12 * 100;
    const interestOnly = row.period <= graceMonths;
    const last = phases[phases.length - 1];
    // A new phase starts wherever the rate or the interest-only status changes.
    // The payment inside a stretch is constant by construction, apart from the
    // final month's rounding, so it is not part of the key.
    const continues =
      last !== undefined &&
      last.annualRatePercent === rate &&
      last.interestOnly === interestOnly;

    if (continues) {
      last.toMonth = row.period;
      last.interest += row.interest;
      last.principal += row.principal;
      last.balance = row.balance;
    } else {
      phases.push({
        fromMonth: row.period,
        toMonth: row.period,
        annualRatePercent: rate,
        interestOnly,
        payment: row.payment,
        interest: row.interest,
        principal: row.principal,
        balance: row.balance,
      });
    }
  }

  return phases;
}

const sum = (rows: ScheduleRow[], key: "interest" | "payment") =>
  rows.reduce((total, row) => total + row[key], 0);

/**
 * A loan with ân hạn gốc and a rate reset, as one schedule.
 *
 * Null when the inputs cannot describe such a loan: a non-positive amount, a
 * non-integer or out-of-range term, a grace period or promotion at least as
 * long as the term, a negative rate, any non-finite number, or a figure that
 * goes non-finite along the way.
 *
 * `graceMonths: 0` is valid and means no grace period — the result then has to
 * agree with the accepted no-grace model to the đồng, which is a test.
 */
export function computeGraceLoan(
  input: GraceLoanInput,
): GraceLoanResult | null {
  if (!usable(input)) return null;

  const schedule = buildSchedule(input);
  if (schedule === null || schedule.length === 0) return null;

  const { graceMonths, promoMonths } = input;
  const phases = phasesOf(input, schedule);

  const graceEndMonth = graceMonths > 0 ? graceMonths : null;
  const promoEndMonth = promoMonths > 0 ? promoMonths : null;

  const firstAmortizingMonth = graceMonths + 1;
  const firstAmortizingRow = schedule[firstAmortizingMonth - 1];
  const lastGraceRow = graceEndMonth === null ? null : schedule[graceEndMonth - 1];

  // The reset payment is only a separate LEVEL when the reset lands after the
  // grace period. Inside the grace period it changes the interest-only figure,
  // which the phase list already shows month by month.
  const resetMonth = promoMonths > 0 ? promoMonths + 1 : null;
  const resetAfterGrace =
    resetMonth !== null && resetMonth > firstAmortizingMonth;
  const resetRow = resetAfterGrace ? schedule[resetMonth - 1] : null;

  const totalInterest = sum(schedule, "interest");
  const totalPaid = sum(schedule, "payment");
  if (!Number.isFinite(totalInterest) || !Number.isFinite(totalPaid)) {
    return null;
  }

  // The same rate path, amortizing from month 1. A comparison that could not
  // be built is reported as ABSENT rather than as a zero difference: those are
  // different statements, and only one of them is true.
  const comparable =
    graceMonths === 0 ? schedule : buildSchedule({ ...input, graceMonths: 0 });
  let comparableTotalInterest: number | null = null;
  if (comparable !== null) {
    const comparableInterest = sum(comparable, "interest");
    if (Number.isFinite(comparableInterest)) {
      comparableTotalInterest = comparableInterest;
    }
  }

  const highestPayment = Math.max(...schedule.map((row) => row.payment));

  return {
    months: schedule.length,
    schedule,
    phases,
    firstPayment: schedule[0].payment,
    graceEndMonth,
    promoEndMonth,
    balanceAtGraceEnd: lastGraceRow === null ? null : lastGraceRow.balance,
    balanceAtPromoEnd:
      promoEndMonth === null ? null : schedule[promoEndMonth - 1].balance,
    lastGracePayment: lastGraceRow === null ? null : lastGraceRow.payment,
    firstAmortizingMonth,
    firstAmortizingPayment: firstAmortizingRow.payment,
    graceJump:
      lastGraceRow === null
        ? null
        : firstAmortizingRow.payment - lastGraceRow.payment,
    postResetPayment: resetRow === null ? null : resetRow.payment,
    postResetMonth: resetRow === null ? null : resetMonth,
    highestPayment,
    totalInterest,
    totalPaid,
    comparableTotalInterest,
    extraInterest:
      comparableTotalInterest === null
        ? null
        : totalInterest - comparableTotalInterest,
  };
}

/** Re-exported so a page bounds its month fields on the same figure. */
export { MAX_FLOATING_MONTHS as MAX_GRACE_LOAN_MONTHS };
