/**
 * United States payroll tax — FICA.
 *
 * Three separate taxes that get lumped together as "payroll tax" and behave
 * quite differently:
 *
 * - Social Security, 6,2%, but only on wages up to an annual base. Above the
 *   base the marginal rate on this tax is ZERO, which is the whole point of
 *   the tool: a high earner's payroll tax rate falls as income rises.
 * - Medicare, 1,45%, with NO cap. It applies to every dollar.
 * - Additional Medicare, 0,9%, on wages above a threshold. That threshold is
 *   fixed in statute and has never been indexed for inflation, so it catches
 *   more people every year — worth stating rather than burying.
 *
 * The employer pays a matching 6,2% + 1,45% but NOT the additional 0,9%.
 * Self-employed people pay both halves, which is what the SECA rate is; they
 * also get a deduction that this module does not model, and the docstring
 * says so rather than the code pretending otherwise.
 *
 * Parameters are transcribed from published SSA and IRS figures. Transcribed
 * constants are a known defect class in this repo (see
 * docs/calculator-suite-status.md §8), so they live here in one table with
 * the year attached, and the page tells the reader to verify the current
 * year against the IRS.
 */

export type FilingStatus = "single" | "married" | "marriedSeparate" | "head";

export type PayrollYearParams = {
  year: number;
  /** Wages above this pay no more Social Security tax. */
  socialSecurityWageBase: number;
  socialSecurityRate: number;
  medicareRate: number;
  additionalMedicareRate: number;
  /** Not indexed for inflation — fixed since 2013. */
  additionalMedicareThreshold: Record<FilingStatus, number>;
};

/**
 * Rates have been 6,2% and 1,45% since 1990; the wage base is what moves.
 * The 0,9% surtax and its thresholds date from 2013 and the thresholds have
 * never been adjusted.
 */
export const PAYROLL_YEARS: Record<number, PayrollYearParams> = {
  2025: {
    year: 2025,
    socialSecurityWageBase: 176_100,
    socialSecurityRate: 6.2,
    medicareRate: 1.45,
    additionalMedicareRate: 0.9,
    additionalMedicareThreshold: {
      single: 200_000,
      married: 250_000,
      marriedSeparate: 125_000,
      head: 200_000,
    },
  },
  2026: {
    year: 2026,
    socialSecurityWageBase: 184_500,
    socialSecurityRate: 6.2,
    medicareRate: 1.45,
    additionalMedicareRate: 0.9,
    additionalMedicareThreshold: {
      single: 200_000,
      married: 250_000,
      marriedSeparate: 125_000,
      head: 200_000,
    },
  },
};

export const PAYROLL_YEAR_ORDER = [2026, 2025] as const;

/** Schedule SE line 4a: the regular-method share of net profit exposed to SE tax. */
export const SELF_EMPLOYMENT_NET_EARNINGS_FACTOR = 0.9235;

export type PayrollInput = {
  /** Employee FICA wages, or net self-employment profit, in USD. */
  wages: number;
  filingStatus: FilingStatus;
  year: number;
  /**
   * Self-employed people pay the employee AND employer halves. This doubles
   * the Social Security and Medicare portions but not the 0,9% surtax.
   */
  selfEmployed: boolean;
};

export type PayrollResult = {
  params: PayrollYearParams;
  /** Wages, or 92,35% of net self-employment profit under the regular method. */
  taxBase: number;
  /** Wages actually subject to Social Security tax — capped at the base. */
  socialSecurityWages: number;
  socialSecurityTax: number;
  medicareTax: number;
  /** Wages above the surtax threshold. Zero for most filers. */
  additionalMedicareWages: number;
  additionalMedicareTax: number;
  /** What the worker pays. */
  employeeTotal: number;
  /** What the employer pays — 6,2% + 1,45%, never the surtax. */
  employerTotal: number;
  /** Employee plus employer. For the self-employed these are the same person. */
  combinedTotal: number;
  /** Employee tax as a percent of gross wages. */
  effectiveRatePercent: number | null;
  /**
   * The employee rate on the NEXT dollar earned. Falls once the wage base is
   * passed, which is the opposite of how income tax behaves.
   */
  marginalRatePercent: number;
  /** True when wages exceed the Social Security base. */
  aboveWageBase: boolean;
  /** True when the 0,9% surtax applies. */
  aboveSurtaxThreshold: boolean;
  /**
   * Social Security tax that would have been due had there been no cap.
   * The difference is what the cap is worth to this earner.
   */
  cappedSaving: number;
};

