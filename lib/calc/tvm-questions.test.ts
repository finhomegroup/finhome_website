// Original row 18's question-first entry, against independently computed
// oracles.
//
// The fixtures below were computed in plain JavaScript with no production
// import, and they are the ones an independent review executed: 500 triệu
// today, 5 triệu at the END of each month, 6% NOMINAL annual (0,5%/tháng).
//
//   36 months, end-of-month payments:      795.020.787,2351221
//   36 months, beginning-of-month payments: 796.004.189,8592391
//   reaching 800 triệu in 36 months needs   5.126.581,235466714 / month
//   the same at 0%:                         8.333.333,333333333 / month
//   the algebraic period count for 5 triệu:     36,55539635919235
//   month 37's closing balance:             803.995.891,1712976
//
// The last three lines are the finding this file guards: there is no 36,56th
// standing order, so the first month the saver HAS the money is 37.
import { describe, expect, it } from "vitest";
import {
  answerTvmQuestion,
  MAX_QUESTION_MONTHS,
} from "@/lib/calc/tvm-questions";
import { solveTvm } from "@/lib/calc/tvm";

const BASE = {
  currentSavings: 500_000_000,
  monthlyContribution: 5_000_000,
  annualRatePercent: 6,
};

describe("what will I have — the horizon question", () => {
  const r = answerTvmQuestion({
    ...BASE,
    question: "balanceAfter",
    months: 36,
  })!;

  it("hits the independent closed form at the horizon", () => {
    expect(r.balanceAtHorizon).toBeCloseTo(795_020_787.2351221, 4);
  });

  it("states the monthly rate it ran on, nominal ÷ 12", () => {
    expect(r.monthlyRatePercent).toBeCloseTo(0.5, 12);
  });

  it("splits the balance into the reader's own money and the rest", () => {
    expect(r.totalContributed).toBe(500_000_000 + 5_000_000 * 36);
    expect(r.interest).toBeCloseTo(795_020_787.2351221 - 680_000_000, 4);
  });

  it("agrees with the generic solver, which it delegates to", () => {
    // The whole point of the adapter: same answer, friendlier inputs.
    const generic = solveTvm({
      solveFor: "futureValue",
      presentValue: -500_000_000,
      payment: -5_000_000,
      periods: 36,
      ratePercentPerPeriod: 0.5,
    })!;
    expect(generic.futureValue).toBeCloseTo(r.balanceAtHorizon!, 4);
  });

  it("records the SIGNED inputs it handed the solver", () => {
    // `finance.ts`'s convention is applied here and reported, not changed.
    expect(r.signed.presentValue).toBe(-500_000_000);
    expect(r.signed.payment).toBe(-5_000_000);
    expect(r.signed.futureValue).toBeCloseTo(795_020_787.2351221, 4);
  });

  it("draws a bounded timeline that keeps both endpoints", () => {
    expect(r.schedule.status).toBe("horizon");
    expect(r.schedule.points[0].period).toBe(0);
    expect(r.schedule.points[0].balance).toBe(500_000_000);
    expect(r.schedule.points.at(-1)!.period).toBe(36);
  });
});

describe("how much a month — the goal question", () => {
  const r = answerTvmQuestion({
    currentSavings: 500_000_000,
    annualRatePercent: 6,
    question: "contributionNeeded",
    goal: 800_000_000,
    months: 36,
  })!;

  it("solves the contribution the review computed", () => {
    expect(r.requiredMonthlyContribution).toBeCloseTo(5_126_581.235466714, 4);
  });

  it("reports a POSITIVE amount to pay in, from a negative solver figure", () => {
    expect(r.signed.payment).toBeLessThan(0);
    expect(r.requiredMonthlyContribution!).toBeGreaterThan(0);
    expect(r.requiredMonthlyContribution).toBeCloseTo(-r.signed.payment, 9);
  });

  it("funds the goal at exactly the horizon it was given", () => {
    expect(r.fundedMonth).toBe(36);
    expect(r.balanceAtHorizon).toBeCloseTo(800_000_000, 2);
  });

  it("falls back to plain division at a zero rate", () => {
    const flat = answerTvmQuestion({
      currentSavings: 500_000_000,
      annualRatePercent: 0,
      question: "contributionNeeded",
      goal: 800_000_000,
      months: 36,
    })!;
    expect(flat.requiredMonthlyContribution).toBeCloseTo(
      8_333_333.333333333,
      6,
    );
    expect(flat.interest).toBeCloseTo(0, 6);
  });

  it("never asks for a negative contribution on an already-funded goal", () => {
    // 900 triệu today against a 800 triệu goal: the algebra says "take money
    // out", which is not a contribution. The figure is reported as solved and
    // the schedule runs on 0.
    const funded = answerTvmQuestion({
      currentSavings: 900_000_000,
      annualRatePercent: 6,
      question: "contributionNeeded",
      goal: 800_000_000,
      months: 36,
    })!;
    expect(funded.requiredMonthlyContribution!).toBeLessThan(0);
    expect(funded.monthlyContribution).toBe(0);
    expect(funded.schedule.status).toBe("alreadyFunded");
    expect(funded.fundedMonth).toBe(0);
  });
});

