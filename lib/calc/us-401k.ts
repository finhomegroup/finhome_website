/**
 * United States 401(k) contributions and the employer match.
 *
 * The arithmetic is easy. What the tool exists for is one number that is
 * routinely thrown away: the employer match an employee does not claim
 * because they defer less than the match formula rewards. It is the only
 * place in personal finance where a guaranteed 50% or 100% return is
 * available, uncapped by market risk, and it is forfeited by inaction.
 *
 * ## Four ceilings, and they bind on different things
 *
 * Everything here follows one rule: a limit applies to the thing the statute
 * says it applies to, never to the total.
 *
 * - **402(g)**, the elective deferral limit, binds the EMPLOYEE's own money
 *   only. An employer match is not a deferral and does not count against it.
 *   Treating one combined limit is the most common 401(k) misunderstanding
 *   and it makes a match look like it crowds out the employee's own saving.
 * - **415(c)**, annual additions, binds deferral + match + non-elective
 *   together — but catch-up contributions sit OUTSIDE it. So the test here
 *   is on the non-catch-up part, which is why `catchUpUsed` is computed
 *   before the test rather than after.
 * - **401(a)(17)**, compensation, makes pay above the ceiling invisible to
 *   the plan. A match of "100% up to 6% of pay" therefore stops growing at
 *   6% of the CEILING, not 6% of the salary. This is the limit that surprises
 *   high earners, and applying it to the match while forgetting it applies to
 *   the deferral election too would overstate what a 500.000 USD earner can
 *   put in.
 * - **The match formula's own limit**, which is not a statutory figure at all
 *   but the most binding one for most people.
 *
 * ## Where the tax saving is NOT what it looks like
 *
 * SECURE 2.0 requires catch-up contributions to be Roth once prior-year
 * wages from the employer pass a threshold. Those dollars still go in, and
 * they are still catch-up, but they are not deductible. The module applies
 * that rule from `us-retirement-limits.ts` rather than deducting the whole
 * deferral, because the readers it affects — older and higher-paid — are
 * exactly the readers using catch-up at all.
 *
 * Ordering in the projection matches `us-hsa.ts`: the year's whole
 * contribution lands at the start and earns a full year's return.
 */

import {
  catchUpAllowance,
  catchUpMustBeRoth,
  catchUpTier,
  RETIREMENT_LIMITS,
  type CatchUpTier,
  type RetirementLimitYear,
} from "@/lib/calc/us-retirement-limits";

export type Us401kInput = {
  year: number;
  /** Age during the contribution year, which decides the catch-up tier. */
  age: number;
  /** Gross annual salary, in USD. */
  annualSalary: number;
  /** The employee's own deferral, as a percent of plan compensation. */
  deferralPercent: number;
  /** Cents matched per dollar deferred, as a percent: 100 is dollar for dollar. */
  employerMatchPercent: number;
  /** The match applies only to deferrals up to this percent of pay. */
  employerMatchLimitPercent: number;
  /** Profit sharing or a non-elective contribution, as a percent of pay. */
  employerExtraPercent: number;
  /** Marginal federal + state income tax rate, in percent. */
  marginalRatePercent: number;
  /** Expected annual return, in percent. */
  returnPercent: number;
  /** Years of contributing at this rate. */
  years: number;
};

export type Us401kResult = {
  params: RetirementLimitYear;
  /** Pay the plan can see: salary capped at the 401(a)(17) ceiling. */
  planCompensation: number;
  /** True when salary exceeds that ceiling, so the match has stopped growing. */
  compensationCapped: boolean;

  catchUpTier: CatchUpTier;
  catchUpAvailable: number;
  /** 402(g) limit plus the catch-up available at this age. */
  deferralLimit: number;
  /** What the elected percent asks for, before any limit. */
  electedDeferral: number;
  /** What can actually go in. */
  deferral: number;
  /** True when 402(g) plus catch-up cut the election short. */
  deferralCapped: boolean;
  /** The part of `deferral` that is catch-up, i.e. above the 402(g) limit. */
  catchUpUsed: number;
  /** Deferral as a percent of plan compensation, after any cap. */
  effectiveDeferralPercent: number | null;

  employerMatch: number;
  /** The most this formula would ever pay, at a full deferral. */
  maxEmployerMatch: number;
  /**
   * Match forfeited by deferring less than the formula rewards. THE number
   * this tool exists for.
   */
  unclaimedMatch: number;
  /** Deferral percent that would claim the whole match. */
  matchThresholdPercent: number;
  /** The same threshold in USD: what has to be deferred to claim it all. */
  matchThresholdAmount: number;
  employerExtra: number;

  /** Deferral + match + non-elective. */
  totalContribution: number;
  /** The 415(c) test's base: total additions excluding catch-up. */
  additionsForLimit: number;
  /** Amount over the 415(c) ceiling. Zero for almost every reader. */
  excessAdditions: number;

  /** Deferral dollars that attract a deduction this year. */
  deductibleDeferral: number;
  /** True when this year's rules force the catch-up into Roth. */
  catchUpForcedRoth: boolean;
  incomeTaxSaved: number;
  /** What the deferral costs out of take-home pay. */
  netCostOfDeferral: number;
  /** The match as a percent of the employee's own money. */
  matchReturnPercent: number | null;

  /** Balance after `years`, contributing this much every year. */
  projectedBalance: number;
  /** The same projection with no employer match at all. */
  projectedWithoutMatch: number;
  /** What the match is worth at the horizon: the difference of the two. */
  matchValueAtHorizon: number;
  /**
   * What the FORFEITED match would have been worth at the horizon. The cost
   * of doing nothing, which is the figure a percentage cannot convey.
   */
  unclaimedMatchAtHorizon: number;
  totalContributed: number;
};

