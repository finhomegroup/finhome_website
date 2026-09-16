/**
 * A dated home-fund plan for /cong-cu/muc-tieu-tiet-kiem/.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. Unit-tested in
 * `house-fund.test.ts`.
 *
 * Two things this adds to `projectSavings`, which stays the only projection:
 *
 * 1. **The goal is composed from a house price** rather than typed as one
 *    number, so a saver can see what the figure is made of — and so each
 *    amount is counted exactly once.
 * 2. **Months become calendar dates**, because "46 months" is not a plan and
 *    "July 2030" is. Dates come from `dates.ts`, which is integer arithmetic
 *    with no `Date` and therefore no timezone in it.
 *
 * THE RESERVE IS INSIDE THE TARGET. `target = downPayment + purchaseCosts +
 * reserve`, and the saver's existing funds count toward it in full. Adjusting
 * one side only — holding the reserve outside the target while still counting
 * it among the usable funds, or the reverse — is the double-count this
 * composition exists to prevent.
 *
 * THE TWO DEFINITIONS AGREE ON THE FUNDING GAP, NOT ON THE DATE. Moving the
 * reserve outside BOTH sides leaves `target − funds` unchanged, so the static
 * gap is the same — but the dated projection is not, because the money held
 * back stops earning the modelled return. On the acceptance fixture,
 * reserve-inside (300 triệu earning, 1,14 tỷ target) funds in month 46 while
 * reserve-outside (150 triệu earning, 990 triệu target) funds LATER. So this
 * module makes no equivalence claim: it models the reserve inside the target,
 * with the WHOLE of the entered starting fund — including the part ultimately
 * kept back as the reserve — earning the same hypothetical rate. The page
 * states that assumption; reconciling a different return on the reserve would
 * be a separate model, not a relabelling.
 *
 * PURCHASE COSTS ARE A SHARE OF THE PRICE, not of the down payment: taxes,
 * notary and registration fees scale with what is being bought.
 *
 * NOTHING HERE IS A RATE FORECAST OR A SAVED PLAN. The return is the saver's
 * own assumption, and this module has no storage, no reminder and no transfer.
 */

import { addMonths, type CalendarDate } from "@/lib/calc/dates";
import {
  projectSavings,
  type SavingsSchedule,
} from "@/lib/calc/savings-schedule";

export type HouseFundTargetInput = {
  /** The home price being aimed at, in đồng. */
  price: number;
  /** Share of the price to be paid from own funds, in percent. */
  downPaymentPercent: number;
  /** One-off purchase costs as a percent of the PRICE. */
  purchaseCostPercent: number;
  /** Cash to keep back after buying. Counted INSIDE the target. */
  reserve: number;
};

export type HouseFundTarget = {
  downPayment: number;
  purchaseCosts: number;
  /** Echoed back, so the page can show what the target is made of. */
  reserve: number;
  /** `downPayment + purchaseCosts + reserve`. Each amount once. */
  target: number;
};

/**
 * What a home purchase actually needs in cash.
 *
 * Null when the inputs cannot describe one: a non-positive price, a negative
 * reserve, a share outside 0–100, or any non-finite number.
 */
export function houseFundTarget(
  input: HouseFundTargetInput,
): HouseFundTarget | null {
  const { price, downPaymentPercent, purchaseCostPercent, reserve } = input;

  const numbers = [price, downPaymentPercent, purchaseCostPercent, reserve];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (price <= 0) return null;
  if (downPaymentPercent > 100 || purchaseCostPercent > 100) return null;

  const downPayment = price * (downPaymentPercent / 100);
  const purchaseCosts = price * (purchaseCostPercent / 100);
  const target = downPayment + purchaseCosts + reserve;
  if (!Number.isFinite(target)) return null;

  return { downPayment, purchaseCosts, reserve, target };
}

/** One contribution level, projected and dated. */
export type HouseFundLeg = {
  /** The monthly contribution this leg assumes. */
  contribution: number;
  /** The projection, from the shared module. */
  schedule: SavingsSchedule;
  /**
   * The calendar date of the first funded cycle, or null when there is none.
   *
   * Anchored to the START day: month 46 from a 15th is the 15th, and a start
   * on the 31st clamps in short months without drifting afterwards — 31 Jan
   * plus one month is 28 Feb, plus two is 31 Mar. That is `addMonths`, and it
   * is a stated convention rather than a universal rule.
   *
   * Month 0 — already funded — maps to the START date, not to a month later.
   */
  fundedDate: CalendarDate | null;
  /** Own money in by the funded cycle: initial plus the contributions made. */
  ownFunds: number;
  /** Modelled interest by then: balance less own funds. */
  interest: number;
  /** Closing balance at the funded cycle. The actual figure, not the target. */
  balance: number;
};

