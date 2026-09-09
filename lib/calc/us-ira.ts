/**
 * Traditional IRA against Roth IRA.
 *
 * ## The comparison almost every tool gets wrong
 *
 * Putting 7.500 USD into a traditional IRA and 7.500 USD into a Roth IRA are
 * not the same transaction. The traditional contribution is deductible, so
 * it costs 7.500 minus the tax it saves — at a 24% marginal rate, 5.700 of
 * take-home pay. The Roth contribution costs the full 7.500. Comparing the
 * two side by side therefore compares two different amounts of money and
 * concludes that Roth wins, which it does, because more money was put in.
 *
 * docs/calculator-suite-status.md §8 records this exact defect class in
 * `rent-vs-buy.ts`: the buyer's deposit was counted on one side only, so
 * renting looked cheaper by the whole deposit. **In any two-sided
 * comparison, assert that both sides start from identical wealth.** Here
 * that means the traditional saver invests the tax they saved in a TAXABLE
 * side account, so both paths cost exactly the same after-tax money today.
 *
 * With both sides equalised the answer collapses to one question — is your
 * marginal rate in retirement higher or lower than it is now? — and the
 * module reports the retirement rate at which the two are exactly equal.
 *
 * ## Why the break-even rate is BELOW today's rate
 *
 * With no tax on the side account the break-even retirement rate is exactly
 * today's rate: the two accounts are algebraically identical, which is worth
 * knowing. Once the side account pays capital gains tax the traditional path
 * loses a little, so it wins only if the retirement rate is enough below
 * today's. For a level contribution over n years, with A the annuity-due
 * growth factor of that stream,
 *
 *     breakEven = currentRate x (1 - cgRate x (A - n) / A)
 *
 * because (A - n) is the side account's taxable gain per unit contributed.
 * The module never evaluates that expression: it computes the break-even as
 * `sideAccountAfterTax / balanceAtHorizon`, which is the same thing and
 * cannot drift from the money figures beside it. The test checks the two
 * agree.
 *
 * ## The other framing, which is the real-world one
 *
 * Most savers do not invest the refund. They contribute the maximum to one
 * account or the other. In that world the Roth contribution is economically
 * LARGER — the same nominal amount, bought with more take-home pay — so it
 * shelters more. That is a genuine advantage of Roth at the contribution
 * limit and has nothing to do with tax rates, so the module reports both
 * framings instead of choosing one.
 *
 * ## What it does not model
 *
 * Income phase-outs. Whether a traditional contribution is deductible at all
 * depends on income and on whether a workplace plan covers the saver, and
 * eligibility to contribute to a Roth phases out with income too. Both
 * thresholds are indexed annually, and per the reasoning in
 * `us-dividend-tax.ts` a stale threshold table produces a confidently wrong
 * answer at exactly the incomes near a boundary. The page states them as
 * guidance and the module assumes the contribution is allowed and deductible.
 *
 * The side account is taxed once, on its gain, at the horizon. A real
 * taxable account also pays tax on dividends each year, so this flatters the
 * traditional path slightly — stated here rather than hidden, because the
 * direction of the simplification matters.
 */

import {
  iraCatchUpAllowance,
  RETIREMENT_LIMITS,
  type RetirementLimitYear,
} from "@/lib/calc/us-retirement-limits";

/**
 * Half a percent of the Roth balance, within which the two accounts are
 * reported as equal rather than as a winner.
 *
 * Not a rounding tolerance: a band. The inputs are a guess at a marginal tax
 * rate decades away, so a difference of a quarter of a percent in the final
 * balance is not a finding. Comparing two computed floats with `===` would
 * also make the "equal" verdict unreachable, which is the defect docs §8
 * records against `ddm.ts`.
 */
export const VERDICT_BAND_PERCENT = 0.5;

export type IraVerdict = "traditional" | "roth" | "equal";