/**
 * Compute the year's payroll tax.
 *
 * Null on negative wages or a year the table does not cover — an unknown
 * year must not silently fall back to a different year's wage base.
 */
export function computeUsPayroll(input: PayrollInput): PayrollResult | null {
  const { wages, filingStatus, year, selfEmployed } = input;
  if (!Number.isFinite(wages) || wages < 0) return null;

  const params = PAYROLL_YEARS[year];
  if (params === undefined) return null;

  const half = selfEmployed ? 2 : 1;
  // Schedule SE does not levy 15,3% on the whole Schedule C profit. Under
  // the regular method, line 4a first multiplies it by 92,35%.
  const taxBase = selfEmployed
    ? wages * SELF_EMPLOYMENT_NET_EARNINGS_FACTOR
    : wages;

  const socialSecurityWages = Math.min(
    taxBase,
    params.socialSecurityWageBase,
  );
  const socialSecurityTax =
    socialSecurityWages * (params.socialSecurityRate / 100) * half;
  const medicareTax = taxBase * (params.medicareRate / 100) * half;

  const threshold = params.additionalMedicareThreshold[filingStatus];
  const additionalMedicareWages = Math.max(0, taxBase - threshold);
  // The surtax is on the worker alone: an employer never matches it, and a
  // self-employed person does not pay it twice either.
  const additionalMedicareTax =
    additionalMedicareWages * (params.additionalMedicareRate / 100);

  const employeeTotal = socialSecurityTax + medicareTax + additionalMedicareTax;
  // A self-employed filer has already been charged both halves above, so
  // there is no separate employer share to add.
  const employerTotal = selfEmployed
    ? 0
    : socialSecurityWages * (params.socialSecurityRate / 100) +
      taxBase * (params.medicareRate / 100);

  const aboveWageBase = taxBase > params.socialSecurityWageBase;
  const aboveSurtaxThreshold = taxBase > threshold;

  // The NEXT dollar, not the last one. At wages exactly equal to the wage
  // base the Social Security maximum is already paid, so the next dollar
  // costs no Social Security tax; at wages exactly equal to the threshold
  // the next dollar is the first one "in excess of" it and does carry the
  // surtax. Both need >=. The flags above keep their own strict meaning
  // ("wages EXCEED the base / the threshold"), which is correct for the
  // notices and for the surtax wage computation, and must not be reused for
  // this next-dollar question.
  const marginalRatePercent =
    ((taxBase >= params.socialSecurityWageBase
      ? 0
      : params.socialSecurityRate * half) +
    params.medicareRate * half +
    (taxBase >= threshold ? params.additionalMedicareRate : 0)) *
    (selfEmployed ? SELF_EMPLOYMENT_NET_EARNINGS_FACTOR : 1);

  const uncappedSocialSecurity =
    taxBase * (params.socialSecurityRate / 100) * half;

  return {
    params,
    taxBase,
    socialSecurityWages,
    socialSecurityTax,
    medicareTax,
    additionalMedicareWages,
    additionalMedicareTax,
    employeeTotal,
    employerTotal,
    combinedTotal: employeeTotal + employerTotal,
    effectiveRatePercent: wages === 0 ? null : (employeeTotal / wages) * 100,
    marginalRatePercent,
    aboveWageBase,
    aboveSurtaxThreshold,
    cappedSaving: uncappedSocialSecurity - socialSecurityTax,
  };
}