export type HouseFundPlanInput = HouseFundLegCore & {
  /** The target to reach — from `houseFundTarget` or typed directly. */
  target: number;
  /** The day the plan starts. Contributions are anchored to its day. */
  start: CalendarDate;
  /**
   * A higher monthly contribution to compare against, EXPLICITLY entered.
   *
   * Optional, and never invented: the comparison exists to answer "what if I
   * save more", which is a figure only the saver can supply. A value at or
   * below `contribution` is not a comparison and comes back as no leg.
   */
  comparisonContribution?: number;
  limitMonths?: number;
  maxPoints?: number;
};

type HouseFundLegCore = {
  /** Funds already saved, counted toward the target in full. */
  initial: number;
  /** The monthly contribution, made at the END of each month. */
  contribution: number;
  /** The assumed nominal annual return, in percent. An assumption, not a quote. */
  annualRatePercent: number;
};

export type HouseFundPlan = {
  start: CalendarDate;
  /**
   * When the first contribution lands: one month after the start.
   *
   * Contributions are end-of-period, so at month 0 none has been made — which
   * is why an already-funded plan is dated at the start and not later.
   */
  firstContributionDate: CalendarDate | null;
  /** The plan as it stands. */
  current: HouseFundLeg;
  /** The same plan with a higher contribution. Null when none was entered. */
  higher: HouseFundLeg | null;
  /**
   * Whole months saved by the higher contribution.
   *
   * Null unless BOTH legs found a funded cycle: an earlier date computed
   * against a plan that never funds is not a comparison. Compared on whole
   * funded cycles, never on a fractional estimate.
   */
  monthsEarlier: number | null;
};

/** Project and date one contribution level. */
function leg(
  core: HouseFundLegCore,
  contribution: number,
  target: number,
  start: CalendarDate,
  limitMonths: number | undefined,
  maxPoints: number | undefined,
): HouseFundLeg {
  const schedule = projectSavings({
    initial: core.initial,
    contribution,
    monthlyRate: core.annualRatePercent / 100 / 12,
    target,
    limitMonths,
    maxPoints,
  });

  const funded = schedule.fundedMonth;
  return {
    contribution,
    schedule,
    // Month 0 maps to the start date itself.
    fundedDate: funded === null ? null : addMonths(start, funded),
    ownFunds: schedule.totalContributed,
    interest: schedule.interest,
    balance: schedule.balance,
  };
}

/**
 * A dated home-fund plan, with an optional higher-contribution comparison.
 *
 * Null when the start date does not exist or the core figures are not usable.
 * A projection that cannot reach the target is NOT null: `schedule.status`
 * says `beyondLimit` or `unattainable`, and those are real answers the page
 * reports rather than errors.
 *
 * The horizon bound lives in `projectSavings`, which checks it before the
 * search loop allocates anything; this wrapper adds no loop of its own.
 */
export function planHouseFund(input: HouseFundPlanInput): HouseFundPlan | null {
  const {
    target,
    start,
    initial,
    contribution,
    annualRatePercent,
    comparisonContribution,
    limitMonths,
    maxPoints,
  } = input;

  const numbers = [target, initial, contribution, annualRatePercent];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (comparisonContribution !== undefined) {
    if (!Number.isFinite(comparisonContribution) || comparisonContribution < 0) {
      return null;
    }
  }

  const firstContributionDate = addMonths(start, 1);
  // `addMonths` returns null for a date that does not exist, which is the one
  // check that also validates the start.
  if (firstContributionDate === null) return null;

  const core: HouseFundLegCore = { initial, contribution, annualRatePercent };
  const current = leg(core, contribution, target, start, limitMonths, maxPoints);

  // Only an actually HIGHER figure is a comparison.
  const higher =
    comparisonContribution !== undefined &&
    comparisonContribution > contribution
      ? leg(core, comparisonContribution, target, start, limitMonths, maxPoints)
      : null;

  const monthsEarlier =
    higher === null ||
    current.schedule.fundedMonth === null ||
    higher.schedule.fundedMonth === null
      ? null
      : current.schedule.fundedMonth - higher.schedule.fundedMonth;

  return { start, firstContributionDate, current, higher, monthsEarlier };
}
