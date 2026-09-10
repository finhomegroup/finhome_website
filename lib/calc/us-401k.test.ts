import { describe, expect, it } from "vitest";
import { computeUs401k, type Us401kInput } from "@/lib/calc/us-401k";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";

const P = RETIREMENT_LIMITS[2026];

const BASE: Us401kInput = {
  year: 2026,
  age: 35,
  annualSalary: 90_000,
  priorYearWages: 90_000,
  deferralPercent: 3,
  employerMatchPercent: 100,
  employerMatchLimitPercent: 6,
  employerExtraPercent: 0,
  marginalRatePercent: 24,
  returnPercent: 7,
  years: 30,
};

const run = (over: Partial<Us401kInput> = {}) => {
  const result = computeUs401k({ ...BASE, ...over });
  if (!result) throw new Error("computeUs401k returned null");
  return result;
};

describe("computeUs401k — the unclaimed match", () => {
  it("names the match forfeited by deferring below the formula's limit", () => {
    // 3% of 90.000 is 2.700 deferred; the formula would match 100% of up to
    // 6%, i.e. 5.400. So 2.700 is matched and 2.700 is left behind.
    const r = run();
    expect(r.deferral).toBe(2_700);
    expect(r.employerMatch).toBe(2_700);
    expect(r.maxEmployerMatch).toBe(5_400);
    expect(r.unclaimedMatch).toBe(2_700);
  });

  it("leaves nothing behind once the deferral reaches the match limit", () => {
    const r = run({ deferralPercent: 6 });
    expect(r.employerMatch).toBe(5_400);
    expect(r.unclaimedMatch).toBe(0);
  });

  it("states the threshold as an amount as well as a percent", () => {
    // The page prints both, because "6%" is not actionable and "5.400 USD"
    // is. On capped pay the two disagree, which is the whole reason the
    // amount is derived from plan compensation rather than from salary.
    const r = run();
    expect(r.matchThresholdPercent).toBe(6);
    expect(r.matchThresholdAmount).toBe(5_400);
    const rich = run({ annualSalary: 500_000 });
    expect(rich.matchThresholdPercent).toBe(6);
    expect(rich.matchThresholdAmount).toBe(P.compensation * 0.06);
    expect(rich.matchThresholdAmount).toBeLessThan(500_000 * 0.06);
  });

  it("does not pay more match for deferring beyond the limit", () => {
    const at = run({ deferralPercent: 6 });
    const beyond = run({ deferralPercent: 15 });
    expect(beyond.deferral).toBe(13_500);
    expect(beyond.employerMatch).toBe(at.employerMatch);
    expect(beyond.unclaimedMatch).toBe(0);
    // And the marginal match on that extra 8.100 is zero, which is the point
    // of showing the threshold percent.
    expect(beyond.matchReturnPercent!).toBeLessThan(at.matchReturnPercent!);
  });

  it("reports the match as a return on the employee's own money", () => {
    expect(run().matchReturnPercent).toBe(100);
    expect(run({ employerMatchPercent: 50 }).matchReturnPercent).toBe(50);
    // Half the match rate on twice the deferral halves the return.
    expect(run({ deferralPercent: 12 }).matchReturnPercent).toBe(50);
    // No deferral means no rate, not a zero rate: nothing was invested.
    expect(run({ deferralPercent: 0 }).matchReturnPercent).toBe(null);
  });

  it("prices the forfeited match at the horizon, not just this year", () => {
    const r = run();
    // A level 2.700 a year, landing at the start of each year, compounded at
    // 7% for 30 years. Closed form for an annuity due, computed independently
    // of the module's loop.
    const expected = 2_700 * ((Math.pow(1.07, 30) - 1) / 0.07) * 1.07;
    expect(r.unclaimedMatchAtHorizon).toBeCloseTo(expected, 4);
    expect(r.unclaimedMatchAtHorizon).toBeGreaterThan(272_000);
    // Thirty years of doing nothing costs about a hundred times the annual
    // figure, which is the number a percentage cannot convey.
    expect(r.unclaimedMatchAtHorizon / 2_700).toBeGreaterThan(100);
  });

  it("values the match it DOES receive as the gap between two projections", () => {
    const r = run();
    expect(r.matchValueAtHorizon).toBeCloseTo(
      r.projectedBalance - r.projectedWithoutMatch,
      6,
    );
    // With a dollar-for-dollar match on the whole deferral, the match is
    // worth exactly as much as everything the employee put in.
    expect(r.matchValueAtHorizon).toBeCloseTo(r.projectedWithoutMatch, 4);
  });
});

