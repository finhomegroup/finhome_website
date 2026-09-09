/**
 * Discount points for /cong-cu/diem-chiet-khau/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `points.test.ts`.
 *
 * Paying a fee up front to buy the rate down. The naive test is
 * `cost ÷ monthly saving`, and every calculator gives that number — but it is
 * wrong in a way that flatters the points, because it ignores the fact that a
 * lower rate also retires principal faster. Two borrowers who sell in year
 * five do not just differ by the payments they made; they differ by the
 * balances they still owe.
 *
 * So this module reports both:
 *
 * - `breakEvenMonths`, the familiar figure, so the page can show it and then
 *   qualify it;
 * - `holdPosition`, a full comparison at a chosen horizon: everything paid
 *   out, plus the balance still owed, plus the upfront cost, on each side.
 *   Positive means buying the points left you better off. This is the figure
 *   that answers the actual question.
 *
 * `rateReductionPoints` is in PERCENTAGE POINTS of rate, not percent of the
 * rate: 0,25 takes 8,5% to 8,25%. Those are different numbers: confusing them
 * scales the reduction by 100 ÷ rate, which at this page's 8,5% default is a
 * factor of about twelve.
 */

import { amortize, pmt, type ScheduleRow } from "@/lib/calc/finance";

export type PointsInput = {
  /** Principal borrowed, in đồng. */
  amount: number;
  /** Term in months. */
  termMonths: number;
  /** The rate on offer with no points, in percent per year. */
  baseRatePercent: number;
  /** Upfront cost of the points, as a percent of the amount borrowed. */
  pointsPercent: number;
  /** Percentage POINTS taken off the rate. 0,25 turns 8,5 into 8,25. */
  rateReductionPoints: number;
  /**
   * How long you expect to keep the loan, in months. Defaults to the full
   * term. Drives `holdPosition`.
   */
  holdMonths?: number;
};

export type PointsResult = {
  /** Cost of the points in đồng. */
  cost: number;
  /** The bought-down rate, in percent per year. */
  buydownRatePercent: number;
  /** Instalment without points. */
  basePayment: number;
  /** Instalment with points. */
  buydownPayment: number;
  /** `basePayment − buydownPayment`. */
  monthlySaving: number;
  /** Interest over the full term, without points. */
  baseTotalInterest: number;
  /** Interest over the full term, with points. */
  buydownTotalInterest: number;
  /** Interest saved over the full term, less the cost of the points. */
  lifetimeSaving: number;
  /**
   * The naive `cost ÷ monthly saving`, rounded up. Null when the payment does
   * not fall. Shown so the page can say what it leaves out.
   */
  breakEvenMonths: number | null;
  /** The horizon `holdPosition` was measured over, in months. */
  holdMonths: number;
  /**
   * Total cash out plus balance still owed at `holdMonths`, without points.
   */
  baseHoldCost: number;
  /** The same figure with points, including the upfront cost. */
  buydownHoldCost: number;
  /**
   * `baseHoldCost − buydownHoldCost`. Positive means the points paid off by
   * that horizon. This accounts for the faster principal reduction that
   * `breakEvenMonths` ignores.
   */
  holdPosition: number;
  /** Whether the points are worth it at `holdMonths`. */
  worthIt: boolean;
};

/** Payments made plus balance still owed, after `months` of a schedule. */
function costThrough(schedule: ScheduleRow[], months: number): number {
  const rows = schedule.slice(0, months);
  const paid = rows.reduce((sum, row) => sum + row.payment, 0);
  // Past the end of the schedule the loan is repaid, so nothing is owed.
  const owed = rows.length > 0 ? rows[rows.length - 1].balance : 0;
  return paid + owed;
}

/**
 * Price a points buydown.
 *
 * Null when the inputs cannot describe one: a non-positive amount or term, a
 * negative rate or cost, a non-integer number of months, a hold horizon of
 * zero or less, a reduction that takes the rate below zero, or any non-finite
 * number.
 */
export function computePoints(input: PointsInput): PointsResult | null {
  const {
    amount,
    termMonths,
    baseRatePercent,
    pointsPercent,
    rateReductionPoints,
    holdMonths = input.termMonths,
  } = input;

  const numbers = [
    amount,
    termMonths,
    baseRatePercent,
    pointsPercent,
    rateReductionPoints,
    holdMonths,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (amount <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (holdMonths <= 0 || !Number.isInteger(holdMonths)) return null;

  const buydownRatePercent = baseRatePercent - rateReductionPoints;
  // Buying the rate below zero is not a product; reject rather than clamp.
  if (buydownRatePercent < 0) return null;

  const baseMonthly = baseRatePercent / 100 / 12;
  const buydownMonthly = buydownRatePercent / 100 / 12;

  const baseSchedule = amortize({
    principal: amount,
    ratePerPeriod: baseMonthly,
    periods: termMonths,
  });
  const buydownSchedule = amortize({
    principal: amount,
    ratePerPeriod: buydownMonthly,
    periods: termMonths,
  });
  if (baseSchedule === null || buydownSchedule === null) return null;

  const basePayment = Math.abs(pmt(baseMonthly, termMonths, amount));
  const buydownPayment = Math.abs(pmt(buydownMonthly, termMonths, amount));
  if (!Number.isFinite(basePayment) || !Number.isFinite(buydownPayment)) {
    return null;
  }

  const cost = (pointsPercent / 100) * amount;
  const baseTotalInterest = baseSchedule.reduce(
    (sum, row) => sum + row.interest,
    0,
  );
  const buydownTotalInterest = buydownSchedule.reduce(
    (sum, row) => sum + row.interest,
    0,
  );
  const monthlySaving = basePayment - buydownPayment;

  // Clamp the horizon to the schedule: holding "past" payoff costs no more.
  const horizon = Math.min(holdMonths, termMonths);
  const baseHoldCost = costThrough(baseSchedule, horizon);
  const buydownHoldCost = costThrough(buydownSchedule, horizon) + cost;
  const holdPosition = baseHoldCost - buydownHoldCost;

  return {
    cost,
    buydownRatePercent,
    basePayment,
    buydownPayment,
    monthlySaving,
    baseTotalInterest,
    buydownTotalInterest,
    lifetimeSaving: baseTotalInterest - buydownTotalInterest - cost,
    breakEvenMonths:
      monthlySaving > 0 ? Math.ceil(cost / monthlySaving) : null,
    holdMonths: horizon,
    baseHoldCost,
    buydownHoldCost,
    holdPosition,
    worthIt: holdPosition > 0,
  };
}
