/**
 * Reaching the 401(k) deferral limit — and the match that costs.
 *
 * Two questions, and the second one is the reason this is not just a
 * division.
 *
 * **What do I put in each paycheck?** The elective deferral limit is annual
 * and the deferral is a percent of each pay period, so someone who wants to
 * reach the cap has to divide the room they have left by the pay periods
 * they have left. That is the arithmetic.
 *
 * **Will that cost me match?** Many plans compute the employer match PER PAY
 * PERIOD. Under such a plan the match is earned paycheck by paycheck and a
 * paycheck with no deferral earns no match, no matter how much went in
 * earlier in the year. So an employee who front-loads — defers 50% of pay
 * and hits the annual cap in September — forfeits the match on every
 * remaining paycheck. The same total deferral, differently spread, is worth
 * thousands less.
 *
 * Plans that "true up" at year end fix this by recomputing the match on the
 * annual total. Many plans do; many do not; and the plan document is the
 * only way to know. So this module computes BOTH, and reports the gap rather
 * than picking one — a tool that assumed a true-up would tell a reader whose
 * plan has none that front-loading is free.
 *
 * ## What it assumes, and says so
 *
 * The reader knows what they have contributed so far and how many pay
 * periods have passed, not what went in on each one. The module spreads
 * `contributedSoFar` evenly across the elapsed periods, which is what a
 * fixed percent election produces. If the year so far was itself uneven the
 * per-period match figure for those periods is approximate; the figures for
 * the REMAINING periods, which are the ones the reader can still act on,
 * are not.
 *
 * Pay is `planCompensation / payPeriodsPerYear`, using the 401(a)(17)-capped
 * compensation for the same reason `us-401k.ts` does: a plan cannot see pay
 * above the ceiling, so neither the deferral election nor the match
 * threshold can be computed on the raw salary.
 */

import {
  catchUpAllowance,
  catchUpTier,
  RETIREMENT_LIMITS,
  type CatchUpTier,
  type RetirementLimitYear,
} from "@/lib/calc/us-retirement-limits";

export type Us401kMaxInput = {
  year: number;
  age: number;
  annualSalary: number;
  /** 12 monthly, 24 semi-monthly, 26 fortnightly, 52 weekly. */
  payPeriodsPerYear: number;
  /** Pay periods already paid this year. */
  periodsElapsed: number;
  /** Deferred so far this year, in USD. */
  contributedSoFar: number;
  employerMatchPercent: number;
  employerMatchLimitPercent: number;
  /** Deferral percent used for the front-loading comparison. */
  frontLoadPercent: number;
};

export type DeferralSchedule = {
  /** What goes in on each pay period of the year, in order. */
  deferrals: number[];
  /**
   * The match each of those periods earns under a per-period plan, in the
   * same order. Here rather than in the page because it is the per-period
   * cap being applied paycheck by paycheck that the page is trying to show,
   * and a page recomputing it could disagree with the totals beside it.
   */
  matches: number[];
  totalDeferral: number;
  /** Match under a plan that computes it per pay period. */
  matchPerPeriodPlan: number;
  /** Match under a plan that trues up on the annual total. */
  matchTrueUpPlan: number;
  /** What a per-period plan costs this schedule. Zero when they agree. */
  matchLostWithoutTrueUp: number;
  /** Pay periods with no deferral at all, so no match earned. */
  emptyPeriods: number;
  /** Periods that deferred something but less than the match threshold. */
  underThresholdPeriods: number;
};

export type Us401kMaxResult = {
  params: RetirementLimitYear;
  catchUpTier: CatchUpTier;
  catchUpAvailable: number;
  /** 402(g) plus catch-up: the annual ceiling on the employee's own money. */
  limit: number;

  planCompensation: number;
  payPerPeriod: number;
  periodsRemaining: number;
  remainingRoom: number;
  /** True when the limit is already reached — nothing more may go in. */
  alreadyAtLimit: boolean;
  /** Contributed beyond the limit, which has to be refunded. */
  overLimit: number;

  /** Per paycheck, for the rest of the year, to land exactly on the limit. */
  perPeriodAmount: number | null;
  perPeriodPercent: number | null;
  /** True when that amount is more than a paycheck: the cap is out of reach. */
  exceedsPay: boolean;
  /** The most that could go in over the remaining periods. */
  maxStillPossible: number;

  /** Deferral per period that earns the whole match under a per-period plan. */
  matchThresholdPerPeriod: number;
  /** Deferral for the year that earns the whole match under a true-up plan. */
  matchThresholdAnnual: number;

  /** The reader's own year: what has happened, then the level catch-up. */
  planned: DeferralSchedule;
  /** The same limit reached by front-loading from January instead. */
  frontLoaded: DeferralSchedule;
  /** Match the front-loaded schedule gives up, under a per-period plan. */
  frontLoadCost: number;
};

/** Match a per-period plan pays on one paycheck. */
function periodMatch(
  deferral: number,
  thresholdPerPeriod: number,
  matchPercent: number,
): number {
  return Math.min(deferral, thresholdPerPeriod) * (matchPercent / 100);
}

