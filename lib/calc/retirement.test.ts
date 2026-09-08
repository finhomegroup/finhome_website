import { describe, expect, it } from "vitest";
import {
  projectRetirement,
  solveRequiredContribution,
  type RetirementInput,
} from "@/lib/calc/retirement";

const BASE: RetirementInput = {
  currentAge: 35,
  retirementAge: 65,
  endAge: 95,
  currentBalance: 100_000,
  annualContribution: 20_000,
  contributionGrowthPercent: 2,
  returnBeforePercent: 7,
  returnAfterPercent: 5,
  inflationPercent: 2.5,
  desiredAnnualSpending: 80_000,
  otherAnnualIncome: 25_000,
};

describe("projectRetirement — structure", () => {
  it("runs one row per year from current age to the year before endAge", () => {
    const result = projectRetirement(BASE)!;
    expect(result.years).toHaveLength(60);
    expect(result.years[0].age).toBe(35);
    expect(result.years[59].age).toBe(94);
  });

  it("splits accumulation from drawdown at the retirement age", () => {
    const result = projectRetirement(BASE)!;
    const accumulating = result.years.filter((row) => row.accumulating);
    const drawing = result.years.filter((row) => !row.accumulating);
    expect(accumulating).toHaveLength(30);
    expect(drawing).toHaveLength(30);
    // Age 64 still contributes; age 65 is the first withdrawal year.
    expect(accumulating[29].age).toBe(64);
    expect(drawing[0].age).toBe(65);
    expect(accumulating[29].withdrawal).toBe(0);
    expect(drawing[0].contribution).toBe(0);
  });

  it("orders contribution before return, so a contribution earns a full year", () => {
    const result = projectRetirement({ ...BASE, retirementAge: 36, endAge: 40 })!;
    const first = result.years[0];
    // (100.000 + 20.000) x 1,07 = 128.400.
    expect(first.contribution).toBe(20_000);
    expect(first.investmentReturn).toBeCloseTo(120_000 * 0.07, 6);
    expect(first.balance).toBeCloseTo(128_400, 6);
  });

  it("orders withdrawal before return, so spent money earns nothing", () => {
    // Retiring immediately: 100.000 balance, needs 80.000 − 25.000 = 55.000.
    const result = projectRetirement({
      ...BASE,
      retirementAge: 35,
      endAge: 40,
      currentBalance: 100_000,
    })!;
    const first = result.years[0];
    expect(first.withdrawal).toBeCloseTo(55_000, 6);
    // Return on the 45.000 that REMAINS, not on the opening 100.000.
    expect(first.investmentReturn).toBeCloseTo(45_000 * 0.05, 6);
    expect(first.balance).toBeCloseTo(47_250, 6);
  });

  it("grows the contribution each year", () => {
    const result = projectRetirement(BASE)!;
    expect(result.years[0].contribution).toBe(20_000);
    expect(result.years[1].contribution).toBeCloseTo(20_400, 6);
    // Year 30 of accumulation: 20.000 x 1,02^29.
    expect(result.years[29].contribution).toBeCloseTo(
      20_000 * Math.pow(1.02, 29),
      6,
    );
  });
});

