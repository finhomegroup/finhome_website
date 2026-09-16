/**
 * ONE dated card-payoff plan, with the other path beside it — original rows
 * 29 and 30.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. Unit-tested in
 * `card-plan.test.ts`.
 *
 * WHY THE TWO ROWS ARE ONE MODEL. Row 29 asks "bao lâu tôi hết nợ để chuẩn bị
 * mua nhà" — a date, and the monthly money that stops going out afterwards.
 * Row 30 asks "chỉ trả tối thiểu khiến tôi chậm mua nhà bao lâu" — the same
 * question against a different payment rule. They were two pages with two
 * forms, so a reader who had typed their balance into one had to retype it to
 * ask the other, and neither showed a date. This module is the shared answer;
 * both routes still exist and each keeps its own framing.
 *
 * NO NEW ARITHMETIC. Every schedule comes from `card-debt.ts` — `payFixed`,
 * `payMinimum`, `paymentForMonths` — and every date from `dates.ts`. What is
 * added here is the pairing, the calendar and the household budget.
 *
 * THE DATE CONVENTION IS STATED, NOT GUESSED. The reader enters the day the
 * plan STARTS, the first payment lands one month later, and a plan that takes
 * `n` months is clear at `start + n months`. So `payoffDate` is anchored to
 * the start day and never chained through the first payment: chaining drifts
 * on a short month (31 January + 1 month is 28 February, and 21 months after
 * THAT is 28 November, where 22 months after the start is 30 November). One
 * anchor, no drift, same convention as `house-fund.ts`.
 *
 * THE FREED BUDGET IS AN ALLOCATION, NOT A CONSEQUENCE. A declining minimum
 * does not free its first payment every later month — the payment was already
 * falling, so nothing was released. What is freed when the card is clear is
 * the amount the household deliberately reserved for card debt, which only
 * the household can state. So `budget` is an input, `freedMonthly` is that
 * input, and `coversPlan` says whether the reserved amount was even enough to
 * run the plan. None of it is evidence anyone can afford anything else: it is
 * the reader's own allocation, restated with a date on it.
 *
 * THE RATE AND THE MINIMUM RULE ARE ASSUMPTIONS. `card-debt.ts` compounds a
 * quoted annual rate daily and takes the minimum as a share of the balance
 * PLUS that month's interest with a floor. That is a simulation of a common
 * statement shape, not a universal Vietnamese card contract — the numbers to
 * use are the ones on the reader's own biểu phí.
 */

import {
  minimumPaymentFor,
  monthlyCardRate,
  payFixed,
  payMinimum,
  paymentForMonths,
  type CardPayoffResult,
} from "@/lib/calc/card-debt";
import { addMonths, isValidDate, type CalendarDate } from "@/lib/calc/dates";

/** Which payment rule the reader is planning around. */
export type CardStrategy = "fixed" | "target" | "minimum";

/**
 * The rule a drawn path follows.
 *
 * `minimumFlat` is the comparison the minimum-payment route exists for: the
 * SAME first minimum, held flat instead of allowed to fall.
 */
export type CardPathStrategy = CardStrategy | "minimumFlat";

export type CardPlanInput = {
  /** Balance owed, in đồng. */
  balance: number;
  /** Nominal annual rate in percent, as quoted on the card. */
  annualRatePercent: number;
  strategy: CardStrategy;
  /** `fixed`: the amount paid every month. */
  monthlyPayment?: number;
  /** `target`: the whole number of months to be clear in. */
  targetMonths?: number;
  /** Minimum payment as a percent of the amount due. */
  minimumPercent: number;
  /** Absolute floor on the minimum payment, in đồng. */
  minimumFloor: number;
  /** `minimum`: extra paid on top of the minimum every month. */
  extraPerMonth?: number;
  /** The day the plan starts. The first payment is one month later. */
  start: CalendarDate;
  /**
   * The monthly amount the household has deliberately set aside for card
   * debt. 0 means "not stated", and then no freed amount is reported.
   */
  householdBudget?: number;
};

export type CardPath = {
  strategy: CardPathStrategy;
  /**
   * The balance both paths start from, echoed back.
   *
   * Carried here so a consumer drawing month 0 does not have to reconstruct
   * it out of the first schedule row — `balance + principal` is arithmetic a
   * chart adapter has no business doing, and both paths must start from the
   * same figure for the comparison to mean anything.
   */
  startingBalance: number;
  /**
   * The level payment this path holds, or null for a declining minimum.
   *
   * Null is the point of the comparison, not a missing figure: a path whose
   * payment falls every month has no single number to report.
   */
  levelPayment: number | null;
  /**
   * The fixed amount paid ON TOP of the minimum, for a minimum path. 0
   * otherwise.
   *
   * Carried so a label can name the rule the path actually follows: "chỉ trả
   * mức tối thiểu" is the wrong name for a minimum with 1 triệu added, and
   * that was a reported defect on the rendered page.
   */
  extraPerMonth: number;
  result: CardPayoffResult;
  /** Whole months to clear, from the schedule's own length. */
  months: number;
  /** The calendar date of the last payment, anchored to the start day. */
  payoffDate: CalendarDate;
  /** The largest payment the path asks for — the first one, on every rule. */
  highestPayment: number;
};

