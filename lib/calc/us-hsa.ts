/**
 * United States Health Savings Account.
 *
 * The HSA is the only account in the US code with a TRIPLE tax advantage:
 * contributions are deductible, growth is untaxed, and withdrawals for
 * qualified medical expenses are untaxed. Every other tax-advantaged
 * account gives up one of the three.
 *
 * There is a fourth advantage that is routinely left out and that this
 * module makes explicit: contributions made through a section 125 cafeteria
 * plan also escape FICA. That is 7,65% for an employee below both relevant
 * thresholds, but less after the Social Security wage base and potentially
 * different around the Additional Medicare threshold. An IRA or a 401(k)
 * deferral does NOT escape FICA.
 *
 * ## After 65
 *
 * From 65, non-medical withdrawals stop attracting the 20% penalty and are
 * simply taxed as income — so the account behaves like a traditional IRA
 * for anything that is not a medical expense, and strictly better for
 * anything that is. Before 65, a non-medical withdrawal is taxed AND
 * penalised, which is why the module reports the two cases separately
 * rather than averaging them into one "expected" figure.
 *
 * Contribution limits are transcribed from published IRS figures and live in
 * one dated table, per docs/calculator-suite-status.md §8. An unknown year
 * returns null rather than borrowing another year's limit.
 */

import {
  PAYROLL_YEARS,
  type FilingStatus,
  type PayrollYearParams,
} from "@/lib/calc/us-payroll";

export type HsaCoverage = "selfOnly" | "family";

export type HsaYearParams = {
  year: number;
  selfOnlyLimit: number;
  familyLimit: number;
  /** Additional amount allowed from age 55. Fixed at 1.000 by statute. */
  catchUpLimit: number;
  catchUpAge: number;
};

export const HSA_YEARS: Record<number, HsaYearParams> = {
  2025: {
    year: 2025,
    selfOnlyLimit: 4_300,
    familyLimit: 8_550,
    catchUpLimit: 1_000,
    catchUpAge: 55,
  },
  2026: {
    year: 2026,
    selfOnlyLimit: 4_400,
    familyLimit: 8_750,
    catchUpLimit: 1_000,
    catchUpAge: 55,
  },
};

export const HSA_YEAR_ORDER = [2026, 2025] as const;

/** Penalty on a non-medical withdrawal before 65. */
export const EARLY_WITHDRAWAL_PENALTY_PERCENT = 20;

/** Age at which the penalty stops applying. */
export const PENALTY_FREE_AGE = 65;

export type HsaInput = {
  year: number;
  coverage: HsaCoverage;
  /** Age at the end of the tax year, which decides the catch-up allowance. */
  age: number;
  /** Months during which the holder was HSA-eligible on the first day. */
  eligibleMonths: number;
  /** Treat the holder as eligible all year under the December last-month rule. */
  useLastMonthRule: boolean;
  /** What the account holder plans to put in this year, in USD. */
  contribution: number;
  /** Employer's contribution, in USD. Counts against the SAME limit. */
  employerContribution: number;
  /** Marginal federal income tax rate, in percent. */
  federalRatePercent: number;
  /** State income tax rate, in percent. Some states do not follow the federal treatment. */
  stateRatePercent: number;
  /** True only for a section 125 cafeteria-plan salary reduction. */
  viaPayroll: boolean;
  /** Annual FICA wages before the HSA salary reduction. */
  annualWagesBeforeHsa: number;
  filingStatus: FilingStatus;
  /** Starting balance, in USD. */
  currentBalance: number;
  /** Expected annual return, in percent. */
  returnPercent: number;
  /** Years until the money is drawn. */
  years: number;
};