describe("projectRetirement — inflation", () => {
  it("inflates the spending target to the year it is spent", () => {
    const result = projectRetirement(BASE)!;
    const drawing = result.years.filter((row) => !row.accumulating);
    // Year one of retirement is 30 years out, so the 80.000 target has
    // grown by 1,025^30 and the 25.000 income with it.
    const factor = Math.pow(1.025, 30);
    expect(drawing[0].withdrawal).toBeCloseTo((80_000 - 25_000) * factor, 4);
    // Not inflating the target is how a plan looks funded for 30 years and
    // runs dry in 20 — so the nominal draw must be far above 55.000.
    expect(drawing[0].withdrawal).toBeGreaterThan(55_000 * 2);
  });

  it("reports every balance in today's money as well as nominal", () => {
    const result = projectRetirement(BASE)!;
    const atRetirement = result.years[29];
    // The real figure is the nominal one deflated by the elapsed span.
    expect(atRetirement.realBalance).toBeCloseTo(
      atRetirement.balance / Math.pow(1.025, 30),
      4,
    );
    // And it is much smaller — the reason the module refuses to headline
    // the nominal number.
    expect(atRetirement.realBalance).toBeLessThan(atRetirement.balance / 2);
  });

  it("uses one deflator for the retirement balance", () => {
    const result = projectRetirement(BASE)!;
    expect(result.realBalanceAtRetirement).toBeCloseTo(
      result.balanceAtRetirement / Math.pow(1.025, 30),
      4,
    );
    expect(result.realFinalBalance).toBeCloseTo(
      result.finalBalance / Math.pow(1.025, 60),
      4,
    );
  });

  it("leaves real and nominal identical at zero inflation", () => {
    const result = projectRetirement({ ...BASE, inflationPercent: 0 })!;
    expect(result.realBalanceAtRetirement).toBeCloseTo(
      result.balanceAtRetirement,
      6,
    );
    // And the spending target is not inflated either.
    const drawing = result.years.filter((row) => !row.accumulating);
    expect(drawing[0].withdrawal).toBeCloseTo(55_000, 6);
    expect(drawing[10].withdrawal).toBeCloseTo(55_000, 6);
  });
});

describe("projectRetirement — depletion", () => {
  it("names the year the money runs out", () => {
    const result = projectRetirement({
      ...BASE,
      currentBalance: 10_000,
      annualContribution: 2_000,
      desiredAnnualSpending: 90_000,
      otherAnnualIncome: 0,
    })!;
    expect(result.depletionAge).not.toBe(null);
    expect(result.depletionAge!).toBeGreaterThanOrEqual(65);
    expect(result.depletionAge!).toBeLessThan(95);
    // And says how short the plan is, rather than only that it failed.
    expect(result.yearsShort).toBeGreaterThan(0);
    expect(result.yearsFunded + result.yearsShort).toBe(30);
    expect(result.finalBalance).toBeCloseTo(0, 6);
  });

  it("reports no depletion when the plan holds", () => {
    const result = projectRetirement(BASE)!;
    expect(result.depletionAge).toBe(null);
    expect(result.yearsFunded).toBe(30);
    expect(result.yearsShort).toBe(0);
    expect(result.finalBalance).toBeGreaterThan(0);
  });

  it("never takes out more than there is", () => {
    const result = projectRetirement({
      ...BASE,
      currentBalance: 5_000,
      annualContribution: 0,
      desiredAnnualSpending: 100_000,
      otherAnnualIncome: 0,
    })!;
    for (const row of result.years) {
      expect(row.balance).toBeGreaterThanOrEqual(-1e-9);
      expect(row.withdrawal).toBeGreaterThanOrEqual(0);
    }
  });

  it("does not report a zero final balance without saying why", () => {
    // The failure mode the module exists to avoid: a plan that ends at
    // exactly zero must carry a depletion age, not just a zero.
    const result = projectRetirement({
      ...BASE,
      currentBalance: 1_000,
      annualContribution: 0,
      desiredAnnualSpending: 50_000,
      otherAnnualIncome: 0,
    })!;
    expect(result.finalBalance).toBeCloseTo(0, 6);
    expect(result.depletionAge).not.toBe(null);
  });
});

describe("projectRetirement — sustainable spending", () => {
  it("computes what the balance actually supports, in today's money", () => {
    const result = projectRetirement(BASE)!;
    // The plan is funded, so the sustainable figure must clear what was
    // asked for.
    expect(result.sustainableSpending!).toBeGreaterThan(80_000);
    expect(result.spendingShortfall).toBe(0);
  });

  it("names the shortfall when the plan cannot support the target", () => {
    const result = projectRetirement({
      ...BASE,
      annualContribution: 1_000,
      currentBalance: 20_000,
    })!;
    expect(result.sustainableSpending!).toBeLessThan(80_000);
    expect(result.spendingShortfall).toBeCloseTo(
      80_000 - result.sustainableSpending!,
      6,
    );
  });

  it("agrees with the projection at the break-even spend", () => {
    // The cross-check between the two independent routes: feeding the
    // sustainable figure back in as the target must produce a plan that
    // just barely lasts.
    const probe = projectRetirement(BASE)!;
    const atLimit = projectRetirement({
      ...BASE,
      desiredAnnualSpending: probe.sustainableSpending!,
    })!;
    expect(atLimit.depletionAge).toBe(null);
    // And ends with almost nothing left, in real terms.
    expect(atLimit.realFinalBalance).toBeLessThan(
      probe.realBalanceAtRetirement * 0.02,
    );
  });

  it("divides straight through at a zero real return", () => {
    // The annuity factor divides by the real return, so this case would
    // otherwise be a division by zero rather than a simple split.
    const result = projectRetirement({
      ...BASE,
      returnAfterPercent: 2.5,
      inflationPercent: 2.5,
    })!;
    expect(result.sustainableSpending).toBeCloseTo(
      result.realBalanceAtRetirement / 30 + 25_000,
      4,
    );
  });

  it("supports nothing beyond other income with no balance", () => {
    const result = projectRetirement({
      ...BASE,
      currentBalance: 0,
      annualContribution: 0,
    })!;
    expect(result.balanceAtRetirement).toBe(0);
    expect(result.sustainableSpending).toBe(0);
  });
});

