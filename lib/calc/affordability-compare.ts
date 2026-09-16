/**
 * Two affordability scenarios, side by side.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `affordability-compare.test.ts`.
 *
 * ORIGINAL ROW 7 asks for a real baseline-versus-changed comparison on the
 * same model — "so kịch bản" in the plan's own visual line — rather than
 * another link out to a second tool. What that needs beyond `computeAffordability`
 * is small and entirely bookkeeping, which is exactly why it belongs here and
 * not in JSX:
 *
 * - WHICH inputs differ, so the page can name the changed question instead of
 *   showing two figures and leaving the reader to guess what moved;
 * - the differences in the three figures the page leads with;
 * - whether the two sides answer the SAME question at all.
 *
 * NO NEW FINANCIAL MODEL. Every figure compared here is one `computeAffordability`
 * already returned. The arithmetic is subtraction.
 *
 * WHAT THIS IS NOT. A comparison held in memory on one page is a transient
 * snapshot the reader took, not a saved plan, not a bank's acceptance and not a
 * persisted profile. The module deliberately has no storage, no dates and no
 * identifiers: a caller that reloads the page has nothing to restore, which is
 * the truthful behaviour for a site that stores nothing.
 */

import type {
  AffordabilityInput,
  AffordabilityResult,
} from "@/lib/calc/affordability";

/** A captured scenario: the inputs, and what the model made of them. */
export type AffordabilityScenario = {
  input: AffordabilityInput;
  result: AffordabilityResult;
};

/**
 * The inputs compared, in the order a reader would scan them.
 *
 * An explicit list rather than `Object.keys`: a key added to
 * `AffordabilityInput` should be a deliberate decision about whether changing
 * it is worth naming, and TypeScript makes the list exhaustive.
 */
export const COMPARED_KEYS = [
  "mode",
  "monthlyIncome",
  "monthlyNetIncome",
  "essentialExpenses",
  "monthlyBuffer",
  "monthlyDebts",
  "downPayment",
  "cashReserve",
  "purchaseCostPercent",
  "assumedMaxLtvPercent",
  "annualRatePercent",
  "termMonths",
  "monthlyHousingCosts",
  "housingRatioPercent",
  "totalDebtRatioPercent",
] as const satisfies readonly (keyof AffordabilityInput)[];

export type ComparedKey = (typeof COMPARED_KEYS)[number];

export type AffordabilityComparison = {
  /** The inputs that differ, in `COMPARED_KEYS` order. Empty when identical. */
  changedKeys: ComparedKey[];
  /**
   * True when the two sides answer DIFFERENT questions.
   *
   * A household budget and a ratio ceiling on gross income are not two answers
   * to one question, and presenting their difference as an effect of anything
   * the reader changed would be wrong. The page has to say so.
   */
  modeChanged: boolean;
  /**
   * True when EITHER side rests on essential expenses that were not supplied.
   *
   * The unknown does not become known by being compared, so the qualification
   * carries into the comparison.
   */
  conclusionLimited: boolean;
  /** `current − baseline`, signed, on the figures the page leads with. */
  priceChange: number;
  loanChange: number;
  /** The monthly BUDGET for principal and interest. */
  paymentChange: number;
  /** The instalment the loan actually used would charge. A different figure. */
  expectedPaymentChange: number;
  /** The capacity figure, which can move when the usable price does not. */
  paymentSupportedLoanChange: number;
  /** True when a different ceiling set the price on the two sides. */
  priceBindingChanged: boolean;
  /** True when a different monthly limit bound on the two sides. */
  bindingLimitChanged: boolean;
};

/**
 * Normalize one input value for comparison.
 *
 * `undefined` stays `undefined` — an unsupplied essential-expense figure is a
 * state of its own and must not compare equal to a stated 0, which is the same
 * distinction `computeAffordability` is careful about.
 */
function valueOf(
  input: AffordabilityInput,
  key: ComparedKey,
): string | number | undefined {
  const value = input[key];
  return value === undefined ? undefined : value;
}

/**
 * Compare a captured scenario with the current one.
 *
 * Never null: both sides already hold a computed result, so there is nothing
 * left to reject. Two identical scenarios give an empty `changedKeys` and zero
 * differences, which is a true answer and lets the page say "nothing has
 * changed yet" rather than inventing a comparison.
 */
export function compareAffordabilityScenarios(
  baseline: AffordabilityScenario,
  current: AffordabilityScenario,
): AffordabilityComparison {
  const changedKeys = COMPARED_KEYS.filter(
    (key) => valueOf(baseline.input, key) !== valueOf(current.input, key),
  );

  return {
    changedKeys: [...changedKeys],
    modeChanged: baseline.result.mode !== current.result.mode,
    conclusionLimited:
      baseline.result.conclusionLimited || current.result.conclusionLimited,
    priceChange: current.result.maxPrice - baseline.result.maxPrice,
    loanChange: current.result.maxLoan - baseline.result.maxLoan,
    paymentChange:
      current.result.affordablePrincipalInterest -
      baseline.result.affordablePrincipalInterest,
    expectedPaymentChange:
      current.result.expectedPrincipalInterest -
      baseline.result.expectedPrincipalInterest,
    paymentSupportedLoanChange:
      current.result.paymentSupportedLoan -
      baseline.result.paymentSupportedLoan,
    priceBindingChanged:
      baseline.result.priceBinding !== current.result.priceBinding,
    bindingLimitChanged:
      baseline.result.bindingLimit !== current.result.bindingLimit,
  };
}