export type HsaResult = {
  params: HsaYearParams;
  /** Published full-year limit for this coverage type, before catch-up. */
  fullYearBaseLimit: number;
  /** Fraction of the annual limit available after monthly eligibility. */
  eligibilityFactor: number;
  lastMonthRuleApplied: boolean;
  /** Actual base limit after monthly eligibility or the last-month rule. */
  baseLimit: number;
  /** Catch-up allowance actually available at this age. */
  catchUpAvailable: number;
  /** Total that may be contributed from all sources. */
  totalLimit: number;
  /** Employee plus employer. */
  totalContribution: number;
  /** Amount over the limit. Excess is taxable and penalised if not withdrawn. */
  excessContribution: number;
  /** Room left, in USD. */
  remainingRoom: number;
  /** Income tax avoided on the employee's contribution. */
  incomeTaxSaved: number;
  /** FICA avoided — payroll contributions only. */
  ficaSaved: number;
  /** FICA wages remaining after a qualifying payroll contribution. */
  wagesAfterHsa: number;
  /** Both, added up. This is the first of the three advantages. */
  firstYearTaxSaved: number;
  /** Effective cost of the employee's contribution after all tax saved. */
  netCostOfContribution: number;
  /** Balance at the horizon, contributing this amount every year. */
  projectedBalance: number;
  /** Total contributed across the horizon, employee and employer. */
  totalContributed: number;
  /** Growth, which is the second advantage — untaxed. */
  projectedGrowth: number;
  /**
   * Tax that growth would have attracted in a taxable account, at the
   * income rate. An upper bound on the second advantage's value.
   */
  taxOnGrowthIfTaxable: number;
  /** Withdrawn for medical care: nothing is owed. Third advantage. */
  medicalWithdrawalTax: number;
  /** Withdrawn for anything else, at the age given. */
  nonMedicalTax: number;
  nonMedicalPenalty: number;
  nonMedicalNet: number;
  /** Age at the horizon, which decides whether the penalty applies. */
  ageAtHorizon: number;
  penaltyApplies: boolean;
};

function employeeFica(
  wages: number,
  params: PayrollYearParams,
  filingStatus: FilingStatus,
): number {
  const socialSecurity =
    Math.min(wages, params.socialSecurityWageBase) *
    (params.socialSecurityRate / 100);
  const medicare = wages * (params.medicareRate / 100);
  const additionalMedicare =
    Math.max(0, wages - params.additionalMedicareThreshold[filingStatus]) *
    (params.additionalMedicareRate / 100);
  return socialSecurity + medicare + additionalMedicare;
}

/**
 * Project the account.
 *
 * Null on negative money, an age outside 0–120, a horizon outside 0–70
 * years, a rate outside −100–100%, tax rates outside 0–100%, or a year the
 * table does not cover.
 */
