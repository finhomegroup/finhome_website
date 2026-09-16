/**
 * The DISCRETE monthly projection behind /cong-cu/muc-tieu-tiet-kiem/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `savings-schedule.test.ts`.
 *
 * WHY THIS EXISTS BESIDE `computeSavingsGoal`.
 *
 * `computeSavingsGoal` solves the annuity relationship over a CONTINUOUS
 * horizon, and its answer in `months` mode is genuinely fractional: 42,367
 * months. That figure is mathematically right and useless as a plan, because a
 * saver does not make 0,367 of a contribution. The money arrives at the end of
 * a whole month or it has not arrived, so the consumer answer is "the 43rd
 * contribution is the first one that covers the goal" — and the balance then is
 * 506.636.366 ₫, not the 500.000.000 ₫ the algebra was solving for.
 *
 * Rounding only the headline would be worse than not rounding it: the chart
 * marker, the accessible table and the article comparison would each still sit
 * at a different horizon. So ONE function produces the discrete schedule and
 * everything that shows a month, a balance, a contributed total or an interest
 * figure reads it. The continuous estimate is kept and shown, labelled as an
 * estimate.
 *
 * TWO BOUNDS, both deliberate:
 *
 * - `MAX_PROJECTION_MONTHS` caps the search. Without it, a 1 ₫ contribution
 *   toward a 500 triệu goal at 0% is 500 million months, and the chart this
 *   replaces looped once per month with no ceiling at all.
 * - `MAX_SERIES_POINTS` caps the drawn points. A line with more points than
 *   the plot has pixels is slower to build and no more informative.
 *
 * THE FUNDED TEST'S TOLERANCE IS REPRESENTATIONAL, NOT FINANCIAL. In
 * `contribution` mode the solved contribution makes the balance land exactly
 * ON the target at the horizon, and `(1 + r) ** n` does not return that target
 * bit-exactly. A bare `balance >= target` therefore reports one MORE
 * contribution than the plan needs.
 *
 * An earlier version allowed half a đồng absolutely, with a 1e-12 relative
 * floor. Both were wrong, and an independent review produced the
 * counterexamples: a 1 ₫ goal was reported funded at a balance of 0,5 ₫, and a
 * 1e15 ₫ goal was reported already funded while 999 ₫ short. Neither is
 * rounding residue — they are a financial allowance dressed as one.
 *
 * The tolerance is now `FUNDED_ULPS` units in the last place of the larger of
 * the two figures being compared, which is the only quantity float error
 * actually scales with. `FUNDED_ULPS` is 16 against a MEASURED worst case of
 * 1,28 ULPs, swept over targets from 1 ₫ to 1e15 ₫, horizons from 1 to 1.200
 * months and rates from 0 to 36%/năm — twelve times the observed error, and
 * still 3,6e-15 ₫ on a 1 ₫ goal and 3,6 ₫ on a 1e15 ₫ one. Re-run that sweep
 * if you change it; `savings-schedule.test.ts` pins both counterexamples.
 *
 * FINITE INPUTS DO NOT PROVE FINITE OUTPUTS. A monthly rate of 1e308 is a
 * finite number whose compound growth is not, and the projection used to
 * report that as a valid horizon carrying NaN. Every figure a schedule
 * returns is now checked before it is returned.
 */

import type {
  SavingsGoalMode,
  SavingsGoalResult,
} from "@/lib/calc/savings-goal";

/**
 * The longest projection this tool supports, in months — 100 years.
 *
 * Matches the bound the refinance tool already applies to its own months, so
 * the suite has one supported-horizon number rather than two.
 */
export const MAX_PROJECTION_MONTHS = 1200;

/**
 * Most points a drawn series may carry.
 *
 * 361 is months 0–360 inclusive, so a 30-year monthly plan — the longest a
 * consumer savings goal plausibly runs — still draws every month. Anything
 * longer is sampled at a fixed stride.
 */
export const MAX_SERIES_POINTS = 361;

/**
 * Units in the last place allowed when testing whether a balance covers a
 * target. See the module docstring: 16 against a measured worst case of 1,28,
 * scaled by the larger of the two figures compared, and nothing else.
 */
const FUNDED_ULPS = 16;

