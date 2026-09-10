import { describe, it, expect } from "vitest";
import {
  computeSavingsGoal,
  type SavingsGoalInput,
} from "@/lib/calc/savings-goal";

// Saving 500 triệu for a deposit in 5 years, starting from 100 triệu, at 6%.
const BASE: SavingsGoalInput = {
  mode: "contribution",
  initial: 100_000_000,
  target: 500_000_000,
  months: 60,
  annualRatePercent: 6,
};

function goal(input: SavingsGoalInput) {
  const result = computeSavingsGoal(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeSavingsGoal — solving for the contribution", () => {
  it("hits the target from the starting balance", () => {
    const result = goal(BASE);
    expect(result.contribution).toBeGreaterThan(0);
    expect(result.target).toBe(500_000_000);
    expect(result.months).toBe(60);
  });

  it("round-trips through the target mode", () => {
    // The three modes must agree: feed the solved contribution back in and
    // the target must come out.
    const solved = goal(BASE);
    const back = goal({
      mode: "target",
      initial: 100_000_000,
      contribution: solved.contribution,
      months: 60,
      annualRatePercent: 6,
    });
    expect(back.target).toBeCloseTo(500_000_000, 2);
  });

  it("round-trips through the months mode", () => {
    const solved = goal(BASE);
    const back = goal({
      mode: "months",
      initial: 100_000_000,
      target: 500_000_000,
      contribution: solved.contribution,
      annualRatePercent: 6,
    });
    expect(back.months).toBeCloseTo(60, 4);
  });

  it("needs less each month at a higher rate", () => {
    const low = goal({ ...BASE, annualRatePercent: 3 }).contribution;
    const high = goal({ ...BASE, annualRatePercent: 9 }).contribution;
    expect(high).toBeLessThan(low);
  });

  it("needs less each month over a longer horizon", () => {
    const short = goal({ ...BASE, months: 36 }).contribution;
    const long = goal({ ...BASE, months: 120 }).contribution;
    expect(long).toBeLessThan(short);
  });

  it("matches plain division at a 0% rate", () => {
    const result = goal({ ...BASE, annualRatePercent: 0 });
    expect(result.contribution).toBeCloseTo((500_000_000 - 100_000_000) / 60, 6);
    expect(result.interestEarned).toBeCloseTo(0, 2);
  });

  it("works from a zero starting balance", () => {
    const result = goal({ ...BASE, initial: 0 });
    expect(result.contribution).toBeGreaterThan(goal(BASE).contribution);
    expect(result.totalContributed).toBeCloseTo(result.contribution * 60, 6);
  });

  it("returns null when the starting balance already overshoots", () => {
    // The rate alone carries 500 triệu past 500 triệu in 60 months, so the
    // required contribution is negative. "Save a negative amount" is not
    // advice, so it is no result.
    expect(
      computeSavingsGoal({ ...BASE, initial: 500_000_000 }),
    ).toBeNull();
  });
});

describe("computeSavingsGoal — solving for the horizon", () => {
  const MONTHS: SavingsGoalInput = {
    mode: "months",
    initial: 100_000_000,
    target: 500_000_000,
    contribution: 6_000_000,
    annualRatePercent: 6,
  };

  it("finds how long the contribution takes", () => {
    const result = goal(MONTHS);
    expect(result.months).toBeGreaterThan(0);
    expect(result.months).toBeLessThan(120);
  });

  it("does not round the answer", () => {
    // 47,3 months is honest; rounding down would claim the goal is met early.
    const result = goal(MONTHS);
    expect(Number.isInteger(result.months)).toBe(false);
  });

  it("takes longer with a smaller contribution", () => {
    const small = goal({ ...MONTHS, contribution: 3_000_000 }).months;
    const large = goal({ ...MONTHS, contribution: 12_000_000 }).months;
    expect(small).toBeGreaterThan(large);
  });

  it("matches plain division at a 0% rate", () => {
    const result = goal({ ...MONTHS, annualRatePercent: 0 });
    expect(result.months).toBeCloseTo(400 / 6, 6);
  });

  it("reaches the target on the rate alone when nothing is contributed", () => {
    const result = goal({ ...MONTHS, contribution: 0 });
    expect(result.months).toBeGreaterThan(0);
    expect(result.totalContributed).toBe(100_000_000);
    expect(result.interestEarned).toBeCloseTo(400_000_000, 2);
  });

  it("returns null when the target is already met", () => {
    expect(
      computeSavingsGoal({ ...MONTHS, target: 100_000_000 }),
    ).toBeNull();
    expect(
      computeSavingsGoal({ ...MONTHS, target: 50_000_000 }),
    ).toBeNull();
  });

  it("returns null when nothing can ever reach the target", () => {
    // No contribution and no rate: the balance never moves.
    expect(
      computeSavingsGoal({
        ...MONTHS,
        contribution: 0,
        annualRatePercent: 0,
      }),
    ).toBeNull();
  });
});