describe("computeUs401k — the four ceilings", () => {
  it("caps the employee's deferral at 402(g) plus catch-up, and nothing else", () => {
    const r = run({ deferralPercent: 40, annualSalary: 200_000 });
    expect(r.electedDeferral).toBe(80_000);
    expect(r.deferral).toBe(P.electiveDeferral);
    expect(r.deferralCapped).toBe(true);
    // The match is NOT part of that limit, so it still lands on top.
    expect(r.employerMatch).toBe(12_000);
    expect(r.totalContribution).toBe(P.electiveDeferral + 12_000);
  });

  it("adds the age-50 catch-up to the deferral limit", () => {
    const young = run({ deferralPercent: 100, annualSalary: 200_000, age: 49 });
    const older = run({ deferralPercent: 100, annualSalary: 200_000, age: 50 });
    expect(young.deferral).toBe(P.electiveDeferral);
    expect(older.deferral).toBe(P.electiveDeferral + P.catchUp50);
    expect(older.catchUpUsed).toBe(P.catchUp50);
    expect(young.catchUpUsed).toBe(0);
  });

  it("uses the 60-63 window and then takes it away at 64", () => {
    const at61 = run({ deferralPercent: 100, annualSalary: 200_000, age: 61 });
    const at64 = run({ deferralPercent: 100, annualSalary: 200_000, age: 64 });
    expect(at61.catchUpTier).toBe("age60to63");
    expect(at61.deferral).toBe(P.electiveDeferral + P.catchUp60to63);
    expect(at64.catchUpTier).toBe("age50");
    expect(at64.deferral).toBe(P.electiveDeferral + P.catchUp50);
    expect(at64.deferral).toBeLessThan(at61.deferral);
  });

  it("counts only the non-catch-up part against 415(c)", () => {
    // Catch-up sits outside the annual-additions ceiling. Testing the total
    // against it instead would report a phantom excess for anyone over 50
    // contributing near the cap.
    const r = run({
      age: 61,
      annualSalary: 300_000,
      deferralPercent: 100,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 20,
      employerExtraPercent: 2,
    });
    expect(r.catchUpUsed).toBe(P.catchUp60to63);
    expect(r.additionsForLimit).toBeCloseTo(
      r.totalContribution - r.catchUpUsed,
      6,
    );
    expect(r.additionsForLimit).toBeLessThanOrEqual(P.annualAdditions);
    expect(r.excessAdditions).toBe(0);
    // The total is above the ceiling and that is entirely legal, because the
    // catch-up is on top of it.
    expect(r.totalContribution).toBeGreaterThan(P.annualAdditions);
  });

  it("reports a real 415(c) excess when the allocations genuinely exceed it", () => {
    const r = run({
      annualSalary: 300_000,
      deferralPercent: 20,
      employerExtraPercent: 25,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 10,
    });
    expect(r.additionsForLimit).toBeGreaterThan(P.annualAdditions);
    expect(r.excessAdditions).toBeCloseTo(
      r.additionsForLimit - P.annualAdditions,
      6,
    );
  });

  it("makes pay above the 401(a)(17) ceiling invisible to the plan", () => {
    const r = run({ annualSalary: 500_000, deferralPercent: 6 });
    expect(r.planCompensation).toBe(P.compensation);
    expect(r.compensationCapped).toBe(true);
    // 6% of the CEILING, not 6% of the salary: 21.600, not 30.000.
    expect(r.deferral).toBe(P.compensation * 0.06);
    expect(r.employerMatch).toBe(P.compensation * 0.06);
    expect(r.maxEmployerMatch).toBe(P.compensation * 0.06);
  });

  it("stops the match growing once pay passes the ceiling", () => {
    const at = run({ annualSalary: P.compensation, deferralPercent: 6 });
    const above = run({ annualSalary: P.compensation + 100_000, deferralPercent: 6 });
    expect(above.maxEmployerMatch).toBe(at.maxEmployerMatch);
    expect(above.compensationCapped).toBe(true);
    expect(at.compensationCapped).toBe(false);
  });
});