export type UsIraInput = {
  year: number;
  /** Age in the contribution year, which decides the IRA catch-up. */
  age: number;
  /** Amount going into the account EACH YEAR, in USD. */
  annualContribution: number;
  /** Marginal income tax rate today, in percent. */
  currentRatePercent: number;
  /** Expected marginal income tax rate when the money comes out, in percent. */
  retirementRatePercent: number;
  /** Expected annual return, in percent. */
  returnPercent: number;
  /** Years until withdrawal. */
  years: number;
  /** Long-term capital gains rate on the side account, in percent. */
  capitalGainsRatePercent: number;
};

export type UsIraResult = {
  params: RetirementLimitYear;
  /** IRA limit for this age: the base limit plus any catch-up. */
  contributionLimit: number;
  catchUpAvailable: number;
  /** Amount over the limit. The page must not price a contribution that is illegal. */
  excessContribution: number;

  /**
   * What one unit contributed each year grows to over the horizon — the
   * annuity-due factor. Reported so the page can explain itself, and so the
   * break-even formula in the docstring can be checked against it.
   */
  growthFactor: number;
  /** Contributed across the whole horizon. */
  totalContributed: number;
  /** Tax the deduction saves EACH YEAR. */
  upfrontTaxSaving: number;
  /** After-tax cost of each path, PER YEAR. Equal by construction in framing B. */
  netCostTraditional: number;
  netCostRoth: number;

  /** Pre-tax balance either account reaches. The same figure for both. */
  balanceAtHorizon: number;
  /** Tax due when the traditional balance is withdrawn. */
  withdrawalTax: number;
  /** Traditional after that tax, with no side account. */
  traditionalAfterTax: number;
  /** Roth after tax, which is the whole balance. */
  rothAfterTax: number;

  /** Framing B: the refund, invested in a taxable account. Total contributed. */
  sideAccountContribution: number;
  sideAccountAtHorizon: number;
  sideAccountGain: number;
  sideAccountTax: number;
  sideAccountAfterTax: number;
  /** Traditional plus that side account: the equal-cost comparison. */
  traditionalTotalEqualCost: number;
  /** Roth minus traditional, equal cost. Positive means Roth wins. */
  rothAdvantageEqualCost: number;
  verdict: IraVerdict;
  /**
   * Retirement rate at which the two paths tie, in percent. Null when
   * nothing was contributed, so there is nothing to tie.
   */
  breakEvenRetirementRatePercent: number | null;

  /** Framing A: same nominal contribution, no side account. */
  rothAdvantageSameContribution: number;
  /** What the Roth's larger real contribution costs today. */
  extraCostOfRoth: number;
  /**
   * The Roth contribution expressed as the traditional contribution of
   * equal after-tax cost: 7.500 of Roth money is worth this much pre-tax.
   * Null at a 100% tax rate, where the conversion divides by zero.
   */
  rothAsPreTaxContribution: number | null;
};

/**
 * Compare the two accounts.
 *
 * Null on a year the limits table does not cover, an age outside 0–120, a
 * negative contribution, a horizon outside 0–70 whole years, a tax rate
 * outside 0–100%, or a return outside −100–100%.
 */
