/**
 * Savings goals for /cong-cu/muc-tieu-tiet-kiem/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `savings-goal.test.ts`.
 *
 * Three unknowns, and you can solve for any one of them from the other two:
 * how much to put aside each month, how long it takes, or what you end up
 * with. All three run off the same annuity relationship, so they agree with
 * each other by construction — solving for the contribution and then feeding
 * that contribution back in returns the original target.
 *
 * Contributions are made at the END of each month (`type = 0`). That is the
 * conservative reading and it matches how a standing order to a savings
 * account behaves. Beginning-of-month contributions would earn one extra
 * period of interest each and overstate the result slightly.
 *
 * `months` in the `months` mode is deliberately NOT rounded to a whole
 * number: 47,3 months is honest information, and rounding it down would say
 * a goal is reached before it is. The page rounds up for display and says so.
 */

import { fv, nper, pmt } from "@/lib/calc/finance";

export type SavingsGoalMode =
  /** Given the target and the horizon, find the monthly contribution. */
  | "contribution"
  /** Given the target and the contribution, find how long it takes. */
  | "months"
  /** Given the contribution and the horizon, find what you end up with. */
  | "target";

export type SavingsGoalInput = {
  mode: SavingsGoalMode;
  /** What you have already, in đồng. May be 0. */
  initial?: number;
  /** The target amount. Required in `contribution` and `months` modes. */
  target?: number;
  /** Monthly contribution. Required in `months` and `target` modes. */
  contribution?: number;
  /** Horizon in months. Required in `contribution` and `target` modes. */
  months?: number;
  /** Nominal annual rate in percent, compounded monthly. */
  annualRatePercent: number;
};

export type SavingsGoalResult = {
  /** Starting balance. */
  initial: number;
  /** Monthly contribution — supplied, or solved for. */
  contribution: number;
  /** Horizon in months — supplied, or solved for. Not rounded. */
  months: number;
  /** Final balance — supplied as the target, or solved for. */
  target: number;
  /** Everything paid in: `initial + contribution × months`. */
  totalContributed: number;
  /** `target − totalContributed`: what the rate did for you. */
  interestEarned: number;
  /** Interest as a share of the final balance, in percent. */
  interestSharePercent: number;
};

/**
 * Solve a savings goal for whichever figure is missing.
 *
 * Null when the inputs cannot describe one, including several cases that are
 * genuinely unanswerable rather than merely awkward:
 *
 * - a target already covered by the starting balance in `months` mode: the
 *   answer is "zero months", but a solver asked to reach a number it is
 *   already past returns a negative period, and reporting that as a duration
 *   would be nonsense;
 * - a target that the contribution can never reach at a 0% rate, or that the
 *   rate can never reach because the balance is falling;
 * - a required contribution that comes out negative, i.e. the starting
 *   balance already grows past the target on its own.
 *
 * Callers surface each of those as "no result" rather than as a guess.
 */
export function computeSavingsGoal(
  input: SavingsGoalInput,
): SavingsGoalResult | null {
  const {
    mode,
    initial = 0,
    target,
    contribution,
    months,
    annualRatePercent,
  } = input;

  if (!Number.isFinite(initial) || initial < 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;

  const rate = annualRatePercent / 100 / 12;

  // The starting balance is an input in every mode; only the other three
  // figures are ever solved for.
  const solvedInitial = initial;
  let solvedContribution: number;
  let solvedMonths: number;
  let solvedTarget: number;

  switch (mode) {
    case "contribution": {
      if (target === undefined || months === undefined) return null;
      if (!Number.isFinite(target) || target < 0) return null;
      if (!Number.isFinite(months) || months <= 0) return null;
      // pmt() follows the outflow-negative convention: the present value and
      // future value go in with opposite signs to the payment, and the
      // payment comes back negative, so flip it.
      const payment = -pmt(rate, months, -initial, target);
      if (!Number.isFinite(payment)) return null;
      // A negative required contribution means the starting balance already
      // overshoots the target. "Save a negative amount" is not advice.
      if (payment < 0) return null;
      solvedContribution = payment;
      solvedMonths = months;
      solvedTarget = target;
      break;
    }

    case "months": {
      if (target === undefined || contribution === undefined) return null;
      if (!Number.isFinite(target) || target < 0) return null;
      if (!Number.isFinite(contribution) || contribution < 0) return null;
      // Already there: a duration is not the answer to this question.
      if (target <= initial) return null;
      if (contribution === 0 && rate === 0) return null;
      const periods = nper(rate, -contribution, -initial, target);
      if (!Number.isFinite(periods) || periods <= 0) return null;
      solvedContribution = contribution;
      solvedMonths = periods;
      solvedTarget = target;
      break;
    }

    case "target": {
      if (contribution === undefined || months === undefined) return null;
      if (!Number.isFinite(contribution) || contribution < 0) return null;
      if (!Number.isFinite(months) || months <= 0) return null;
      // Both the starting balance and the contributions are outflows under
      // the module's sign convention, so they go in negative and `fv` comes
      // back POSITIVE. No flip here — unlike `pmt` below, which does need one.
      const future = fv(rate, months, -contribution, -initial);
      if (!Number.isFinite(future)) return null;
      solvedContribution = contribution;
      solvedMonths = months;
      solvedTarget = future;
      break;
    }
  }

  const totalContributed = solvedInitial + solvedContribution * solvedMonths;
  const interestEarned = solvedTarget - totalContributed;

  return {
    initial: solvedInitial,
    contribution: solvedContribution,
    months: solvedMonths,
    target: solvedTarget,
    totalContributed,
    interestEarned,
    interestSharePercent:
      solvedTarget > 0 ? (interestEarned / solvedTarget) * 100 : 0,
  };
}
