/**
 * Loans whose rate changes during the term, for /cong-cu/lai-suat-tha-noi/
 * and /cong-cu/lai-co-dinh-hay-tha-noi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `floating-loan.test.ts`.
 *
 * Almost every Vietnamese mortgage is this shape and almost every calculator
 * models the other one. A promotional rate runs for 6–24 months, then the
 * rate becomes a base rate plus a margin and moves with the base. The
 * instalment quoted at signing is the promotional one, and the number that
 * matters is the one after it.
 *
 * The mechanic that makes this more than a loop: **at each rate change the
 * instalment is recalculated on the REMAINING BALANCE over the REMAINING
 * TERM.** That is what banks do, and it is why the payment shock is smaller
 * than the rate change alone suggests early on and larger later — by month
 * 24 there is less balance but also less time to spread it over.
 *
 * `phases` is a list of (months, rate) segments and is the general primitive;
 * `buildPhases` turns the handful of inputs a borrower actually has — promo
 * length, promo rate, post-promo rate, and an optional step-up scenario —
 * into that list. Keeping the two separate means the schedule logic is tested
 * independently of the scenario-building.
 *
 * Nothing here predicts a rate. The step-up inputs are a SCENARIO the user
 * supplies, and the page says so: no static page can know where a base rate
 * will be in three years.
 */

import { pmt, type ScheduleRow } from "@/lib/calc/finance";
import { computeLoan } from "@/lib/calc/loan";

/** A stretch of months at one rate. */
export type LoanPhase = {
  /** How many months this rate applies for. */
  months: number;
  /** Nominal annual rate in percent for this stretch. */
  annualRatePercent: number;
};

export type PhaseSummary = {
  /** 1-based inclusive month range. */
  fromMonth: number;
  toMonth: number;
  annualRatePercent: number;
  /** The instalment during this stretch, recalculated at its start. */
  payment: number;
  /** Interest paid during the stretch. */
  interest: number;
  /** Principal repaid during the stretch. */
  principal: number;
  /** Balance outstanding at the end of the stretch. */
  balance: number;
};

export type FloatingLoanResult = {
  /** Months the schedule runs. */
  months: number;
  /** Full monthly schedule, all figures positive. */
  schedule: ScheduleRow[];
  /** One entry per phase. */
  phases: PhaseSummary[];
  /** The instalment during the first phase — the one quoted at signing. */
  firstPayment: number;
  /** The largest instalment across the term. */
  highestPayment: number;
  /** The smallest instalment across the term. */
  lowestPayment: number;
  /** `highestPayment − firstPayment`: what the borrower has to absorb. */
  paymentShock: number;
  /** The same, as a percent of the first payment. */
  paymentShockPercent: number;
  /** Interest over the whole term. */
  totalInterest: number;
  /** Principal plus interest over the whole term. */
  totalPaid: number;
};

/**
 * Amortize a loan through a sequence of rate phases.
 *
 * Null when the inputs cannot describe a loan: a non-positive amount, no
 * phases, a phase with a non-positive or non-integer month count, a negative
 * rate, or any non-finite number. The phases' months must sum to the whole
 * term — there is no implicit tail.
 */