export function computeUsIra(input: UsIraInput): UsIraResult | null {
  const {
    year,
    age,
    annualContribution,
    currentRatePercent,
    retirementRatePercent,
    returnPercent,
    years,
    capitalGainsRatePercent,
  } = input;

  const params = RETIREMENT_LIMITS[year];
  if (params === undefined) return null;

  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  if (!Number.isFinite(annualContribution) || annualContribution < 0) return null;
  if (!Number.isFinite(years) || !Number.isInteger(years)) return null;
  if (years < 0 || years > 70) return null;
  for (const rate of [
    currentRatePercent,
    retirementRatePercent,
    capitalGainsRatePercent,
  ]) {
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return null;
  }
  if (!Number.isFinite(returnPercent) || returnPercent < -100 || returnPercent > 100) {
    return null;
  }

  const catchUpAvailable = iraCatchUpAllowance(params, age);
  const contributionLimit = params.ira + catchUpAvailable;

  const currentRate = currentRatePercent / 100;
  const retirementRate = retirementRatePercent / 100;
  const capitalGainsRate = capitalGainsRatePercent / 100;
  // What one unit contributed at the start of every year grows to: the
  // annuity-due factor, accumulated the same way `us-hsa.ts` and
  // `us-401k.ts` accumulate, so all three agree on the convention.
  const rate = returnPercent / 100;
  let growthFactor = 0;
  for (let index = 0; index < years; index += 1) {
    growthFactor = (growthFactor + 1) * (1 + rate);
  }

  const balanceAtHorizon = annualContribution * growthFactor;
  const withdrawalTax = balanceAtHorizon * retirementRate;
  const traditionalAfterTax = balanceAtHorizon - withdrawalTax;
  const rothAfterTax = balanceAtHorizon;

  const upfrontTaxSaving = annualContribution * currentRate;
  const netCostTraditional = annualContribution - upfrontTaxSaving;
  const netCostRoth = annualContribution;

  // Framing B. The refund goes into a taxable account EVERY year, so both
  // paths cost the same after-tax money in every year:
  // netCostTraditional + upfrontTaxSaving is exactly annualContribution,
  // which is netCostRoth.
  const sideAccountContribution = upfrontTaxSaving * years;
  const sideAccountAtHorizon = upfrontTaxSaving * growthFactor;
  // Only the GAIN is taxed, and only at the horizon. A real taxable account
  // also pays tax on dividends every year, so this is the generous reading
  // of the traditional path — see the module docstring.
  const sideAccountGain = Math.max(0, sideAccountAtHorizon - sideAccountContribution);
  const sideAccountTax = sideAccountGain * capitalGainsRate;
  const sideAccountAfterTax = sideAccountAtHorizon - sideAccountTax;

  const traditionalTotalEqualCost = traditionalAfterTax + sideAccountAfterTax;
  const rothAdvantageEqualCost = rothAfterTax - traditionalTotalEqualCost;

  const band = Math.abs(rothAfterTax) * (VERDICT_BAND_PERCENT / 100);
  const verdict: IraVerdict =
    Math.abs(rothAdvantageEqualCost) <= band
      ? "equal"
      : rothAdvantageEqualCost > 0
        ? "roth"
        : "traditional";

  // The retirement rate that ties them. Solving
  //   C x G x (1 - t) + sideNet = C x G
  // gives t = sideNet / (C x G), which reduces to the closed form in the
  // docstring. Computed from the module's own figures so the two cannot
  // drift apart.
  const breakEvenRetirementRatePercent =
    balanceAtHorizon <= 0 ? null : (sideAccountAfterTax / balanceAtHorizon) * 100;

  return {
    params,
    contributionLimit,
    catchUpAvailable,
    excessContribution: Math.max(0, annualContribution - contributionLimit),

    growthFactor,
    totalContributed: annualContribution * years,
    upfrontTaxSaving,
    netCostTraditional,
    netCostRoth,

    balanceAtHorizon,
    withdrawalTax,
    traditionalAfterTax,
    rothAfterTax,

    sideAccountContribution,
    sideAccountAtHorizon,
    sideAccountGain,
    sideAccountTax,
    sideAccountAfterTax,
    traditionalTotalEqualCost,
    rothAdvantageEqualCost,
    verdict,
    breakEvenRetirementRatePercent,

    // Framing A: the same nominal contribution to either account, with the
    // refund spent rather than invested. Roth then wins by the whole
    // withdrawal tax — because it is the bigger contribution, not because
    // the account is better.
    rothAdvantageSameContribution: rothAfterTax - traditionalAfterTax,
    extraCostOfRoth: netCostRoth - netCostTraditional,
    rothAsPreTaxContribution:
      currentRate >= 1 ? null : annualContribution / (1 - currentRate),
  };
}