describe("projectRetirement — totals and rates", () => {
  it("reports the initial withdrawal rate", () => {
    const result = projectRetirement(BASE)!;
    const drawing = result.years.filter((row) => !row.accumulating);
    expect(result.initialWithdrawalRatePercent).toBeCloseTo(
      (drawing[0].withdrawal / result.balanceAtRetirement) * 100,
      8,
    );
    // A funded plan lands in single digits.
    expect(result.initialWithdrawalRatePercent!).toBeLessThan(10);
  });

  it("adds up", () => {
    const result = projectRetirement(BASE)!;
    const contributions = result.years.reduce(
      (total, row) => total + row.contribution,
      0,
    );
    const withdrawals = result.years.reduce(
      (total, row) => total + row.withdrawal,
      0,
    );
    const returns = result.years.reduce(
      (total, row) => total + row.investmentReturn,
      0,
    );
    expect(result.totalContributed).toBeCloseTo(contributions, 4);
    expect(result.totalWithdrawn).toBeCloseTo(withdrawals, 4);
    expect(result.totalGrowth).toBeCloseTo(returns, 4);
    // The accounting identity across the whole projection.
    expect(result.finalBalance).toBeCloseTo(
      BASE.currentBalance +
        result.totalContributed +
        result.totalGrowth -
        result.totalWithdrawn,
      3,
    );
  });

  it("captures the balance at the end of the last contributing year", () => {
    const result = projectRetirement(BASE)!;
    const lastAccumulating = result.years.filter((row) => row.accumulating)[29];
    expect(lastAccumulating.age).toBe(64);
    expect(result.balanceAtRetirement).toBeCloseTo(lastAccumulating.balance, 6);
  });

  it("uses the opening balance when retirement is today", () => {
    const result = projectRetirement({ ...BASE, retirementAge: 35 })!;
    expect(result.balanceAtRetirement).toBe(100_000);
    expect(result.totalContributed).toBe(0);
    // Every year is a drawdown year.
    expect(result.years.every((row) => !row.accumulating)).toBe(true);
  });
});

describe("projectRetirement — validation", () => {
  it("rejects contradictory ages", () => {
    // Retiring before today, and a projection ending at or before
    // retirement, are contradictions rather than edge cases.
    expect(projectRetirement({ ...BASE, retirementAge: 30 })).toBe(null);
    expect(projectRetirement({ ...BASE, endAge: 65 })).toBe(null);
    expect(projectRetirement({ ...BASE, endAge: 60 })).toBe(null);
  });

  it("rejects non-integer and out-of-range ages", () => {
    expect(projectRetirement({ ...BASE, currentAge: 35.5 })).toBe(null);
    expect(projectRetirement({ ...BASE, retirementAge: 65.5 })).toBe(null);
    expect(projectRetirement({ ...BASE, currentAge: -1 })).toBe(null);
    expect(projectRetirement({ ...BASE, endAge: 121 })).toBe(null);
    // A span over a century is not a retirement plan.
    expect(
      projectRetirement({ ...BASE, currentAge: 0, endAge: 101 }),
    ).toBe(null);
  });

  it("rejects negative money and out-of-range rates", () => {
    expect(projectRetirement({ ...BASE, currentBalance: -1 })).toBe(null);
    expect(projectRetirement({ ...BASE, annualContribution: -1 })).toBe(null);
    expect(projectRetirement({ ...BASE, desiredAnnualSpending: -1 })).toBe(null);
    expect(projectRetirement({ ...BASE, otherAnnualIncome: -1 })).toBe(null);
    expect(projectRetirement({ ...BASE, returnBeforePercent: 101 })).toBe(null);
    expect(projectRetirement({ ...BASE, inflationPercent: -101 })).toBe(null);
    expect(
      projectRetirement({ ...BASE, contributionGrowthPercent: 101 }),
    ).toBe(null);
  });

  it("accepts the boundaries", () => {
    expect(projectRetirement({ ...BASE, retirementAge: 35 })).not.toBe(null);
    expect(projectRetirement({ ...BASE, endAge: 66 })).not.toBe(null);
    expect(projectRetirement({ ...BASE, annualContribution: 0 })).not.toBe(
      null,
    );
    expect(projectRetirement({ ...BASE, inflationPercent: 0 })).not.toBe(null);
  });
});