export function computeUsHsa(input: HsaInput): HsaResult | null {
  const {
    year,
    coverage,
    age,
    eligibleMonths,
    useLastMonthRule,
    contribution,
    employerContribution,
    federalRatePercent,
    stateRatePercent,
    viaPayroll,
    annualWagesBeforeHsa,
    filingStatus,
    currentBalance,
    returnPercent,
    years,
  } = input;

  const params = HSA_YEARS[year];
  if (params === undefined) return null;

  if (contribution < 0 || employerContribution < 0) return null;
  if (currentBalance < 0) return null;
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  if (
    !Number.isFinite(eligibleMonths) ||
    !Number.isInteger(eligibleMonths) ||
    eligibleMonths < 0 ||
    eligibleMonths > 12
  ) {
    return null;
  }
  if (useLastMonthRule && eligibleMonths === 0) return null;
  if (!Number.isFinite(annualWagesBeforeHsa) || annualWagesBeforeHsa < 0) {
    return null;
  }
  if (!Number.isFinite(years) || years < 0 || years > 70) return null;
  if (!Number.isInteger(years)) return null;
  if (federalRatePercent < 0 || federalRatePercent > 100) return null;
  if (stateRatePercent < 0 || stateRatePercent > 100) return null;
  if (returnPercent < -100 || returnPercent > 100) return null;

  const fullYearBaseLimit =
    coverage === "family" ? params.familyLimit : params.selfOnlyLimit;
  const lastMonthRuleApplied = useLastMonthRule && eligibleMonths < 12;
  const eligibilityFactor = useLastMonthRule ? 1 : eligibleMonths / 12;
  const baseLimit = fullYearBaseLimit * eligibilityFactor;
  const catchUpAvailable =
    age >= params.catchUpAge ? params.catchUpLimit * eligibilityFactor : 0;
  const totalLimit = baseLimit + catchUpAvailable;

  // The employer's money counts against the SAME limit, not a separate one.
  // Treating them as two limits is the most common HSA mistake and produces
  // an excess contribution the holder does not know they made.
  const totalContribution = contribution + employerContribution;
  const excessContribution = Math.max(0, totalContribution - totalLimit);
  const remainingRoom = Math.max(0, totalLimit - totalContribution);

  const federalRate = federalRatePercent / 100;
  const stateRate = stateRatePercent / 100;

  // Tax is saved only on what is actually allowed in. An excess contribution
  // gets no deduction, so crediting the full amount would overstate it.
  const deductible = Math.min(contribution, Math.max(0, totalLimit - employerContribution));
  const incomeTaxSaved = deductible * (federalRate + stateRate);
  // Only a section 125 cafeteria-plan salary reduction escapes employment
  // taxes. Price the saving as the difference between the two actual FICA
  // bills so the Social Security cap and Additional Medicare threshold are
  // respected rather than applying a blanket 7,65%.
  const payrollContribution = viaPayroll
    ? Math.min(deductible, annualWagesBeforeHsa)
    : 0;
  const wagesAfterHsa = annualWagesBeforeHsa - payrollContribution;
  const payrollParams = PAYROLL_YEARS[year];
  if (payrollParams === undefined) return null;
  const ficaSaved = viaPayroll
    ? employeeFica(annualWagesBeforeHsa, payrollParams, filingStatus) -
      employeeFica(wagesAfterHsa, payrollParams, filingStatus)
    : 0;
  const firstYearTaxSaved = incomeTaxSaved + ficaSaved;

  const rate = returnPercent / 100;

  // Contributions land at the start of each year and compound with the
  // balance. Year one's contribution therefore earns a full year's return.
  let balance = currentBalance;
  for (let index = 0; index < years; index += 1) {
    balance = (balance + totalContribution) * (1 + rate);
  }
  const projectedBalance = balance;
  const totalContributed = totalContribution * years;
  const projectedGrowth = projectedBalance - currentBalance - totalContributed;

  const taxOnGrowthIfTaxable = Math.max(0, projectedGrowth) * federalRate;

  const ageAtHorizon = age + years;
  const penaltyApplies = ageAtHorizon < PENALTY_FREE_AGE;

  // Medical withdrawals are untaxed at any age — the third advantage.
  const medicalWithdrawalTax = 0;
  const nonMedicalTax = projectedBalance * (federalRate + stateRate);
  const nonMedicalPenalty = penaltyApplies
    ? projectedBalance * (EARLY_WITHDRAWAL_PENALTY_PERCENT / 100)
    : 0;

  return {
    params,
    fullYearBaseLimit,
    eligibilityFactor,
    lastMonthRuleApplied,
    baseLimit,
    catchUpAvailable,
    totalLimit,
    totalContribution,
    excessContribution,
    remainingRoom,
    incomeTaxSaved,
    ficaSaved,
    wagesAfterHsa,
    firstYearTaxSaved,
    netCostOfContribution: contribution - firstYearTaxSaved,
    projectedBalance,
    totalContributed,
    projectedGrowth,
    taxOnGrowthIfTaxable,
    medicalWithdrawalTax,
    nonMedicalTax,
    nonMedicalPenalty,
    nonMedicalNet: projectedBalance - nonMedicalTax - nonMedicalPenalty,
    ageAtHorizon,
    penaltyApplies,
  };
}