/** Compound a level annual contribution that lands at the start of each year. */
function grow(annual: number, rate: number, years: number): number {
  let balance = 0;
  for (let index = 0; index < years; index += 1) {
    balance = (balance + annual) * (1 + rate);
  }
  return balance;
}

/**
 * Work out the year's contributions, the match, the tax and the horizon.
 *
 * Null on a year the limits table does not cover, an age outside 0–120, a
 * negative salary, a horizon outside 0–70 whole years, a deferral or match
 * limit outside 0–100%, a match rate outside 0–200%, or a tax rate outside
 * 0–100%.
 */
export function computeUs401k(input: Us401kInput): Us401kResult | null {
  const {
    year,
    age,
    annualSalary,
    deferralPercent,
    employerMatchPercent,
    employerMatchLimitPercent,
    employerExtraPercent,
    marginalRatePercent,
    returnPercent,
    years,
  } = input;

  const params = RETIREMENT_LIMITS[year];
  if (params === undefined) return null;

  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  if (!Number.isFinite(annualSalary) || annualSalary < 0) return null;
  if (!Number.isFinite(years) || !Number.isInteger(years)) return null;
  if (years < 0 || years > 70) return null;
  for (const percent of [
    deferralPercent,
    employerMatchLimitPercent,
    employerExtraPercent,
    marginalRatePercent,
  ]) {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;
  }
  // A match above 100% is unusual but real — some plans pay 150% on the
  // first few percent. Above 200% it is a typo, not a plan.
  if (
    !Number.isFinite(employerMatchPercent) ||
    employerMatchPercent < 0 ||
    employerMatchPercent > 200
  ) {
    return null;
  }
  if (!Number.isFinite(returnPercent) || returnPercent < -100 || returnPercent > 100) {
    return null;
  }

  // 401(a)(17): the plan cannot see pay above the ceiling. Applied to the
  // deferral election as well as to the match, because a plan's definition
  // of compensation governs both.
  const planCompensation = Math.min(annualSalary, params.compensation);

  const tier = catchUpTier(age);
  const catchUpAvailable = catchUpAllowance(params, age);
  const deferralLimit = params.electiveDeferral + catchUpAvailable;

  const electedDeferral = planCompensation * (deferralPercent / 100);
  const deferral = Math.min(electedDeferral, deferralLimit);
  // Catch-up is the part above the 402(g) limit. Computed here because the
  // 415(c) test below must exclude it.
  const catchUpUsed = Math.max(0, deferral - params.electiveDeferral);

  const matchThresholdPay = planCompensation * (employerMatchLimitPercent / 100);
  const matchableDeferral = Math.min(deferral, matchThresholdPay);
  const employerMatch = matchableDeferral * (employerMatchPercent / 100);
  const maxEmployerMatch = matchThresholdPay * (employerMatchPercent / 100);
  const employerExtra = planCompensation * (employerExtraPercent / 100);

  const totalContribution = deferral + employerMatch + employerExtra;
  // 415(c) excludes catch-up contributions, so they come out of the base.
  const additionsForLimit = totalContribution - catchUpUsed;
  const excessAdditions = Math.max(0, additionsForLimit - params.annualAdditions);

  const catchUpForcedRoth =
    catchUpUsed > 0 && catchUpMustBeRoth(params, annualSalary);
  const deductibleDeferral = catchUpForcedRoth ? deferral - catchUpUsed : deferral;
  const incomeTaxSaved = deductibleDeferral * (marginalRatePercent / 100);

  const rate = returnPercent / 100;
  const projectedBalance = grow(totalContribution, rate, years);
  const projectedWithoutMatch = grow(deferral + employerExtra, rate, years);
  const unclaimedMatch = maxEmployerMatch - employerMatch;

  return {
    params,
    planCompensation,
    compensationCapped: annualSalary > params.compensation,

    catchUpTier: tier,
    catchUpAvailable,
    deferralLimit,
    electedDeferral,
    deferral,
    deferralCapped: electedDeferral > deferralLimit,
    catchUpUsed,
    effectiveDeferralPercent:
      planCompensation <= 0 ? null : (deferral / planCompensation) * 100,

    employerMatch,
    maxEmployerMatch,
    unclaimedMatch,
    matchThresholdPercent: employerMatchLimitPercent,
    matchThresholdAmount: matchThresholdPay,
    employerExtra,

    totalContribution,
    additionsForLimit,
    excessAdditions,

    deductibleDeferral,
    catchUpForcedRoth,
    incomeTaxSaved,
    netCostOfDeferral: deferral - incomeTaxSaved,
    matchReturnPercent: deferral <= 0 ? null : (employerMatch / deferral) * 100,

    projectedBalance,
    projectedWithoutMatch,
    matchValueAtHorizon: projectedBalance - projectedWithoutMatch,
    unclaimedMatchAtHorizon: grow(unclaimedMatch, rate, years),
    totalContributed: totalContribution * years,
  };
}