function summarise(
  deferrals: number[],
  thresholdPerPeriod: number,
  thresholdAnnual: number,
  matchPercent: number,
): DeferralSchedule {
  const totalDeferral = deferrals.reduce((sum, value) => sum + value, 0);
  const matches = deferrals.map((value) =>
    periodMatch(value, thresholdPerPeriod, matchPercent),
  );
  const matchPerPeriodPlan = matches.reduce((sum, value) => sum + value, 0);
  const matchTrueUpPlan =
    Math.min(totalDeferral, thresholdAnnual) * (matchPercent / 100);
  return {
    deferrals,
    matches,
    totalDeferral,
    matchPerPeriodPlan,
    matchTrueUpPlan,
    // A true-up can only ever help, so this is floored: float residue on a
    // schedule that exactly meets the threshold every period would
    // otherwise render as a loss of −0,00000001.
    matchLostWithoutTrueUp: Math.max(0, matchTrueUpPlan - matchPerPeriodPlan),
    emptyPeriods: deferrals.filter((value) => value <= 0).length,
    underThresholdPeriods: deferrals.filter(
      (value) => value > 0 && value < thresholdPerPeriod,
    ).length,
  };
}

/**
 * Work out the per-paycheck deferral, and what each schedule costs in match.
 *
 * Null on a year the limits table does not cover, an age outside 0–120, a
 * negative salary or contribution, pay periods outside 1–366, elapsed
 * periods outside 0–`payPeriodsPerYear`, a non-integer period count, a
 * deferral or match limit outside 0–100%, or a match rate outside 0–200%.
 */
export function computeUs401kMax(
  input: Us401kMaxInput,
): Us401kMaxResult | null {
  const {
    year,
    age,
    annualSalary,
    payPeriodsPerYear,
    periodsElapsed,
    contributedSoFar,
    employerMatchPercent,
    employerMatchLimitPercent,
    frontLoadPercent,
  } = input;

  const params = RETIREMENT_LIMITS[year];
  if (params === undefined) return null;

  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  if (!Number.isFinite(annualSalary) || annualSalary < 0) return null;
  if (!Number.isFinite(contributedSoFar) || contributedSoFar < 0) return null;
  if (!Number.isInteger(payPeriodsPerYear)) return null;
  if (payPeriodsPerYear < 1 || payPeriodsPerYear > 366) return null;
  if (!Number.isInteger(periodsElapsed)) return null;
  if (periodsElapsed < 0 || periodsElapsed > payPeriodsPerYear) return null;
  for (const percent of [employerMatchLimitPercent, frontLoadPercent]) {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;
  }
  if (
    !Number.isFinite(employerMatchPercent) ||
    employerMatchPercent < 0 ||
    employerMatchPercent > 200
  ) {
    return null;
  }

  const catchUpAvailable = catchUpAllowance(params, age);
  const limit = params.electiveDeferral + catchUpAvailable;

  const planCompensation = Math.min(annualSalary, params.compensation);
  const payPerPeriod = planCompensation / payPeriodsPerYear;
  const periodsRemaining = payPeriodsPerYear - periodsElapsed;

  const remainingRoom = Math.max(0, limit - contributedSoFar);
  const overLimit = Math.max(0, contributedSoFar - limit);

  const perPeriodAmount =
    periodsRemaining <= 0 ? null : remainingRoom / periodsRemaining;
  const maxStillPossible = Math.min(
    remainingRoom,
    payPerPeriod * periodsRemaining,
  );

  const matchThresholdPerPeriod = payPerPeriod * (employerMatchLimitPercent / 100);
  const matchThresholdAnnual =
    planCompensation * (employerMatchLimitPercent / 100);

  // The reader's own year: what the elapsed periods did — spread evenly,
  // because a fixed percent election is what produces `contributedSoFar` —
  // followed by the level amount that lands on the limit.
  const perElapsed = periodsElapsed <= 0 ? 0 : contributedSoFar / periodsElapsed;
  const planned: number[] = [];
  for (let index = 0; index < periodsElapsed; index += 1) {
    planned.push(perElapsed);
  }
  for (let index = 0; index < periodsRemaining; index += 1) {
    // Capped at a paycheck: a deferral cannot exceed the pay it comes out
    // of, and without this cap an unreachable target would be reported as
    // though the match on it had been earned.
    planned.push(Math.min(perPeriodAmount ?? 0, payPerPeriod));
  }

  // The same year, front-loaded from January: defer the chosen percent of
  // every paycheck until the annual limit is reached, then nothing.
  const frontLoadPerPeriod = payPerPeriod * (frontLoadPercent / 100);
  const frontLoaded: number[] = [];
  let placed = 0;
  for (let index = 0; index < payPeriodsPerYear; index += 1) {
    const amount = Math.max(0, Math.min(frontLoadPerPeriod, limit - placed));
    frontLoaded.push(amount);
    placed += amount;
  }

  const plannedSchedule = summarise(
    planned,
    matchThresholdPerPeriod,
    matchThresholdAnnual,
    employerMatchPercent,
  );
  const frontLoadedSchedule = summarise(
    frontLoaded,
    matchThresholdPerPeriod,
    matchThresholdAnnual,
    employerMatchPercent,
  );

  return {
    params,
    catchUpTier: catchUpTier(age),
    catchUpAvailable,
    limit,

    planCompensation,
    payPerPeriod,
    periodsRemaining,
    remainingRoom,
    alreadyAtLimit: remainingRoom <= 0,
    overLimit,

    perPeriodAmount,
    perPeriodPercent:
      perPeriodAmount === null || payPerPeriod <= 0
        ? null
        : (perPeriodAmount / payPerPeriod) * 100,
    exceedsPay: perPeriodAmount !== null && perPeriodAmount > payPerPeriod,
    maxStillPossible,

    matchThresholdPerPeriod,
    matchThresholdAnnual,

    planned: plannedSchedule,
    frontLoaded: frontLoadedSchedule,
    frontLoadCost:
      plannedSchedule.matchPerPeriodPlan - frontLoadedSchedule.matchPerPeriodPlan,
  };
}