export type SavingsScheduleStatus =
  /** A whole contribution cycle covers the target. */
  | "funded"
  /** The starting balance already covers it; no contribution is needed. */
  | "alreadyFunded"
  /** No target was given: the schedule simply ran to the horizon asked for. */
  | "horizon"
  /** A target was given with a fixed horizon that does not reach it. */
  | "shortOfTarget"
  /** Reachable in principle, but not inside the supported horizon. */
  | "beyondLimit"
  /** No contribution and no rate: the balance never moves. */
  | "unattainable"
  /** The inputs do not describe a projection. */
  | "invalid";

export type SavingsSchedulePoint = {
  /** Months elapsed. 0 is the starting balance, before any contribution. */
  period: number;
  /** `initial + contribution × period`. */
  contributed: number;
  /** Balance at the END of `period`, contributions included. */
  balance: number;
};

export type SavingsSchedule = {
  status: SavingsScheduleStatus;
  /**
   * Months the schedule reports on.
   *
   * The HORIZON when one was given, even if the target was covered earlier —
   * the saver asked about those months. The funded cycle when the schedule had
   * to search for it, and the cap when the search did not find one.
   */
  months: number;
  /** First whole cycle whose closing balance covers the target. */
  fundedMonth: number | null;
  /** Closing balance at `months`. The ACTUAL figure, not the target. */
  balance: number;
  /** `initial + contribution × months`. */
  totalContributed: number;
  /** `balance − totalContributed`. */
  interest: number;
  /** Interest as a share of `balance`, in percent. 0 when the balance is 0. */
  interestSharePercent: number;
  /** The cap that was applied to the search. */
  limitMonths: number;
  /** Bounded, always including month 0 and `months`. */
  points: SavingsSchedulePoint[];
  /** True when `points` is a sample rather than one point per month. */
  sampled: boolean;
};

/** The three figures every projection runs on. */
type SavingsCore = {
  initial: number;
  contribution: number;
  monthlyRate: number;
};

export type SavingsScheduleInput = SavingsCore & {
  /**
   * A fixed horizon in whole months. When omitted the schedule searches for
   * the first cycle that covers `target`.
   */
  months?: number;
  /** The balance being aimed at. Omitted in "what will I have" mode. */
  target?: number;
  limitMonths?: number;
  maxPoints?: number;
};

/**
 * Closing balance after `months` whole months of end-of-month contributions.
 *
 * The same annuity relationship `computeSavingsGoal` solves, evaluated at a
 * point. Month 0 is the starting balance alone, because a contribution made at
 * the end of month 1 has not happened yet at month 0.
 */
export function balanceAfter(
  months: number,
  initial: number,
  contribution: number,
  monthlyRate: number,
): number {
  if (monthlyRate === 0) return initial + contribution * months;
  const growth = (1 + monthlyRate) ** months;
  return initial * growth + contribution * ((growth - 1) / monthlyRate);
}

/**
 * Float slack when comparing `balance` against `target`, in đồng.
 *
 * Scaled by the LARGER of the two, because that is the figure whose
 * representation error dominates the comparison. Never a fixed number of
 * đồng: a fixed allowance is a fraction of a small target and a rounding
 * error of a large one, and it was wrong at both ends.
 *
 * Only ever applied where the balance computation actually introduced error —
 * see `balanceIsExact`.
 */
export function fundedSlack(balance: number, target: number): number {
  const scale = Math.max(Math.abs(balance), Math.abs(target));
  if (!Number.isFinite(scale)) return 0;
  return scale * Number.EPSILON * FUNDED_ULPS;
}

/**
 * True when `balanceAfter` computed this month with NO representational error,
 * so there is nothing to forgive and the comparison must be strict.
 *
 * Two cases, and a review counterexample behind the second:
 *
 * - **Month 0** is the starting balance itself. No arithmetic happens, so
 *   comparing it against the target is exact whatever the rate is.
 * - **A zero rate with whole-đồng figures** is `initial + contribution × n`,
 *   which is exact while every term and the sum stay inside the safe-integer
 *   range. A 999.999.999.999.001 ₫ balance growing by 1 ₫ a month toward
 *   1e15 ₫ was reported funded at month 996 — three đồng early — because a
 *   ULP-scaled allowance was applied to arithmetic that had no error in it.
 *   At this magnitude 16 ULPs is about 3,6 ₫, which is exactly the gap it
 *   wrongly bridged.
 *
 * A zero rate with a FRACTIONAL contribution is not exact: 1/60 × 60 is
 * 0,9999999999999999, and the tiny-target counterexample depends on that
 * residue being forgiven. So the test is integrality, not the rate alone.
 */