export function computeFloatingLoan(input: {
  /** Principal borrowed, in đồng. */
  amount: number;
  /** The rate phases, in order. Their months are the term. */
  phases: readonly LoanPhase[];
}): FloatingLoanResult | null {
  const { amount, phases } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (phases.length === 0) return null;
  for (const phase of phases) {
    if (!Number.isFinite(phase.months) || phase.months <= 0) return null;
    if (!Number.isInteger(phase.months)) return null;
    if (!Number.isFinite(phase.annualRatePercent)) return null;
    if (phase.annualRatePercent < 0) return null;
  }

  const totalMonths = phases.reduce((sum, phase) => sum + phase.months, 0);

  const schedule: ScheduleRow[] = [];
  const summaries: PhaseSummary[] = [];
  let balance = amount;
  let month = 0;
  let remaining = totalMonths;

  for (const phase of phases) {
    const monthlyRate = phase.annualRatePercent / 100 / 12;
    // Recalculated here, on what is left, over what is left. This is the
    // whole mechanic.
    const payment = Math.abs(pmt(monthlyRate, remaining, balance));
    if (!Number.isFinite(payment)) return null;

    const fromMonth = month + 1;
    let phaseInterest = 0;
    let phasePrincipal = 0;

    for (let step = 0; step < phase.months && balance > 0; step += 1) {
      month += 1;
      const interest = balance * monthlyRate;
      let principal = payment - interest;
      // Never repay more than is outstanding, and force the payoff on the
      // final scheduled month so the balance lands on exactly zero.
      if (month >= totalMonths || principal > balance) principal = balance;
      balance -= principal;
      phaseInterest += interest;
      phasePrincipal += principal;
      schedule.push({
        period: month,
        payment: interest + principal,
        interest,
        principal,
        balance,
      });
    }

    summaries.push({
      fromMonth,
      toMonth: month,
      annualRatePercent: phase.annualRatePercent,
      payment,
      interest: phaseInterest,
      principal: phasePrincipal,
      balance,
    });

    remaining -= phase.months;
    if (balance <= 0) break;
  }

  if (schedule.length === 0) return null;

  const payments = summaries.map((summary) => summary.payment);
  const firstPayment = payments[0];
  const highestPayment = Math.max(...payments);
  const lowestPayment = Math.min(...payments);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);

  return {
    months: schedule.length,
    schedule,
    phases: summaries,
    firstPayment,
    highestPayment,
    lowestPayment,
    paymentShock: highestPayment - firstPayment,
    paymentShockPercent:
      firstPayment > 0
        ? ((highestPayment - firstPayment) / firstPayment) * 100
        : 0,
    totalInterest,
    totalPaid,
  };
}

/**
 * Turn a borrower's actual inputs into a phase list.
 *
 * A promotional stretch, then the post-promotional rate, optionally stepping
 * up every `adjustEveryMonths` by `adjustStepPoints` and stopping at
 * `rateCapPercent`. The remainder of the term after the promo is split into
 * adjustment windows; the last one absorbs any leftover months.
 *
 * Null when the inputs cannot describe a schedule: a non-positive or
 * non-integer term, a promo stretch at least as long as the term, a negative
 * rate or step, a non-positive adjustment interval, or any non-finite number.
 *
 * A promo length of 0 is allowed and means "no promotional rate" — the whole
 * term runs on the post-promotional path.
 */
