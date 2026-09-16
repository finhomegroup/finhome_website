/**
 * What a pay rise does to a savings goal, for /cong-cu/tang-luong/.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. Unit-tested in
 * `raise-savings.test.ts`.
 *
 * ORIGINAL ROW 63 IS NOT THE SALARY ARITHMETIC. `computeRaise` already turns
 * a percentage, an amount or a target into a new salary, and that stays
 * exactly as it was. What the row asks for is the next step: "tăng lương giúp
 * tôi đạt mục tiêu sớm bao lâu", with the reader choosing how much of the
 * rise they actually set aside.
 *
 * THREE THINGS THIS MODULE REFUSES TO ASSUME.
 *
 * 1. **A gross rise is not spendable money.** The salary tool works in GROSS
 *    pay, because that is what a negotiation is conducted in. Tax and
 *    compulsory insurance take a share of any increase, so the amount that
 *    reaches an account is smaller — and by how much depends on brackets this
 *    tool does not model. So the net increase is a SEPARATE, EXPLICIT input,
 *    and `null` means the reader has not supplied it. In that state there is
 *    no comparison: `state` is `"unknownNet"` and the baseline plan is
 *    returned alone. Deriving a net figure from the gross one would be
 *    inventing a tax model.
 * 2. **The saver chooses the share.** `sharePercent` is an input with no
 *    100% default. Most of a rise goes to living costs that rose with it, and
 *    a tool that assumed the whole increase was saved would promise a date
 *    nobody reaches. A share of 0 is a legitimate answer and preserves the
 *    baseline exactly.
 * 3. **A pay cut frees nothing.** A negative net increase yields
 *    `state: "payCut"` and NO extra contribution — not a negative one. The
 *    salary side still computes the cut, which is a real thing to want to
 *    know; this side simply has nothing to add to a savings plan. Modelling a
 *    reduced contribution would require knowing what the saver would cut, and
 *    only they know that.
 *
 * IT RUNS NO PROJECTION OF ITS OWN. Both legs go through `planHouseFund`,
 * which goes through `projectSavings` — the suite's one discrete monthly
 * projection — and through `dates.ts` for the calendar. So the funded month,
 * the funded date and the balance on this page are the same figures
 * `/cong-cu/muc-tieu-tiet-kiem/` would give for the same plan, and the
 * horizon bound is enforced there before any loop allocates.
 *
 * A BONUS PERIOD IS NOT SMOOTHED IN. `computeRaise`'s `perYear` can be 13,
 * which correctly raises the ANNUAL total. This module works in monthly
 * contributions and takes the monthly net increase, so a 13th-month payment
 * is not silently spread across twelve monthly transfers. A saver who does
 * want that has to state it as part of their net monthly figure.
 */

import type { CalendarDate } from "@/lib/calc/dates";
import { planHouseFund, type HouseFundPlan } from "@/lib/calc/house-fund";

export type RaiseSavingState =
  /** Both legs ran: there is a real before/after to show. */
  | "compared"
  /** The plan stands, but nothing was added — a 0% share, or a rise of 0. */
  | "baselineOnly"
  /** No net increase was supplied, so no freed money can be known. */
  | "unknownNet"
  /** Pay went DOWN. Nothing is freed, and nothing is invented. */
  | "payCut"
  /** The inputs do not describe a plan at all. */
  | "invalid";

export type RaiseSavingInput = {
  /**
   * The monthly increase in TAKE-HOME pay, in đồng.
   *
   * `null` means not supplied — see the module docstring. A negative value is
   * a pay cut and is handled, not rejected.
   */
  netIncrease: number | null;
  /** Share of that increase set aside each month, 0–100. */
  sharePercent: number;
  /** What the saver already puts aside monthly, before any rise. */
  baselineContribution: number;
  /** Already saved, counted toward the target in full. */
  initial: number;
  /** The target balance. */
  target: number;
  /** Assumed nominal annual return. An assumption, not a quote. */
  annualRatePercent: number;
  /** The day the plan starts; contributions are anchored to its day. */
  start: CalendarDate;
  limitMonths?: number;
  maxPoints?: number;
};