export function balanceIsExact(core: SavingsCore, months: number): boolean {
  if (months === 0) return true;
  if (core.monthlyRate !== 0) return false;
  if (!Number.isInteger(core.initial) || !Number.isInteger(core.contribution)) {
    return false;
  }
  const added = core.contribution * months;
  return Number.isSafeInteger(added) && Number.isSafeInteger(core.initial + added);
}

/**
 * True when `balance` covers `target`.
 *
 * `exact` comes from `balanceIsExact`: strict when the arithmetic introduced
 * no error, ULP-scaled slack only when it did.
 */
function covers(balance: number, target: number, exact: boolean): boolean {
  if (!Number.isFinite(balance) || !Number.isFinite(target)) return false;
  if (exact) return balance >= target;
  return balance + fundedSlack(balance, target) >= target;
}

/** `covers` at a given month, deciding exactness from the same figures. */
function coversAt(month: number, core: SavingsCore, target: number): boolean {
  const balance = balanceAfter(
    month,
    core.initial,
    core.contribution,
    core.monthlyRate,
  );
  return covers(balance, target, balanceIsExact(core, month));
}

function invalid(limitMonths: number): SavingsSchedule {
  return {
    status: "invalid",
    months: 0,
    fundedMonth: null,
    balance: 0,
    totalContributed: 0,
    interest: 0,
    interestSharePercent: 0,
    limitMonths,
    points: [],
    sampled: false,
  };
}

/**
 * Sample the schedule for drawing.
 *
 * Always includes month 0 and `months`, so the first and last points are the
 * real endpoints rather than wherever a stride happened to land.
 */
function samplePoints(
  months: number,
  core: SavingsCore,
  maxPoints: number,
): { points: SavingsSchedulePoint[]; sampled: boolean } {
  const at = (period: number): SavingsSchedulePoint => ({
    period,
    contributed: core.initial + core.contribution * period,
    balance: balanceAfter(period, core.initial, core.contribution, core.monthlyRate),
  });
  if (months <= 0) return { points: [at(0)], sampled: false };
  const stride = Math.max(1, Math.ceil(months / (maxPoints - 1)));
  const points: SavingsSchedulePoint[] = [];
  for (let period = 0; period < months; period += stride) points.push(at(period));
  points.push(at(months));
  return { points, sampled: stride > 1 };
}

function finish(
  status: SavingsScheduleStatus,
  months: number,
  fundedMonth: number | null,
  core: SavingsCore,
  limitMonths: number,
  maxPoints: number,
): SavingsSchedule {
  const balance = balanceAfter(
    months,
    core.initial,
    core.contribution,
    core.monthlyRate,
  );
  const totalContributed = core.initial + core.contribution * months;
  const interest = balance - totalContributed;
  const sample = samplePoints(months, core, maxPoints);
  const interestSharePercent = balance > 0 ? (interest / balance) * 100 : 0;

  // FINITE INPUTS DO NOT PROVE FINITE OUTPUTS. A monthly rate of 1e308 is a
  // finite number whose compound growth is not, and this used to come back as
  // a valid "horizon" carrying NaN. Every figure is checked, including every
  // drawn point, because the chart reads those directly.
  const figures = [balance, totalContributed, interest, interestSharePercent];
  const allFinite =
    figures.every((figure) => Number.isFinite(figure)) &&
    sample.points.every(
      (point) =>
        Number.isFinite(point.balance) && Number.isFinite(point.contributed),
    );
  if (!allFinite) return invalid(limitMonths);

  return {
    status,
    months,
    fundedMonth,
    balance,
    totalContributed,
    interest,
    interestSharePercent,
    limitMonths,
    points: sample.points,
    sampled: sample.sampled,
  };
}

/**
 * Project a savings plan month by month.
 *
 * Two shapes, decided by whether a horizon was given:
 *
 * - a FIXED horizon (`months`) runs to that month and, if a target was also
 *   given, reports the first cycle within it that covers the target;
 *   `shortOfTarget` when none does.
 * - NO horizon searches for the first covering cycle, up to `limitMonths`.
 *
 * Never throws and never extrapolates. A plan that cannot be funded comes back
 * with the status saying why, so a caller explains the state rather than
 * drawing a curve that reaches a line it never touches.
 */