describe("how long — and an algebraic period is not a month", () => {
  const r = answerTvmQuestion({
    ...BASE,
    question: "monthsNeeded",
    goal: 800_000_000,
  })!;

  it("keeps the solver's fractional answer as algebra", () => {
    expect(r.exactPeriods).toBeCloseTo(36.55539635919235, 9);
  });

  it("reports the first month a standing order actually funds it", () => {
    // NOT 36, and not a rounded 37 either: month 37 is the first closing
    // balance that covers the goal, and month 36's does not.
    expect(r.fundedMonth).toBe(37);
    expect(r.balanceBeforeFundedMonth).toBeCloseTo(795_020_787.2351221, 4);
    expect(r.balanceAtFundedMonth).toBeCloseTo(803_995_891.1712976, 4);
    expect(r.balanceBeforeFundedMonth!).toBeLessThan(800_000_000);
    expect(r.balanceAtFundedMonth!).toBeGreaterThan(800_000_000);
    expect(Math.ceil(r.exactPeriods!)).toBe(r.fundedMonth);
  });

  it("reports the money in and the interest at the FUNDED month", () => {
    expect(r.months).toBe(37);
    expect(r.totalContributed).toBe(500_000_000 + 5_000_000 * 37);
    expect(r.interest).toBeCloseTo(803_995_891.1712976 - 685_000_000, 4);
  });

  it("says a goal already met is met at month 0, not at month 1", () => {
    const already = answerTvmQuestion({
      ...BASE,
      question: "monthsNeeded",
      goal: 400_000_000,
    })!;
    expect(already.schedule.status).toBe("alreadyFunded");
    expect(already.fundedMonth).toBe(0);
    expect(already.balanceBeforeFundedMonth).toBeNull();
  });

  it("withholds a month rather than inventing one past the cap", () => {
    // Nothing coming in and nothing accruing: the balance never moves.
    const stuck = answerTvmQuestion({
      currentSavings: 100_000_000,
      monthlyContribution: 0,
      annualRatePercent: 0,
      question: "monthsNeeded",
      goal: 800_000_000,
    })!;
    expect(stuck.fundedMonth).toBeNull();
    expect(stuck.months).toBeNull();
    expect(stuck.balanceAtHorizon).toBeNull();
    expect(stuck.exactPeriods).toBeNull();
    expect(stuck.schedule.status).toBe("unattainable");
  });

  it("names the beyond-horizon case as its own state", () => {
    const slow = answerTvmQuestion({
      currentSavings: 1_000_000,
      monthlyContribution: 1_000,
      annualRatePercent: 0,
      question: "monthsNeeded",
      goal: 800_000_000,
    })!;
    expect(slow.fundedMonth).toBeNull();
    expect(slow.schedule.status).toBe("beyondLimit");
    expect(slow.schedule.limitMonths).toBe(MAX_QUESTION_MONTHS);
  });
});

describe("refusals", () => {
  it("refuses a horizon past the supported cap, before allocating", () => {
    expect(
      answerTvmQuestion({
        ...BASE,
        question: "balanceAfter",
        months: MAX_QUESTION_MONTHS + 1,
      }),
    ).toBeNull();
    expect(
      answerTvmQuestion({
        ...BASE,
        question: "balanceAfter",
        months: MAX_QUESTION_MONTHS,
      }),
    ).not.toBeNull();
  });

  it("refuses a fractional horizon: half a standing order is not a thing", () => {
    expect(
      answerTvmQuestion({ ...BASE, question: "balanceAfter", months: 36.5 }),
    ).toBeNull();
  });

  it("refuses a negative amount or a negative rate in the guided mode", () => {
    expect(
      answerTvmQuestion({
        ...BASE,
        currentSavings: -1,
        question: "balanceAfter",
        months: 36,
      }),
    ).toBeNull();
    // The ADVANCED solver still takes one; this entry is a savings plan.
    expect(
      answerTvmQuestion({
        ...BASE,
        annualRatePercent: -2,
        question: "balanceAfter",
        months: 36,
      }),
    ).toBeNull();
  });

  it("refuses a missing or non-positive goal where one is needed", () => {
    expect(
      answerTvmQuestion({ ...BASE, question: "monthsNeeded" }),
    ).toBeNull();
    expect(
      answerTvmQuestion({ ...BASE, question: "monthsNeeded", goal: 0 }),
    ).toBeNull();
    expect(
      answerTvmQuestion({
        ...BASE,
        question: "contributionNeeded",
        goal: 800_000_000,
      }),
    ).toBeNull();
  });
});