describe("computeUs401k — the tax saving", () => {
  it("deducts the whole deferral in the ordinary case", () => {
    const r = run();
    expect(r.catchUpForcedRoth).toBe(false);
    expect(r.deductibleDeferral).toBe(r.deferral);
    expect(r.incomeTaxSaved).toBeCloseTo(2_700 * 0.24, 6);
    expect(r.netCostOfDeferral).toBeCloseTo(2_700 * 0.76, 6);
  });

  it("removes the catch-up from the deduction once the Roth rule bites", () => {
    // SECURE 2.0: prior-year wages above the threshold force catch-up into
    // Roth. Deducting the whole deferral would overstate the saving for
    // exactly the readers who use catch-up.
    const r = run({
      age: 55,
      annualSalary: 200_000,
      priorYearWages: 200_000,
      deferralPercent: 100,
    });
    expect(r.catchUpUsed).toBe(P.catchUp50);
    expect(r.catchUpForcedRoth).toBe(true);
    expect(r.deductibleDeferral).toBe(P.electiveDeferral);
    expect(r.incomeTaxSaved).toBeCloseTo(P.electiveDeferral * 0.24, 6);
    // The money still goes in; only the deduction is gone.
    expect(r.deferral).toBe(P.electiveDeferral + P.catchUp50);
  });

  it("leaves the deduction whole below the wage threshold and in 2025", () => {
    const below = run({
      age: 55,
      annualSalary: 200_000,
      priorYearWages: 120_000,
      deferralPercent: 100,
    });
    expect(below.catchUpForcedRoth).toBe(false);
    expect(below.deductibleDeferral).toBe(below.deferral);

    // 2025 is inside the administrative relief window: no threshold at all.
    const earlier = run({
      year: 2025,
      age: 55,
      annualSalary: 400_000,
      priorYearWages: 400_000,
      deferralPercent: 100,
    });
    expect(earlier.catchUpForcedRoth).toBe(false);
    expect(earlier.deductibleDeferral).toBe(earlier.deferral);
  });

  it("never claims the rule bites when no catch-up was used", () => {
    // A high earner under 50 has no catch-up to force anywhere.
    const r = run({ age: 40, annualSalary: 400_000, deferralPercent: 100 });
    expect(r.catchUpUsed).toBe(0);
    expect(r.catchUpForcedRoth).toBe(false);
    expect(r.deductibleDeferral).toBe(r.deferral);
  });
});

describe("computeUs401k — the projection", () => {
  it("lands the whole year's contribution at the start of the year", () => {
    const r = run({ years: 1 });
    expect(r.projectedBalance).toBeCloseTo(r.totalContribution * 1.07, 6);
    expect(r.totalContributed).toBeCloseTo(r.totalContribution, 6);
  });

  it("compounds a level contribution as an annuity due", () => {
    const r = run();
    const expected =
      r.totalContribution * ((Math.pow(1.07, 30) - 1) / 0.07) * 1.07;
    expect(r.projectedBalance).toBeCloseTo(expected, 4);
  });

  it("returns the contributions themselves at a zero return", () => {
    const r = run({ returnPercent: 0 });
    expect(r.projectedBalance).toBeCloseTo(r.totalContribution * 30, 6);
    expect(r.unclaimedMatchAtHorizon).toBeCloseTo(r.unclaimedMatch * 30, 6);
  });

  it("projects nothing over a zero-year horizon", () => {
    const r = run({ years: 0 });
    expect(r.projectedBalance).toBe(0);
    expect(r.projectedWithoutMatch).toBe(0);
    expect(r.matchValueAtHorizon).toBe(0);
    expect(r.unclaimedMatchAtHorizon).toBe(0);
    // But the year's own figures are still real.
    expect(r.employerMatch).toBe(2_700);
  });
});