export function projectSavings(input: SavingsScheduleInput): SavingsSchedule {
  const limitMonths =
    input.limitMonths === undefined ? MAX_PROJECTION_MONTHS : input.limitMonths;
  const maxPoints =
    input.maxPoints === undefined ? MAX_SERIES_POINTS : input.maxPoints;

  // The overrides are BOUNDED BY the supported caps, not merely validated
  // against zero: a caller cannot ask this module to walk a million months or
  // emit a million points just because it passed a number.
  if (!Number.isSafeInteger(limitMonths) || limitMonths < 1) return invalid(0);
  if (limitMonths > MAX_PROJECTION_MONTHS) return invalid(MAX_PROJECTION_MONTHS);
  if (!Number.isSafeInteger(maxPoints) || maxPoints < 2) {
    return invalid(limitMonths);
  }
  if (maxPoints > MAX_SERIES_POINTS) return invalid(limitMonths);

  const { initial, contribution, monthlyRate, months, target } = input;
  if (!Number.isFinite(initial) || initial < 0) return invalid(limitMonths);
  if (!Number.isFinite(contribution) || contribution < 0) return invalid(limitMonths);
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) return invalid(limitMonths);
  if (target !== undefined && (!Number.isFinite(target) || target < 0)) {
    return invalid(limitMonths);
  }

  const core: SavingsCore = { initial, contribution, monthlyRate };

  if (months !== undefined) {
    // A horizon has to be whole months: this is a count of contributions, and
    // half a contribution is not something a standing order can make.
    if (!Number.isSafeInteger(months) || months < 0 || months > limitMonths) {
      return invalid(limitMonths);
    }
    // A FIXED horizon always reports on that horizon: the saver asked what
    // happens over those months, and collapsing the report onto an earlier
    // funded cycle would drop the rest of the plan off the chart. The funded
    // cycle is reported separately.
    if (target === undefined) {
      return finish("horizon", months, null, core, limitMonths, maxPoints);
    }
    // Month 0 is the starting balance itself, so this comparison is exact.
    if (coversAt(0, core, target)) {
      return finish("alreadyFunded", months, 0, core, limitMonths, maxPoints);
    }
    for (let month = 1; month <= months; month += 1) {
      if (coversAt(month, core, target)) {
        return finish("funded", months, month, core, limitMonths, maxPoints);
      }
    }
    return finish("shortOfTarget", months, null, core, limitMonths, maxPoints);
  }

  if (target === undefined) return invalid(limitMonths);
  if (coversAt(0, core, target)) {
    return finish("alreadyFunded", 0, 0, core, limitMonths, maxPoints);
  }
  // Nothing coming in and nothing accruing: the balance is fixed below the
  // target forever, and a search would run to the cap only to say so.
  if (contribution === 0 && monthlyRate === 0) {
    return finish("unattainable", 0, null, core, limitMonths, maxPoints);
  }
  for (let month = 1; month <= limitMonths; month += 1) {
    if (coversAt(month, core, target)) {
      return finish("funded", month, month, core, limitMonths, maxPoints);
    }
  }
  return finish("beyondLimit", limitMonths, null, core, limitMonths, maxPoints);
}

/**
 * The discrete schedule for a solved goal.
 *
 * THE one place the consumer month is decided, so the headline, the chart
 * marker, the accessible table and the article comparison cannot sit at three
 * different horizons.
 *
 * THE MODE IS PASSED IN, NOT INFERRED. An earlier version decided whether to
 * search by asking whether the solver's `months` happened to be an integer,
 * which silently changes behaviour when a fractional solve lands on a whole
 * number — the same inputs would take a different branch. `months` mode
 * SEARCHES for the funded cycle; `contribution` and `target` were handed a
 * whole horizon and keep it, including `target` mode where there is no goal to
 * reach and the schedule just reports the closing balance.
 */
export function savingsScheduleFor(
  result: SavingsGoalResult | null,
  annualRatePercent: number,
  mode: SavingsGoalMode,
): SavingsSchedule | null {
  if (result === null) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  // A non-finite or non-positive solved horizon is a broken result, not a
  // request to search. Without this guard `months: Infinity` would fall
  // through to the search branch and draw a plan the solver never produced.
  if (!Number.isFinite(result.months) || result.months <= 0) return null;
  const searching = mode === "months";
  if (!searching && !Number.isSafeInteger(result.months)) return null;
  return projectSavings({
    initial: result.initial,
    contribution: result.contribution,
    monthlyRate: annualRatePercent / 100 / 12,
    months: searching ? undefined : result.months,
    target: result.target,
  });
}
