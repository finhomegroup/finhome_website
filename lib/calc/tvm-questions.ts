/**
 * The everyday questions behind the TVM solver, for
 * /cong-cu/gia-tri-tien-te-theo-thoi-gian/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `tvm-questions.test.ts`.
 *
 * WHY THIS EXISTS. Original row 18 asks the page to open on an everyday
 * question instead of on "chọn đại lượng cần tìm: PV / FV / PMT / N / r". The
 * generic solver is correct and stays — it is the only tool in the suite that
 * can take a loan with a non-zero closing balance — but a reader who wants to
 * know what 5 triệu a month becomes should not have to learn a sign convention
 * first. So this is an ADAPTER, not a second engine:
 *
 * - the algebraic answer comes from `solveTvm`, unchanged;
 * - the month-by-month schedule and the funded month come from
 *   `projectSavings`, unchanged.
 *
 * THE SIGN CONVENTION IS APPLIED HERE, ONCE, AND IT IS REPORTED. Amounts
 * arrive as the reader states them — all positive — and `signed` records
 * exactly what was handed to the generic solver, so the friendly mode cannot
 * quietly disagree with the advanced one about which way the money moved.
 * `finance.ts`'s convention is NOT changed for anybody.
 *
 * AN ALGEBRAIC PERIOD IS NOT A CONTRIBUTION SCHEDULE, and this is the finding
 * the module is shaped around. On the reviewed fixture — 500 triệu today,
 * 5 triệu at the end of each month, 6%/năm danh nghĩa, mục tiêu 800 triệu —
 * `nper` returns 36,55539635919235 periods. There is no 36,56th standing
 * order: month 36 closes at 795.020.787,24 and month 37 at 803.995.891,17, so
 * the first month the saver actually has the money is 37. Both are reported,
 * the fractional one labelled as algebra, because rounding 36,55 down to "36
 * tháng" claims a goal is met two months of spending early and rounding it up
 * without checking would be a guess.
 *
 * END-OF-MONTH ONLY, DELIBERATELY. `projectSavings` contributes at the end of
 * each month, which is what a standing order does and what every other
 * savings tool in this suite assumes. The annuity-due option stays in the
 * advanced mode, where the schedule is not drawn; offering it here would put
 * the timeline and the headline on two different conventions. The rate is
 * NOMINAL annual divided by 12, the same reading `muc-tieu-tiet-kiem` uses —
 * not the geometric conversion `fund-fees.ts` documents. Two conventions in
 * the suite, each stated at its own call site.
 */

import {
  balanceAfter as balanceAfterMonths,
  MAX_PROJECTION_MONTHS,
  projectSavings,
  type SavingsSchedule,
} from "@/lib/calc/savings-schedule";
import { solveTvm } from "@/lib/calc/tvm";

/** The three questions the guided entry answers. */
export type TvmQuestion =
  /** "Tôi có ... và góp ... mỗi tháng — sau N tháng có bao nhiêu?" */
  | "balanceAfter"
  /** "Tôi cần ... sau N tháng — mỗi tháng phải góp bao nhiêu?" */
  | "contributionNeeded"
  /** "Tôi có ... và góp ... — bao lâu thì đủ ...?" */
  | "monthsNeeded";

export type TvmQuestionInput = {
  question: TvmQuestion;
  /** What the reader already has, as entered: positive or zero. */
  currentSavings: number;
  /** What they put in at the END of each month. Positive or zero. */
  monthlyContribution?: number;
  /** The amount they are aiming at. Positive. */
  goal?: number;
  /** Whole months. Required by the two questions that fix a horizon. */
  months?: number;
  /** NOMINAL annual rate, in percent, divided by 12 for the month. */
  annualRatePercent: number;
};

