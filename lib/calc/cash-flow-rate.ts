/**
 * The rate an arbitrary monthly cash-flow vector implies.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `cash-flow-rate.test.ts`.
 *
 * `finance.ts`'s `solveRate` handles a LEVEL payment plus an optional balloon,
 * which is every fixed-rate loan and is why `apr.ts` uses it. It cannot price
 * an offer whose instalment CHANGES — a promotional rate that resets — because
 * there is no single payment to hand it. That is the whole point of the loan
 * comparison this backs, so the flows go in as a vector instead.
 *
 * SOLVED ON THE ANNUAL RATE, NOT THE MONTHLY ONE. docs §8 records this
 * mechanism failing three times in this suite: at 480 monthly periods
 * `(1 + rate) ** periods` underflows to zero near a −100% bracket endpoint,
 * the solver correctly refuses a non-finite endpoint, and every long-dated
 * contract comes back "no solution". Bracketing the ANNUAL rate keeps the
 * worst case around 1e-18 instead.
 *
 * Bisection, so a vector that does not bracket a rate returns null rather than
 * a plausible wrong number. A financial figure that cannot be trusted is worse
 * than a blank.
 */

import { netPresentValue } from "@/lib/calc/irr-npv";
import { bisect } from "@/lib/calc/solve";

/**
 * Lowest annual rate the search will consider: −99,99%/năm.
 *
 * Not −100%: at exactly −100% the monthly discount factor is zero and the
 * present value is non-finite, which `bisect` refuses outright.
 */
const MIN_ANNUAL = -0.9999;

/** Highest annual rate the search will consider: 1.000%/năm. */
const MAX_ANNUAL = 10;

/**
 * The monthly rate that discounts `flows` to zero.
 *
 * `flows[0]` is undiscounted and is what the borrower RECEIVES (positive);
 * later entries are what they pay (negative). One entry per month, with no
 * gaps — a month with no flow is a 0, not a missing element.
 *
 * Null when the vector does not bracket a rate inside the supported band, or
 * when it is too short or non-finite to price at all.
 */
export function solveMonthlyFlowRate(flows: readonly number[]): number | null {
  if (flows.length < 2) return null;
  for (const flow of flows) {
    if (!Number.isFinite(flow)) return null;
  }
  const annual = bisect(
    (rate) => netPresentValue(flows, rate / 12),
    MIN_ANNUAL,
    MAX_ANNUAL,
  );
  return annual === null ? null : annual / 12;
}

/**
 * The same rate as a NOMINAL annual percentage: monthly × 12 × 100.
 *
 * The disclosure convention, and deliberately NOT the effective annual rate —
 * they are different numbers and the gap is not small at high rates. A caller
 * that wants the compounded figure should say so in its own label.
 */
export function nominalAnnualPercent(monthlyRate: number | null): number | null {
  return monthlyRate === null ? null : monthlyRate * 12 * 100;
}