export type CardBudget = {
  /** What the household said it had set aside each month. */
  amount: number;
  /**
   * The last payment the plan makes, which lands IN the payoff month.
   *
   * The payoff month is not a free month: the allocation still has that
   * payment to cover. On the reference fixture — 3 triệu a month against
   * 50 triệu at 30%/năm — the last payment is 2.758.271,67 ₫, so only
   * 241.728,33 ₫ of that month's 3 triệu is released.
   */
  finalPayment: number;
  /** `amount − finalPayment`. Negative when the last payment exceeds it. */
  finalMonthSurplus: number;
  /**
   * The first month in which the WHOLE allocation is free: one after the
   * payoff month.
   *
   * Reported separately from the payoff date because they are different
   * facts, and a page that used the payoff date for both would claim the full
   * amount in a month that still contains a payment.
   */
  fullBudgetFromMonth: number;
  fullBudgetFromDate: CalendarDate;
  /**
   * Whether that allocation covers every payment the chosen plan asks for.
   *
   * False is a real answer the page reports, not an input error: a household
   * that has set aside less than the plan needs has a plan it cannot run.
   */
  coversPlan: boolean;
  /** How much more a month the plan needs. 0 when the allocation covers it. */
  shortfall: number;
  /**
   * The amount that stops going out once the card is clear — the allocation,
   * and nothing derived from a falling minimum payment.
   */
  freedMonthly: number;
  /**
   * The plan's own payoff month, which is the last month the allocation has
   * a payment to make. `fullBudgetFromMonth` is when the whole amount is
   * free; this is only when the DEBT ends.
   */
  freedFromMonth: number;
  freedFromDate: CalendarDate;
};

/**
 * Why a plan could not be built, for a page that has to say which it is.
 *
 * `payFixed`, `payMinimum` and `paymentForMonths` all answer `null`, and
 * these are three different answers: a payment that can never clear the debt
 * needs a bigger payment, a plan that runs past the supported horizon needs
 * the reader to know the horizon exists, and an unusable figure needs the
 * field fixed. Calling all three "this debt never ends" would be wrong twice.
 */
export type CardRefusal = "invalid" | "neverClears" | "beyondHorizon";

/**
 * Classify a refusal. Null when `planCardPayoff` would return a plan.
 *
 * The month-1 test runs the SAME expressions the simulations run —
 * `monthlyCardRate` and `minimumPaymentFor` — rather than a second copy of
 * the rule, which is how a classifier and the thing it classifies drift
 * apart.
 */
export function cardRefusalReason(input: CardPlanInput): CardRefusal | null {
  if (planCardPayoff(input) !== null) return null;

  const {
    balance,
    annualRatePercent,
    strategy,
    monthlyPayment,
    targetMonths,
    minimumPercent,
    minimumFloor,
    extraPerMonth = 0,
    start,
    householdBudget = 0,
  } = input;

  const numbers = [
    balance,
    annualRatePercent,
    minimumPercent,
    minimumFloor,
    extraPerMonth,
    householdBudget,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) {
    return "invalid";
  }
  if (balance <= 0 || minimumPercent > 100) return "invalid";
  if (!isValidDate(start)) return "invalid";

  const rate = monthlyCardRate(annualRatePercent);
  const firstInterest = balance * rate;

  if (strategy === "fixed") {
    if (
      monthlyPayment === undefined ||
      !Number.isFinite(monthlyPayment) ||
      monthlyPayment < 0
    ) {
      return "invalid";
    }
    return monthlyPayment <= firstInterest ? "neverClears" : "beyondHorizon";
  }

  if (strategy === "target") {
    if (
      targetMonths === undefined ||
      !Number.isInteger(targetMonths) ||
      targetMonths <= 0
    ) {
      return "invalid";
    }
    // An annuity payment clears in exactly its own term by construction, so
    // the only way a valid target fails is a term past the supported horizon.
    return "beyondHorizon";
  }

  const first = minimumPaymentFor({
    owed: balance,
    rate,
    minimumPercent,
    minimumFloor,
    extraPerMonth,
  });
  return first.payment <= first.interest ? "neverClears" : "beyondHorizon";
}

export type CardPlanResult = {
  start: CalendarDate;
  /** One month after the start. */
  firstPaymentDate: CalendarDate;
  /** The path the reader asked for. */
  plan: CardPath;
  /**
   * The other path, at the same balance and the same rate.
   *
   * Null when it cannot be built — a minimum that never covers the interest
   * has no schedule at all. A failed comparison is not a zero difference, so
   * the differences below go null with it.
   */
  comparison: CardPath | null;
  /** `comparison.months − plan.months`. Positive means the plan is faster. */
  monthsDifference: number | null;
  /** `comparison.totalInterest − plan.totalInterest`. */
  interestDifference: number | null;
  /** Null when no household allocation was stated. */
  budget: CardBudget | null;
};

