/**
 * Compound interest for /cong-cu/lai-kep/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `compound.test.ts`.
 *
 * Presentation-shaped like `loan.ts`: everything returned is positive. It
 * calls `fv` (Excel convention, outflows negative) and flips the sign once
 * here, so the page never deals with it.
 *
 * Contributions are made at the END of each period (an ordinary annuity),
 * which is what a monthly savings transfer actually is.
 */

import { fv, periodsPerYear, toEffective, type Compounding } from "@/lib/calc/finance";

/**
 * Relative band for treating a float product as the integer it should be.
 *
 * `years * perYear` is a float multiplication, so a mathematically exact
 * integer can land just below one: 1,4 × 365 evaluates to 510.99999999999994.
 * Flooring that raw value silently drops a whole compounding run. The band is
 * relative because the product spans 1 to ~131.000 (360 năm ghép lãi hằng
 * ngày), and it is far tighter than any fraction a user can express — the
 * smallest real fraction of a daily period is 1/365 ≈ 2,7e-3.
 */
const PERIOD_SNAP_BAND = 1e-9;

/**
 * The longest term this module supports, in years — 100, the same horizon
 * `savings-schedule.ts` caps its projection at, so the suite has one supported
 * horizon rather than two.
 *
 * BOUNDED BEFORE THE YEAR LOOP ALLOCATES, not by sampling afterwards. The
 * year-end snapshot loop below runs once per year of the term, and `years` is
 * a plain number from a form: 1e9 năm ghép lãi hằng ngày is a finite input
 * that asked for a billion iterations and an array to hold them. A term past
 * the bound is REFUSED rather than clamped — pricing a hundred years when the
 * reader typed a thousand is answering a different question.
 */
export const MAX_COMPOUND_YEARS = 100;

/**
 * Whole COMPLETED compounding runs in a term.
 *
 * Floor, not round — interest is credited only for runs that have finished, so
 * a partial period pays nothing and 2,5 năm ghép lãi hằng năm earns two years,
 * not three. But floor the SNAPPED product, not the raw one, or float error
 * eats a legitimate period.
 */
function wholePeriods(years: number, perYear: number): number {
  const raw = years * perYear;
  const nearest = Math.round(raw);
  return Math.abs(raw - nearest) <= PERIOD_SNAP_BAND * Math.max(1, nearest)
    ? nearest
    : Math.floor(raw);
}

export type CompoundInput = {
  /** Starting balance, in đồng. May be 0 if the saver starts from nothing. */
  principal: number;
  /** Nominal annual rate in percent, e.g. 6 for 6%/năm. */
  annualRatePercent: number;
  /** How long the money compounds, in years. Fractional years are allowed. */
  years: number;
  /** How often interest is added. */
  compounding: Compounding;
  /** Optional amount added every compounding period. */
  contributionPerPeriod?: number;
};

export type CompoundResult = {
  /** Balance at the end of the term. */
  futureValue: number;
  /** Principal plus every contribution — the money the saver put in. */
  totalContributed: number;
  /** Everything the interest earned. */
  totalInterest: number;
  /** Effective annual rate, which exceeds the nominal rate when compounding is more frequent than yearly. */
  effectiveAnnualRatePercent: number;
  /** Number of compounding periods over the whole term. */
  periods: number;
  /** Compounding periods per year, for reading `periods` as time. */
  periodsPerYear: number;
  /**
   * The time actually CREDITED, in years: `periods / periodsPerYear`.
   *
   * Not the term the reader typed. A term short of a whole period credits
   * nothing, and 2,5 năm ghép lãi hằng năm credits 2 — so this is the horizon
   * every figure here belongs to, and the one a chart axis must use.
   */
  creditedYears: number;
  /**
   * Compounding periods the entered term ASKED FOR but did not complete.
   *
   * 0 whenever the term is a whole number of periods, however odd a number of
   * YEARS that is: 1,5 năm ghép nửa năm is exactly 3 periods and nothing is
   * uncredited. 2,5 năm ghép hằng năm is 0,5 of a period uncredited. The two
   * facts are different, and a page that said "kỳ hạn không tròn số kỳ ghép
   * lãi" about the first one was wrong about its own arithmetic.
   */
  uncreditedPeriods: number;
  /** Balance at the end of each year, for the schedule table. */
  yearlyBalances: CompoundYear[];
};