export type TvmQuestionResult = {
  question: TvmQuestion;
  /** The monthly rate this ran on, so the conversion is visible. */
  monthlyRatePercent: number;
  /** Echoed positives, after validation. */
  currentSavings: number;
  monthlyContribution: number;
  goal: number | null;
  /** The horizon the answer is stated at. Solved in `monthsNeeded`. */
  months: number | null;
  /** Balance at `months`, from the discrete schedule. */
  balanceAtHorizon: number | null;
  /** `currentSavings + monthlyContribution × months`, at `months`. */
  totalContributed: number | null;
  /** `balanceAtHorizon − totalContributed`: what the rate added. */
  interest: number | null;
  /** `contributionNeeded` only: the monthly amount, as a positive figure. */
  requiredMonthlyContribution: number | null;
  /**
   * `monthsNeeded` only: the solver's own fractional answer.
   *
   * Kept apart from `fundedMonth` on purpose — see the module header.
   */
  exactPeriods: number | null;
  /** `monthsNeeded` only: first whole month whose closing balance covers. */
  fundedMonth: number | null;
  /** Closing balance at `fundedMonth`, and at the month before it. */
  balanceAtFundedMonth: number | null;
  balanceBeforeFundedMonth: number | null;
  /** The discrete plan: `projectSavings`, including its status and points. */
  schedule: SavingsSchedule;
  /** What the generic solver was actually given, sign convention included. */
  signed: {
    presentValue: number;
    payment: number;
    futureValue: number;
    ratePercentPerPeriod: number;
    periods: number | null;
  };
};

/** The horizon the guided mode supports, shared with `projectSavings`. */
export const MAX_QUESTION_MONTHS = MAX_PROJECTION_MONTHS;

/**
 * Answer one everyday question.
 *
 * Null when the inputs cannot describe a plan: a negative amount, a
 * non-positive goal where one is needed, a horizon that is not a whole number
 * of months or runs past `MAX_QUESTION_MONTHS`, a negative rate (the guided
 * mode is a savings plan; the advanced solver still takes one), any
 * non-finite figure, or a solve the generic module itself refuses.
 *
 * `monthsNeeded` returns a result whose `fundedMonth` is null when the plan
 * does not get there inside the horizon cap — the schedule's own status says
 * which case it is, and a page reads that rather than a zero.
 */
