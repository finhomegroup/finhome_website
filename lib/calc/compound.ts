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
  /** Balance at the end of each year, for the schedule table. */
  yearlyBalances: CompoundYear[];
};

export type CompoundYear = {
  /** 1-based year index. */
  year: number;
  /** Money put in by the end of this year, cumulative. */
  contributed: number;
  /** Interest earned by the end of this year, cumulative. */
  interest: number;
  /** Balance at the end of this year. */
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
  if (principal === 0 && contributionPerPeriod === 0) return null;

  const perYear = periodsPerYear(compounding);
  const ratePerPeriod = annualRatePercent / 100 / perYear;
  // Whole periods only: a saver cannot be paid a fraction of an interest run.
  const periods = Math.round(years * perYear);
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
    yearlyBalances,
  };
}
