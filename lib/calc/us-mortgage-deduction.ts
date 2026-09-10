/**
 * United States mortgage interest deduction.
 *
 * The naive calculation — annual interest × marginal rate — is wrong for
 * most filers, and wrong in the direction that flatters the mortgage. The
 * deduction is an ITEMISED deduction, so it only does anything to the
 * extent total itemised deductions exceed the standard deduction the filer
 * would otherwise take for free. Since the standard deduction was roughly
 * doubled in 2018, the great majority of filers are better off taking it,
 * and their mortgage interest saves them exactly nothing.
 *
 * So the module computes a MARGINAL benefit:
 *
 *     saving = rate × [ max(itemisedWith, standard) − max(itemisedWithout, standard) ]
 *
 * That expression is the honest one. It returns zero when both totals sit
 * below the standard deduction, it returns the partial benefit when the
 * interest is what pushes a filer over the line, and it returns the full
 * rate × interest only once the other deductions already clear the standard
 * deduction on their own. Multiplying interest by the marginal rate gets the
 * last case right and the first two badly wrong.
 *
 * ## Constants
 *
 * The acquisition-debt cap IS hardcoded: 750.000 USD for debt taken on after
 * 15 December 2017, 1.000.000 USD for older grandfathered debt. Those are
 * fixed in statute and not indexed, so there is no year for them to go stale
 * for — the same test this repo applies elsewhere (see
 * docs/calculator-suite-status.md §8).
 *
 * The standard deduction is an INPUT. It is indexed annually, it is printed
 * on the filer's own return, and a stale table here would silently decide
 * whether the answer is "zero" or "thousands".
 */

/** Debt incurred after 15 December 2017. */
export const ACQUISITION_CAP_CURRENT = 750_000;

/** Grandfathered debt from on or before 15 December 2017. */
export const ACQUISITION_CAP_GRANDFATHERED = 1_000_000;

export type DebtVintage = "current" | "grandfathered";
export type MortgageFilingStatus = "jointOrOther" | "marriedSeparate";

export type MortgageDeductionInput = {
  /** Outstanding mortgage balance, in USD. */
  loanBalance: number;
  /** Annual interest paid, in USD. Box 1 of Form 1098. */
  annualInterest: number;
  /** Which acquisition-debt cap applies. */
  vintage: DebtVintage;
  /** Married-filing-separately filers receive half of either debt cap. */
  filingStatus: MortgageFilingStatus;
  /** Every other itemised deduction added up, in USD. */
  otherItemized: number;
  /** The standard deduction for this filer and year, in USD. */
  standardDeduction: number;
  /** Marginal federal rate, in percent. */
  marginalRatePercent: number;
};

export type MortgageDeductionResult = {
  cap: number;
  /**
   * Share of the balance within the cap. Interest is deductible in this
   * proportion — the excess balance's interest is not deductible at all.
   */
  deductibleShare: number;
  deductibleInterest: number;
  /** Interest disallowed by the cap. */
  disallowedInterest: number;
  /** Itemising with the mortgage interest included. */
  itemizedWithInterest: number;
  /** Itemising without it — what the filer would have anyway. */
  itemizedWithoutInterest: number;
  /** The larger of itemised-with and the standard deduction. */
  deductionTaken: number;
  /** True when the filer itemises at all once interest is counted. */
  itemizes: boolean;
  /** True when the interest is what tips them into itemising. */
  interestCausesItemizing: boolean;
  /**
   * Extra deduction the mortgage interest actually buys, after accounting
   * for the standard deduction the filer gives up.
   */
  effectiveDeduction: number;
  /** Tax saved, in USD. Zero for a filer who takes the standard deduction. */
  taxSaving: number;
  /**
   * Saving as a percent of interest paid. Below the marginal rate for
   * everyone except a filer already itemising without the mortgage.
   */
  savingAsPercentOfInterest: number | null;
  /** Interest net of the saving, in USD. */
  afterTaxInterest: number;
  /**
   * The mortgage's effective rate once the deduction is counted. Equals the
   * stated rate when the deduction is worth nothing.
   */
  effectiveRatePercent: number | null;
  /** The naive answer, for contrast. Always at least the honest one. */
  naiveSaving: number;
  /** How much the naive calculation overstates the benefit. */
  naiveOverstatement: number;
};

/**
 * Compute the benefit.
 *
 * Null on negative money or a marginal rate outside 0–100%. A zero loan
 * balance with non-zero interest is rejected too: interest cannot accrue on
 * nothing, so that combination is a data-entry error, and the cap share it
 * would imply is undefined.
 */
export function computeUsMortgageDeduction(
  input: MortgageDeductionInput,
): MortgageDeductionResult | null {
  const {
    loanBalance,
    annualInterest,
    vintage,
    filingStatus,
    otherItemized,
    standardDeduction,
    marginalRatePercent,
  } = input;

  if (loanBalance < 0 || annualInterest < 0) return null;
  if (otherItemized < 0 || standardDeduction < 0) return null;
  if (marginalRatePercent < 0 || marginalRatePercent > 100) return null;
  if (loanBalance === 0 && annualInterest > 0) return null;

  const rate = marginalRatePercent / 100;
  const fullCap =
    vintage === "grandfathered"
      ? ACQUISITION_CAP_GRANDFATHERED
      : ACQUISITION_CAP_CURRENT;
  const cap = filingStatus === "marriedSeparate" ? fullCap / 2 : fullCap;

  // Interest on the portion of the balance above the cap is not deductible.
  // A zero balance means zero interest (enforced above), so the share is 1
  // by convention rather than 0/0.
  const deductibleShare =
    loanBalance === 0 ? 1 : Math.min(1, cap / loanBalance);
  const deductibleInterest = annualInterest * deductibleShare;
  const disallowedInterest = annualInterest - deductibleInterest;

  const itemizedWithInterest = otherItemized + deductibleInterest;
  const itemizedWithoutInterest = otherItemized;

  // The marginal calculation. Each side takes the better of itemising and
  // the standard deduction, because a filer always gets the standard
  // deduction for free and only itemises when it beats it.
  const deductionTaken = Math.max(itemizedWithInterest, standardDeduction);
  const deductionWithout = Math.max(itemizedWithoutInterest, standardDeduction);
  const effectiveDeduction = deductionTaken - deductionWithout;

  const taxSaving = effectiveDeduction * rate;
  const naiveSaving = deductibleInterest * rate;

  return {
    cap,
    deductibleShare,
    deductibleInterest,
    disallowedInterest,
    itemizedWithInterest,
    itemizedWithoutInterest,
    deductionTaken,
    itemizes: itemizedWithInterest > standardDeduction,
    interestCausesItemizing:
      itemizedWithInterest > standardDeduction &&
      itemizedWithoutInterest <= standardDeduction,
    effectiveDeduction,
    taxSaving,
    savingAsPercentOfInterest:
      annualInterest === 0 ? null : (taxSaving / annualInterest) * 100,
    afterTaxInterest: annualInterest - taxSaving,
    effectiveRatePercent:
      loanBalance === 0
        ? null
        : ((annualInterest - taxSaving) / loanBalance) * 100,
    naiveSaving,
    naiveOverstatement: naiveSaving - taxSaving,
  };
}