export type CompoundYear = {
  /** 1-based year index. */
  year: number;
  /**
   * Compounding periods CREDITED by this snapshot.
   *
   * The final snapshot of a fractional term is a PARTIAL year: 1,5 năm ghép
   * lãi nửa năm credits 3 periods, so the second snapshot sits at 1,5 years
   * and not at 2. Carried here because a chart that plotted it at year 2, or
   * labelled it "Năm 2", would claim a year of compounding that never
   * happened — an independent review caught exactly that.
   */
  elapsedPeriods: number;
  /** `elapsedPeriods / periodsPerYear`: real elapsed time, possibly 1,5. */
  elapsedYears: number;
  /** True when this snapshot is short of a whole year of periods. */
  partial: boolean;
  /** Money put in by the end of this snapshot, cumulative. */
  contributed: number;
  /** Interest earned by the end of this snapshot, cumulative. */
  interest: number;
  /** Balance at the end of this snapshot. */
  balance: number;
};

/**
 * Compute a compounding balance.
 *
 * Null when the inputs cannot describe a deposit — a negative principal or
 * rate, a non-positive term, or any non-finite number. A zero principal with
 * a positive contribution is valid: that is somebody starting from nothing.
 */
export function computeCompound(input: CompoundInput): CompoundResult | null {
  const {
    principal,
    annualRatePercent,
    years,
    compounding,
    contributionPerPeriod = 0,
  } = input;

  const numbers = [principal, annualRatePercent, years, contributionPerPeriod];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (years <= 0) return null;
  // Before anything loops or allocates. See `MAX_COMPOUND_YEARS`.
  if (years > MAX_COMPOUND_YEARS) return null;
  if (principal === 0 && contributionPerPeriod === 0) return null;

  const perYear = periodsPerYear(compounding);
  const ratePerPeriod = annualRatePercent / 100 / perYear;
  // Whole periods only: a saver cannot be paid a fraction of an interest run.
  // `Math.round` paid a full run for any fraction of 0,5 or more, crediting
  // 2,5 năm ghép lãi hằng năm with three years of interest. See
  // `wholePeriods` for why the product is snapped before it is floored. A term
  // shorter than one whole period has nothing to compute, and the guard below
  // returns null rather than a guessed figure.
  const periods = wholePeriods(years, perYear);
  if (periods <= 0) return null;

  const futureValue = Math.abs(
    fv(ratePerPeriod, periods, -contributionPerPeriod, -principal),
  );
  if (!Number.isFinite(futureValue)) return null;

  const totalContributed = principal + contributionPerPeriod * periods;

  // Year-end snapshots. Recomputing from the closed form each year avoids
  // accumulating rounding across 360 iterations.
  const yearlyBalances: CompoundYear[] = [];
  const wholeYears = Math.ceil(periods / perYear);
  for (let year = 1; year <= wholeYears; year += 1) {
    const elapsed = Math.min(year * perYear, periods);
    const balance = Math.abs(
      fv(ratePerPeriod, elapsed, -contributionPerPeriod, -principal),
    );
    const contributed = principal + contributionPerPeriod * elapsed;
    yearlyBalances.push({
      year,
      // The credited time this snapshot actually sits at. The last snapshot of
      // a fractional term is short of `year` whole years.
      elapsedPeriods: elapsed,
      elapsedYears: elapsed / perYear,
      partial: elapsed < year * perYear,
      contributed,
      interest: balance - contributed,
      balance,
    });
  }

  return {
    futureValue,
    totalContributed,
    totalInterest: futureValue - totalContributed,
    effectiveAnnualRatePercent: toEffective(annualRatePercent / 100, perYear) * 100,
    periods,
    periodsPerYear: perYear,
    creditedYears: periods / perYear,
    // Snapped the same way `wholePeriods` snaps, so a float residue in
    // `years * perYear` cannot invent a sliver of an uncredited period: 1,5 ×
    // 2 must read as exactly 3 asked for and 3 credited.
    uncreditedPeriods: Math.max(0, snapped(years * perYear) - periods),
    yearlyBalances,
  };
}

/**
 * The float product read as the integer it is meant to be, where it is within
 * `PERIOD_SNAP_BAND` of one.
 *
 * Shared with `wholePeriods`'s reasoning: `1.4 * 365` is 510.99999999999994,
 * and the difference between "asked for" and "credited" must not be that
 * residue.
 */
function snapped(raw: number): number {
  const nearest = Math.round(raw);
  return Math.abs(raw - nearest) <= PERIOD_SNAP_BAND * Math.max(1, nearest)
    ? nearest
    : raw;
}