describe("computeSavingsGoal — solving for the target", () => {
  const TARGET: SavingsGoalInput = {
    mode: "target",
    initial: 100_000_000,
    contribution: 6_000_000,
    months: 60,
    annualRatePercent: 6,
  };

  it("compounds the starting balance and the contributions", () => {
    const result = goal(TARGET);
    // Contributions alone would be 460 triệu; the rate must add to that.
    expect(result.totalContributed).toBeCloseTo(460_000_000, 6);
    expect(result.target).toBeGreaterThan(460_000_000);
    expect(result.interestEarned).toBeGreaterThan(0);
  });

  it("keeps the interest identity", () => {
    const result = goal(TARGET);
    expect(result.interestEarned).toBeCloseTo(
      result.target - result.totalContributed,
      6,
    );
    expect(result.interestSharePercent).toBeCloseTo(
      (result.interestEarned / result.target) * 100,
      10,
    );
  });

  it("earns nothing at a 0% rate", () => {
    const result = goal({ ...TARGET, annualRatePercent: 0 });
    expect(result.target).toBeCloseTo(460_000_000, 6);
    expect(result.interestEarned).toBeCloseTo(0, 6);
    expect(result.interestSharePercent).toBeCloseTo(0, 6);
  });

  it("grows the interest share over a longer horizon", () => {
    const five = goal({ ...TARGET, months: 60 }).interestSharePercent;
    const twenty = goal({ ...TARGET, months: 240 }).interestSharePercent;
    expect(twenty).toBeGreaterThan(five);
  });

  it("compounds contributions at the END of each month", () => {
    // One period of interest less than a beginning-of-month schedule: with
    // no starting balance, 12 × 1 triệu at 12%/năm is 12.682.503 ₫ end-of-
    // month, not 12.809.328 ₫.
    const result = goal({
      mode: "target",
      initial: 0,
      contribution: 1_000_000,
      months: 12,
      annualRatePercent: 12,
    });
    expect(result.target).toBeCloseTo(12_682_503.013, 2);
  });
});

describe("computeSavingsGoal — rejected inputs", () => {
  it("returns null when the mode's inputs are missing", () => {
    expect(
      computeSavingsGoal({ mode: "contribution", annualRatePercent: 6, target: 1 }),
    ).toBeNull();
    expect(
      computeSavingsGoal({ mode: "months", annualRatePercent: 6, target: 1 }),
    ).toBeNull();
    expect(
      computeSavingsGoal({ mode: "target", annualRatePercent: 6, months: 12 }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeSavingsGoal({ ...BASE, initial: -1 })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, target: -1 })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, months: 0 })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, months: -1 })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, target: Number.NaN })).toBeNull();
    expect(computeSavingsGoal({ ...BASE, initial: Number.NaN })).toBeNull();
    expect(
      computeSavingsGoal({
        mode: "months",
        initial: 0,
        target: 100,
        contribution: -1,
        annualRatePercent: 6,
      }),
    ).toBeNull();
  });
});