describe("solveRequiredContribution", () => {
  const TARGET = {
    currentAge: 35,
    retirementAge: 65,
    endAge: 95,
    currentBalance: 50_000,
    contributionGrowthPercent: 2,
    returnBeforePercent: 7,
    returnAfterPercent: 5,
    inflationPercent: 2.5,
    desiredAnnualSpending: 80_000,
    otherAnnualIncome: 25_000,
  };

  it("finds a contribution that funds the plan exactly", () => {
    const result = solveRequiredContribution(TARGET)!;
    expect(result.alreadyFunded).toBe(false);
    expect(result.annualContribution).toBeGreaterThan(0);
    expect(result.monthlyContribution).toBeCloseTo(
      result.annualContribution / 12,
      10,
    );
    // The projection it returns must itself be funded. This is the point of
    // bisecting the projection rather than a closed-form annuity: a page
    // cannot end up claiming "funded" while its own table runs dry.
    expect(result.projection.depletionAge).toBe(null);
  });

  it("lands close to the boundary, not merely above it", () => {
    const result = solveRequiredContribution(TARGET)!;
    // A fraction less must fail, which is what makes it the answer rather
    // than just an amount that happens to work.
    const slightlyLess = projectRetirement({
      ...TARGET,
      annualContribution: result.annualContribution * 0.99,
    })!;
    expect(slightlyLess.depletionAge).not.toBe(null);
  });

  it("returns zero when the existing balance already funds the plan", () => {
    const result = solveRequiredContribution({
      ...TARGET,
      currentBalance: 5_000_000,
    })!;
    expect(result.alreadyFunded).toBe(true);
    // Zero, not whatever tiny number bisection would have landed on.
    expect(result.annualContribution).toBe(0);
    expect(result.monthlyContribution).toBe(0);
    expect(result.projection.depletionAge).toBe(null);
  });

  it("returns null rather than guessing when the plan is unfundable", () => {
    // Spending far beyond what any contribution could support in the time
    // available. A finite figure here would be a fabrication.
    expect(
      solveRequiredContribution({
        ...TARGET,
        retirementAge: 36,
        desiredAnnualSpending: 1e12,
        otherAnnualIncome: 0,
      }),
    ).toBe(null);
  });

  it("needs more when retiring earlier", () => {
    const later = solveRequiredContribution(TARGET)!;
    const earlier = solveRequiredContribution({
      ...TARGET,
      retirementAge: 55,
    })!;
    // Fewer years to save AND more years to fund.
    expect(earlier.annualContribution).toBeGreaterThan(
      later.annualContribution,
    );
  });

  it("needs less with a bigger head start", () => {
    const small = solveRequiredContribution(TARGET)!;
    const large = solveRequiredContribution({
      ...TARGET,
      currentBalance: 300_000,
    })!;
    expect(large.annualContribution).toBeLessThan(small.annualContribution);
  });

  it("passes invalid inputs straight through as null", () => {
    expect(
      solveRequiredContribution({ ...TARGET, retirementAge: 30 }),
    ).toBe(null);
    expect(solveRequiredContribution({ ...TARGET, endAge: 65 })).toBe(null);
  });
});