export function answerTvmQuestion(
  input: TvmQuestionInput,
): TvmQuestionResult | null {
  const {
    question,
    currentSavings,
    monthlyContribution = 0,
    goal,
    months,
    annualRatePercent,
  } = input;

  const nonNegative = [currentSavings, monthlyContribution, annualRatePercent];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }

  const needsGoal = question !== "balanceAfter";
  if (needsGoal) {
    if (goal === undefined || !Number.isFinite(goal) || goal <= 0) return null;
  }

  const needsHorizon = question !== "monthsNeeded";
  if (needsHorizon) {
    if (
      months === undefined ||
      !Number.isSafeInteger(months) ||
      months < 1 ||
      months > MAX_QUESTION_MONTHS
    ) {
      return null;
    }
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyRatePercent = annualRatePercent / 12;

  // The sign convention, applied once: money leaving the reader today and each
  // month is negative, the balance they end up with is positive.
  const signedPresent = -currentSavings;
  const signedPayment = -monthlyContribution;

  if (question === "balanceAfter") {
    const solved = solveTvm({
      solveFor: "futureValue",
      presentValue: signedPresent,
      payment: signedPayment,
      periods: months!,
      ratePercentPerPeriod: monthlyRatePercent,
    });
    if (solved === null) return null;
    const schedule = projectSavings({
      initial: currentSavings,
      contribution: monthlyContribution,
      monthlyRate,
      months: months!,
    });
    if (schedule.status === "invalid") return null;
    return {
      question,
      monthlyRatePercent,
      currentSavings,
      monthlyContribution,
      goal: null,
      months: months!,
      balanceAtHorizon: schedule.balance,
      totalContributed: schedule.totalContributed,
      interest: schedule.interest,
      requiredMonthlyContribution: null,
      exactPeriods: null,
      fundedMonth: null,
      balanceAtFundedMonth: null,
      balanceBeforeFundedMonth: null,
      schedule,
      signed: {
        presentValue: signedPresent,
        payment: signedPayment,
        futureValue: solved.futureValue,
        ratePercentPerPeriod: monthlyRatePercent,
        periods: months!,
      },
    };
  }

  if (question === "contributionNeeded") {
    const solved = solveTvm({
      solveFor: "payment",
      presentValue: signedPresent,
      futureValue: goal!,
      periods: months!,
      ratePercentPerPeriod: monthlyRatePercent,
    });
    if (solved === null) return null;
    // The solver reports an outflow, so the friendly figure is its magnitude —
    // and a NEGATIVE outflow would mean the plan is already funded and asks
    // the saver to take money out, which is not a contribution.
    const required = -solved.payment;
    const schedule = projectSavings({
      initial: currentSavings,
      contribution: Math.max(0, required),
      monthlyRate,
      months: months!,
      target: goal!,
    });
    if (schedule.status === "invalid") return null;
    return {
      question,
      monthlyRatePercent,
      currentSavings,
      monthlyContribution: Math.max(0, required),
      goal: goal!,
      months: months!,
      balanceAtHorizon: schedule.balance,
      totalContributed: schedule.totalContributed,
      interest: schedule.interest,
      requiredMonthlyContribution: required,
      exactPeriods: null,
      fundedMonth: schedule.fundedMonth,
      balanceAtFundedMonth: null,
      balanceBeforeFundedMonth: null,
      schedule,
      signed: {
        presentValue: signedPresent,
        payment: solved.payment,
        futureValue: goal!,
        ratePercentPerPeriod: monthlyRatePercent,
        periods: months!,
      },
    };
  }

  // monthsNeeded. The solver gives the algebraic period count; the schedule
  // gives the month a standing order actually funds the goal. Both are
  // reported and the page says which is which.
  const solved = solveTvm({
    solveFor: "periods",
    presentValue: signedPresent,
    payment: signedPayment,
    futureValue: goal!,
    ratePercentPerPeriod: monthlyRatePercent,
  });
  const schedule = projectSavings({
    initial: currentSavings,
    contribution: monthlyContribution,
    monthlyRate,
    target: goal!,
    limitMonths: MAX_QUESTION_MONTHS,
  });
  if (schedule.status === "invalid") return null;

  const balanceAt = (month: number | null): number | null => {
    if (month === null || month < 0) return null;
    const point = schedule.points.find((p) => p.period === month);
    if (point) return point.balance;
    // `points` is a bounded sample, so the month before a funded month is not
    // always in it. Recompute with the schedule's OWN exported closing-balance
    // function rather than re-deriving the annuity here or reporting a
    // neighbouring month's balance as this one's.
    return balanceAfterMonths(
      month,
      currentSavings,
      monthlyContribution,
      monthlyRate,
    );
  };

  const fundedMonth = schedule.fundedMonth;
  return {
    question,
    monthlyRatePercent,
    currentSavings,
    monthlyContribution,
    goal: goal!,
    months: fundedMonth,
    balanceAtHorizon: fundedMonth === null ? null : balanceAt(fundedMonth),
    totalContributed:
      fundedMonth === null
        ? null
        : currentSavings + monthlyContribution * fundedMonth,
    interest:
      fundedMonth === null
        ? null
        : (balanceAt(fundedMonth) ?? 0) -
          (currentSavings + monthlyContribution * fundedMonth),
    requiredMonthlyContribution: null,
    // Null when the cash flows never reach the goal, which `solveTvm` reports
    // by refusing rather than by returning a huge number.
    exactPeriods: solved === null ? null : solved.periods,
    fundedMonth,
    balanceAtFundedMonth: balanceAt(fundedMonth),
    balanceBeforeFundedMonth:
      fundedMonth === null || fundedMonth === 0
        ? null
        : balanceAt(fundedMonth - 1),
    schedule,
    signed: {
      presentValue: signedPresent,
      payment: signedPayment,
      futureValue: goal!,
      ratePercentPerPeriod: monthlyRatePercent,
      periods: solved === null ? null : solved.periods,
    },
  };
}