export function buildPhases(input: {
  /** Term in months. */
  termMonths: number;
  /** Months at the promotional rate. 0 for none. */
  promoMonths: number;
  /** Promotional rate, in percent per year. */
  promoRatePercent: number;
  /** Rate once the promotion ends, in percent per year. */
  postRatePercent: number;
  /** How often the rate is reviewed after the promo, in months. */
  adjustEveryMonths?: number;
  /** Percentage points added at each review. 0 for a flat post-promo rate. */
  adjustStepPoints?: number;
  /** Ceiling on the rate, in percent per year. */
  rateCapPercent?: number;
}): LoanPhase[] | null {
  const {
    termMonths,
    promoMonths,
    promoRatePercent,
    postRatePercent,
    adjustEveryMonths = 12,
    adjustStepPoints = 0,
    rateCapPercent,
  } = input;

  const numbers = [
    termMonths,
    promoMonths,
    promoRatePercent,
    postRatePercent,
    adjustEveryMonths,
    adjustStepPoints,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (termMonths <= 0 || !Number.isInteger(termMonths)) return null;
  if (!Number.isInteger(promoMonths)) return null;
  if (promoMonths >= termMonths) return null;
  if (adjustEveryMonths <= 0 || !Number.isInteger(adjustEveryMonths)) {
    return null;
  }
  if (rateCapPercent !== undefined) {
    if (!Number.isFinite(rateCapPercent) || rateCapPercent < 0) return null;
  }

  const phases: LoanPhase[] = [];
  if (promoMonths > 0) {
    phases.push({ months: promoMonths, annualRatePercent: promoRatePercent });
  }

  let remaining = termMonths - promoMonths;
  let rate = postRatePercent;

  // A flat post-promo rate is one phase; there is nothing to step.
  if (adjustStepPoints === 0) {
    phases.push({
      months: remaining,
      annualRatePercent:
        rateCapPercent === undefined ? rate : Math.min(rate, rateCapPercent),
    });
    return phases;
  }

  while (remaining > 0) {
    const capped =
      rateCapPercent === undefined ? rate : Math.min(rate, rateCapPercent);
    // The last window absorbs whatever is left of the term.
    const months = Math.min(adjustEveryMonths, remaining);
    phases.push({ months, annualRatePercent: capped });
    remaining -= months;
    rate += adjustStepPoints;
  }

  return phases;
}

export type FixedFloatingComparison = {
  /** The floating path. */
  floating: FloatingLoanResult;
  /** Instalment on a fixed-rate loan of the same size and term. */
  fixedPayment: number;
  /** Interest on the fixed-rate loan. */
  fixedTotalInterest: number;
  /** `fixedTotalInterest − floating.totalInterest`. Positive favours floating. */
  interestSaving: number;
  /** Whether the floating path came out cheaper in total. */
  floatingWins: boolean;
  /**
   * The flat rate at which the fixed loan costs the same total interest as
   * the floating path. Above this, fixed is dearer. Null when unsolvable.
   */
  breakEvenFixedRatePercent: number | null;
};

/**
 * Compare a phased path with a single fixed rate over the same term.
 *
 * The break-even fixed rate is found by bisection on `computeLoan`'s total
 * interest, which is monotonic in the rate — so there is exactly one answer
 * when it lies in the searched range.
 *
 * Null when either side cannot be computed.
 */
export function compareFixedFloating(input: {
  amount: number;
  phases: readonly LoanPhase[];
  fixedRatePercent: number;
}): FixedFloatingComparison | null {
  const { amount, phases, fixedRatePercent } = input;

  if (!Number.isFinite(fixedRatePercent) || fixedRatePercent < 0) return null;

  const floating = computeFloatingLoan({ amount, phases });
  if (floating === null) return null;

  const termMonths = phases.reduce((sum, phase) => sum + phase.months, 0);
  const fixed = computeLoan({
    amount,
    annualRatePercent: fixedRatePercent,
    termMonths,
  });
  if (fixed === null) return null;

  const interestSaving = fixed.totalInterest - floating.totalInterest;

  // Total interest rises monotonically with the rate, so a plain scan-then-
  // narrow finds the crossing without needing a general root finder.
  let breakEvenFixedRatePercent: number | null = null;
  let low = 0;
  let high = 100;
  const interestAt = (ratePercent: number): number | null => {
    const loan = computeLoan({
      amount,
      annualRatePercent: ratePercent,
      termMonths,
    });
    return loan === null ? null : loan.totalInterest;
  };
  const atLow = interestAt(low);
  const atHigh = interestAt(high);
  if (
    atLow !== null &&
    atHigh !== null &&
    atLow <= floating.totalInterest &&
    atHigh >= floating.totalInterest
  ) {
    for (let step = 0; step < 200; step += 1) {
      const mid = (low + high) / 2;
      const value = interestAt(mid);
      if (value === null) break;
      if (value < floating.totalInterest) low = mid;
      else high = mid;
    }
    breakEvenFixedRatePercent = (low + high) / 2;
  }

  return {
    floating,
    fixedPayment: fixed.monthlyPrincipalInterest,
    fixedTotalInterest: fixed.totalInterest,
    interestSaving,
    floatingWins: interestSaving > 0,
    breakEvenFixedRatePercent,
  };
}