describe("computeUs401k — rejections and edges", () => {
  it("refuses a year the limits table does not cover", () => {
    // Borrowing another year's ceiling would produce a plausible wrong cap.
    expect(computeUs401k({ ...BASE, year: 2019 })).toBe(null);
    expect(computeUs401k({ ...BASE, year: 2030 })).toBe(null);
  });

  it("rejects impossible inputs", () => {
    expect(computeUs401k({ ...BASE, annualSalary: -1 })).toBe(null);
    expect(computeUs401k({ ...BASE, priorYearWages: -1 })).toBe(null);
    expect(computeUs401k({ ...BASE, age: 121 })).toBe(null);
    expect(computeUs401k({ ...BASE, deferralPercent: 101 })).toBe(null);
    expect(computeUs401k({ ...BASE, deferralPercent: -1 })).toBe(null);
    expect(computeUs401k({ ...BASE, employerMatchPercent: 201 })).toBe(null);
    expect(computeUs401k({ ...BASE, employerMatchLimitPercent: 101 })).toBe(null);
    expect(computeUs401k({ ...BASE, marginalRatePercent: 101 })).toBe(null);
    expect(computeUs401k({ ...BASE, returnPercent: -101 })).toBe(null);
    expect(computeUs401k({ ...BASE, years: 71 })).toBe(null);
    expect(computeUs401k({ ...BASE, years: 2.5 })).toBe(null);
  });

  it("allows a match above 100%, because some plans really pay one", () => {
    const r = run({ employerMatchPercent: 150, employerMatchLimitPercent: 4 });
    expect(r.employerMatch).toBe(2_700 * 1.5);
    expect(r.matchReturnPercent).toBe(150);
  });

  it("handles a zero salary without dividing by it", () => {
    const r = run({ annualSalary: 0 });
    expect(r.deferral).toBe(0);
    expect(r.employerMatch).toBe(0);
    expect(r.unclaimedMatch).toBe(0);
    expect(r.effectiveDeferralPercent).toBe(null);
    expect(r.matchReturnPercent).toBe(null);
  });

  it("reports the effective deferral percent after the cap, not the election", () => {
    const r = run({ deferralPercent: 40, annualSalary: 200_000 });
    expect(r.effectiveDeferralPercent).toBeCloseTo(
      (P.electiveDeferral / 200_000) * 100,
      6,
    );
    expect(r.effectiveDeferralPercent!).toBeLessThan(40);
  });

  it("adds the non-elective contribution without matching it", () => {
    const r = run({ employerExtraPercent: 3 });
    expect(r.employerExtra).toBe(2_700);
    expect(r.employerMatch).toBe(2_700);
    expect(r.totalContribution).toBe(2_700 * 3);
    // A non-elective contribution is not a deferral, so it does not touch
    // 402(g) or the match formula.
    expect(r.deferral).toBe(2_700);
  });

  it("adds up: every contribution is deferral, match or non-elective", () => {
    for (const over of [
      {},
      { deferralPercent: 6 },
      { deferralPercent: 100, annualSalary: 200_000, age: 61 },
      { annualSalary: 500_000, employerExtraPercent: 5 },
      { annualSalary: 0 },
    ]) {
      const r = run(over);
      expect(r.totalContribution).toBeCloseTo(
        r.deferral + r.employerMatch + r.employerExtra,
        6,
      );
      expect(r.employerMatch + r.unclaimedMatch).toBeCloseTo(
        r.maxEmployerMatch,
        6,
      );
    }
  });
});