/** Build one path from a schedule the card module already produced. */
function pathOf(
  strategy: CardPathStrategy,
  levelPayment: number | null,
  result: CardPayoffResult,
  start: CalendarDate,
  balance: number,
  extraPerMonth = 0,
): CardPath | null {
  const months = result.months;
  // Anchored to the START day — see the module docstring on why this is not
  // chained through the first payment date.
  const payoffDate = addMonths(start, months);
  if (payoffDate === null) return null;
  return {
    strategy,
    startingBalance: balance,
    levelPayment,
    extraPerMonth,
    result,
    months,
    payoffDate,
    highestPayment: Math.max(
      ...result.schedule.map((month) => month.payment),
    ),
  };
}

/**
 * The plan the reader asked for, the other path, and the dates.
 *
 * Null when the inputs cannot describe a card, when the chosen strategy's own
 * schedule does not exist (a payment that never covers the first month's
 * interest), or when the start date does not exist. A failed COMPARISON is
 * not null — it is a null `comparison`, because the plan is still a real
 * answer.
 */
export function planCardPayoff(input: CardPlanInput): CardPlanResult | null {
  const {
    balance,
    annualRatePercent,
    strategy,
    monthlyPayment,
    targetMonths,
    minimumPercent,
    minimumFloor,
    extraPerMonth = 0,
    start,
    householdBudget = 0,
  } = input;

  const numbers = [
    balance,
    annualRatePercent,
    minimumPercent,
    minimumFloor,
    extraPerMonth,
    householdBudget,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (minimumPercent > 100) return null;

  const firstPaymentDate = addMonths(start, 1);
  // `addMonths` refuses a date that does not exist, which is also the check
  // that validates the start.
  if (firstPaymentDate === null) return null;

  const minimumRule = {
    balance,
    annualRatePercent,
    minimumPercent,
    minimumFloor,
  };

  let plan: CardPath | null = null;
  if (strategy === "fixed") {
    if (
      monthlyPayment === undefined ||
      !Number.isFinite(monthlyPayment) ||
      monthlyPayment < 0
    ) {
      return null;
    }
    const result = payFixed({ balance, annualRatePercent, monthlyPayment });
    if (result === null) return null;
    plan = pathOf("fixed", monthlyPayment, result, start, balance);
  } else if (strategy === "target") {
    if (
      targetMonths === undefined ||
      !Number.isInteger(targetMonths) ||
      targetMonths <= 0
    ) {
      return null;
    }
    // Solve the level payment, then SIMULATE it, so the payment quoted and
    // the schedule drawn are the same plan.
    const solved = paymentForMonths({
      balance,
      annualRatePercent,
      months: targetMonths,
    });
    if (solved === null) return null;
    const result = payFixed({
      balance,
      annualRatePercent,
      monthlyPayment: solved,
    });
    if (result === null) return null;
    plan = pathOf("target", solved, result, start, balance);
  } else {
    const result = payMinimum({ ...minimumRule, extraPerMonth });
    if (result === null) return null;
    // A declining minimum has no level payment, even with a fixed extra on
    // top of it: the minimum part still falls every month.
    plan = pathOf("minimum", null, result, start, balance, extraPerMonth);
  }
  if (plan === null) return null;

  // The other path. Against a level plan it is the declining minimum, which
  // is the trap row 30 exists to show; against the minimum it is that same
  // first payment held flat, which is the comparison the minimum route was
  // built on.
  let comparison: CardPath | null = null;
  if (strategy === "minimum") {
    const flat = payFixed({
      balance,
      annualRatePercent,
      monthlyPayment: plan.result.firstPayment,
    });
    comparison =
      flat === null
        ? null
        : pathOf("minimumFlat", plan.result.firstPayment, flat, start, balance);
  } else {
    const minimum = payMinimum(minimumRule);
    comparison =
      minimum === null
        ? null
        : pathOf("minimum", null, minimum, start, balance);
  }

  const monthsDifference =
    comparison === null ? null : comparison.months - plan.months;
  const interestDifference =
    comparison === null
      ? null
      : comparison.result.totalInterest - plan.result.totalInterest;

  // One month after the payoff month, anchored to the START like every other
  // date here — never to the payoff date, which may have been clamped in a
  // short month.
  const fullBudgetFromDate = addMonths(start, plan.months + 1);
  const budget: CardBudget | null =
    householdBudget > 0 && fullBudgetFromDate !== null
      ? {
          amount: householdBudget,
          finalPayment: plan.result.lastPayment,
          finalMonthSurplus: householdBudget - plan.result.lastPayment,
          fullBudgetFromMonth: plan.months + 1,
          fullBudgetFromDate,
          coversPlan: householdBudget >= plan.highestPayment,
          shortfall: Math.max(0, plan.highestPayment - householdBudget),
          // The allocation itself. NOT the first minimum, and not the
          // difference between two paths.
          freedMonthly: householdBudget,
          freedFromMonth: plan.months,
          freedFromDate: plan.payoffDate,
        }
      : null;

  return {
    start,
    firstPaymentDate,
    plan,
    comparison,
    monthsDifference,
    interestDifference,
    budget,
  };
}
