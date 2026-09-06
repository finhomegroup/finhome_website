/**
 * Time-value-of-money primitives and amortization for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `finance.test.ts`.
 *
 * SIGN CONVENTION — read this before using anything here.
 *
 * These functions follow the Excel / HP-12C convention: money you pay out is
 * NEGATIVE, money you receive is POSITIVE. So for a loan you take, the
 * principal `pv` is positive (you receive it) and `pmt` comes back negative
 * (you pay it). Every reference value in the test suite is drawn from that
 * convention.
 *
 * Presenting user-friendly positive numbers is each calculator's job, not
 * this module's. `amortize` is the one deliberate exception: it is a
 * presentation-shaped helper and returns positive figures, which its own
 * docstring restates.
 *
 * `rate` is always a rate PER PERIOD, never annual. Convert first:
 * a 12%/năm nominal rate compounded monthly is `0.12 / 12`.
 *
 * `type` is the annuity-due flag: 0 (default) for payments at the end of each
 * period, 1 for the beginning.
 */

import { bisect } from "@/lib/calc/solve";

export type Compounding =
  | "annually"
  | "semiannually"
  | "quarterly"
  | "monthly"
  | "semimonthly"
  | "biweekly"
  | "weekly"
  | "daily";

const PERIODS_PER_YEAR: Record<Compounding, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
  daily: 365,
};

/** How many compounding periods a year holds. */
export function periodsPerYear(compounding: Compounding): number {
  return PERIODS_PER_YEAR[compounding];
}

/** Nominal annual rate -> effective annual rate. 0.12 monthly -> 0.126825. */
export function toEffective(nominal: number, perYear: number): number {
  return (1 + nominal / perYear) ** perYear - 1;
}

/** Effective annual rate -> nominal annual rate. The inverse of toEffective. */
export function toNominal(effective: number, perYear: number): number {
  return perYear * ((1 + effective) ** (1 / perYear) - 1);
}

/**
 * Payment per period. Negative for a loan you are repaying.
 *
 * Undefined for `periods = 0` (returns `-Infinity`); callers must validate
 * before calling.
 */
export function pmt(
  rate: number,
  periods: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + future) / periods;
  const growth = (1 + rate) ** periods;
  return (
    (-(present * growth + future) * rate) / ((growth - 1) * (1 + rate * type))
  );
}

/**
 * Present value of a stream of payments.
 *
 * Excel/HP-12C convention: outflows negative, inflows positive; `rate` is per period.
 */
export function pv(
  rate: number,
  periods: number,
  payment: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(future + payment * periods);
  const growth = (1 + rate) ** periods;
  return (
    -(future + payment * (1 + rate * type) * ((growth - 1) / rate)) / growth
  );
}

/**
 * Future value of a stream of payments.
 *
 * Excel/HP-12C convention: outflows negative, inflows positive; `rate` is per period.
 */
export function fv(
  rate: number,
  periods: number,
  payment: number,
  present = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + payment * periods);
  const growth = (1 + rate) ** periods;
  return -(
    present * growth +
    payment * (1 + rate * type) * ((growth - 1) / rate)
  );
}

/**
 * Number of periods required.
 *
 * Undefined for `payment = 0` (returns `-Infinity` in the zero-rate branch);
 * callers must validate before calling.
 *
 * Excel/HP-12C convention: outflows negative, inflows positive; `rate` is per period.
 */
export function nper(
  rate: number,
  payment: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + future) / payment;
  const adjusted = payment * (1 + rate * type);
  return (
    Math.log((adjusted - future * rate) / (adjusted + present * rate)) /
    Math.log(1 + rate)
  );
}

/**
 * Rate per period, solved numerically — there is no closed form.
 *
 * Null when no rate in the searched bracket satisfies the cash flows, which
 * callers must surface as "no solution" rather than substituting a guess.
 *
 * The upper bracket is a TERM CEILING, not a cure for overflow: `(1 + rate)
 * ** periods` still overflows float64 for very large `periods` at this
 * bracket's rate, and the solver will return `null` rather than a wrong
 * answer. At the current bound this is safe through 480 monthly periods
 * (40 years), which covers every calculator in this suite. Daily
 * compounding over multiple years (periods in the thousands) can still
 * overflow and return `null` — that case is out of scope here.
 *
 * Excel/HP-12C convention: outflows negative, inflows positive; the returned rate is per period.
 */
export function solveRate(
  periods: number,
  payment: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number | null {
  // Lower bound just above -100%: at exactly -1 the growth term collapses.
  // Upper bound 1 (100%/period, ~119,000%/year) is far above any real
  // product, and keeps (1 + rate) ** periods from overflowing float64
  // through the term lengths this suite's calculators use.
  return bisect(
    (rate) => fv(rate, periods, payment, present, type) - future,
    -0.999_999,
    1,
  );
}

export type ScheduleRow = {
  /** 1-based period index. */
  period: number;
  /** Total paid this period, as a positive figure. */
  payment: number;
  /** Portion of `payment` that is interest, positive. */
  interest: number;
  /** Portion of `payment` that reduces the balance, positive. */
  principal: number;
  /** Balance remaining after this period, positive, 0 on the final row. */
  balance: number;
};

export type AmortizeInput = {
  /** Opening balance, positive. */
  principal: number;
  /** Interest rate per period, e.g. 0.01 for 1%/month. Zero is allowed. */
  ratePerPeriod: number;
  /** Scheduled number of periods. */
  periods: number;
  /** Optional additional principal paid every period. */
  extraPerPeriod?: number;
};

/**
 * Build a full amortization schedule.
 *
 * Unlike the primitives above, every figure here is POSITIVE — this is a
 * presentation-shaped helper feeding a table a user reads.
 *
 * Extra payments shorten the schedule, so the returned array can be shorter
 * than `periods`. The final row's principal portion is forced to exactly
 * the outstanding balance (whether that final row is the scheduled last
 * period or an earlier one reached via extra payments), so the schedule
 * ends at exactly zero by construction rather than a rounding residue.
 *
 * Null when the inputs cannot describe a loan, including a non-integer
 * `periods`.
 */
export function amortize(input: AmortizeInput): ScheduleRow[] | null {
  const { principal, ratePerPeriod, periods, extraPerPeriod = 0 } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(ratePerPeriod) || ratePerPeriod < 0) return null;
  if (!Number.isFinite(periods) || periods <= 0 || !Number.isInteger(periods))
    return null;
  if (!Number.isFinite(extraPerPeriod) || extraPerPeriod < 0) return null;

  const scheduled = Math.abs(pmt(ratePerPeriod, periods, principal));
  if (!Number.isFinite(scheduled)) return null;
  const rows: ScheduleRow[] = [];
  let balance = principal;

  for (let period = 1; period <= periods && balance > 0; period += 1) {
    const interest = balance * ratePerPeriod;
    let principalPart = scheduled + extraPerPeriod - interest;
    // Final period (scheduled or forced by extra payments): never repay
    // more than is outstanding, and force the payoff on the last scheduled
    // period so the balance lands on exactly zero by construction rather
    // than relying on a rounding tolerance.
    if (period >= periods || principalPart > balance) principalPart = balance;
    const payment = interest + principalPart;
    balance -= principalPart;
    rows.push({ period, payment, interest, principal: principalPart, balance });
  }

  return rows;
}