export type RaiseSavingPlan = {
  state: RaiseSavingState;
  /** Echoed back. Null when not supplied. */
  netIncrease: number | null;
  sharePercent: number;
  /**
   * The monthly amount the chosen share frees, in đồng.
   *
   * Null when the net increase is unknown. ZERO on a pay cut or a 0% share —
   * never negative, because a savings plan cannot be handed a negative
   * contribution and the module will not guess what the saver would cut.
   */
  extraContribution: number | null;
  /** `baselineContribution + extraContribution`. Null when unknown. */
  raisedContribution: number | null;
  /**
   * Both dated legs, from `planHouseFund`: `current` is the baseline and
   * `higher` is the raised contribution — null unless it is genuinely higher.
   *
   * Null only when the inputs could not describe a plan at all.
   */
  plan: HouseFundPlan | null;
  /**
   * Whole months the raised contribution saves.
   *
   * Null unless BOTH legs found a funded cycle, which is `planHouseFund`'s
   * own rule: an earlier date measured against a plan that never funds is not
   * a comparison.
   */
  monthsEarlier: number | null;
};

function withoutPlan(
  state: RaiseSavingState,
  input: RaiseSavingInput,
  extraContribution: number | null,
): RaiseSavingPlan {
  return {
    state,
    netIncrease: input.netIncrease,
    sharePercent: input.sharePercent,
    extraContribution,
    raisedContribution: null,
    plan: null,
    monthsEarlier: null,
  };
}

/**
 * Project the savings goal with and without the share of the rise.
 *
 * Returns `state: "invalid"` with no plan when the figures cannot describe
 * one: a negative baseline contribution, initial balance, target or rate, a
 * share outside 0–100, a non-finite number, or a start date that does not
 * exist. Never throws.
 *
 * A plan that cannot reach its target is NOT invalid — `plan.current.schedule
 * .status` says `beyondLimit` or `unattainable`, and those are real answers
 * the page reports.
 */
export function planRaiseSaving(input: RaiseSavingInput): RaiseSavingPlan {
  const {
    netIncrease,
    sharePercent,
    baselineContribution,
    initial,
    target,
    annualRatePercent,
    start,
    limitMonths,
    maxPoints,
  } = input;

  const required = [
    sharePercent,
    baselineContribution,
    initial,
    target,
    annualRatePercent,
  ];
  if (required.some((value) => !Number.isFinite(value) || value < 0)) {
    return withoutPlan("invalid", input, null);
  }
  if (sharePercent > 100) return withoutPlan("invalid", input, null);
  if (netIncrease !== null && !Number.isFinite(netIncrease)) {
    return withoutPlan("invalid", input, null);
  }

  // What the share frees, before any plan is built — so the three non-compared
  // states are decided from the money and not from the projection.
  let extraContribution: number | null;
  let state: RaiseSavingState;
  if (netIncrease === null) {
    extraContribution = null;
    state = "unknownNet";
  } else if (netIncrease < 0) {
    // A cut frees nothing. Not a negative contribution: see the docstring.
    extraContribution = 0;
    state = "payCut";
  } else {
    extraContribution = netIncrease * (sharePercent / 100);
    if (!Number.isFinite(extraContribution)) {
      return withoutPlan("invalid", input, null);
    }
    state = extraContribution > 0 ? "compared" : "baselineOnly";
  }

  const raisedContribution =
    extraContribution === null ? null : baselineContribution + extraContribution;

  // ONE projection engine, through the house-fund planner: `comparisonContribution`
  // is ignored by it unless strictly greater, which is exactly the 0-share and
  // pay-cut behaviour this module wants — the baseline is preserved untouched.
  const plan = planHouseFund({
    target,
    start,
    initial,
    contribution: baselineContribution,
    annualRatePercent,
    comparisonContribution: raisedContribution ?? undefined,
    limitMonths,
    maxPoints,
  });

  if (plan === null) return withoutPlan("invalid", input, extraContribution);

  return {
    state,
    netIncrease,
    sharePercent,
    extraContribution,
    raisedContribution,
    plan,
    monthsEarlier: plan.monthsEarlier,
  };
}
