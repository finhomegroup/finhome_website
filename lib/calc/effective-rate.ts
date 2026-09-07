/**
 * Nominal-to-effective rate conversion for /cong-cu/lai-suat-thuc-te/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `effective-rate.test.ts`.
 *
 * A quoted "8%/năm" is not one number. Compounded once a year it is 8%;
 * compounded monthly it is 8,30%; compounded daily, 8,33%. The nominal rate
 * says what is quoted, the effective annual rate says what is earned, and only
 * the second is comparable across products with different compounding.
 *
 * The arithmetic itself is `toEffective`/`toNominal` in `finance.ts`. What this
 * module adds is both directions behind one entry point, the per-period rate,
 * and the same nominal rate priced at every compounding frequency — the table
 * that makes the size of the effect visible.
 *
 * Rates in and out are PERCENTAGES here, unlike `finance.ts` where they are
 * fractions. The conversion happens once, at this boundary.
 */

import {
  periodsPerYear,
  toEffective,
  toNominal,
  type Compounding,
} from "@/lib/calc/finance";

export type RateDirection =
  /** Given the nominal rate, find the effective one. */
  | "toEffective"
  /** Given the effective rate, find the nominal one. */
  | "toNominal";

/** Every frequency the tool prices, in ascending order of compounding. */
export const COMPOUNDING_ORDER: Compounding[] = [
  "annually",
  "semiannually",
  "quarterly",
  "monthly",
  "semimonthly",
  "biweekly",
  "weekly",
  "daily",
];

export type EffectiveRateInput = {
  direction: RateDirection;
  /** The rate you have, in percent per year. */
  ratePercent: number;
  /** How often interest is compounded. */
  compounding: Compounding;
};

export type CompoundingRow = {
  compounding: Compounding;
  periodsPerYear: number;
  /** Effective annual rate at this frequency, in percent. */
  effectivePercent: number;
  /**
   * How much more than the annually-compounded case, in percentage points.
   * Zero on the `annually` row.
   */
  extraPoints: number;
};

export type EffectiveRateResult = {
  /** Nominal annual rate, in percent. */
  nominalPercent: number;
  /** Effective annual rate, in percent. */
  effectivePercent: number;
  /** The rate charged each period, in percent. */
  periodicPercent: number;
  /** Compounding periods in a year. */
  periodsPerYear: number;
  /** `effectivePercent − nominalPercent`, in percentage points. */
  compoundingGainPoints: number;
  /** The same nominal rate at every frequency, for the reference table. */
  table: CompoundingRow[];
};

/**
 * Convert between nominal and effective annual rates.
 *
 * Null when the input cannot describe a rate: below −100% per year (the
 * balance would go negative within the year) or non-finite. Zero is allowed
 * and converts to zero in both directions. Negative rates above −100% are
 * allowed — a real return net of higher inflation is genuinely negative.
 */
export function convertRate(
  input: EffectiveRateInput,
): EffectiveRateResult | null {
  const { direction, ratePercent, compounding } = input;

  if (!Number.isFinite(ratePercent)) return null;
  if (ratePercent <= -100) return null;

  const perYear = periodsPerYear(compounding);
  const rate = ratePercent / 100;

  const nominal =
    direction === "toEffective" ? rate : toNominal(rate, perYear);
  const effective =
    direction === "toEffective" ? toEffective(rate, perYear) : rate;

  if (!Number.isFinite(nominal) || !Number.isFinite(effective)) return null;

  return {
    nominalPercent: nominal * 100,
    effectivePercent: effective * 100,
    periodicPercent: (nominal / perYear) * 100,
    periodsPerYear: perYear,
    compoundingGainPoints: (effective - nominal) * 100,
    // The table always prices the NOMINAL rate, in both directions: it answers
    // "what would this quoted rate be worth if compounded more often", which
    // is only meaningful from the nominal figure.
    table: COMPOUNDING_ORDER.map((frequency) => {
      const periods = periodsPerYear(frequency);
      const value = toEffective(nominal, periods) * 100;
      return {
        compounding: frequency,
        periodsPerYear: periods,
        effectivePercent: value,
        extraPoints: value - nominal * 100,
      };
    }),
  };
}
