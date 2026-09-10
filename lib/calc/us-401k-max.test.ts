import { describe, expect, it } from "vitest";
import { computeUs401kMax, type Us401kMaxInput } from "@/lib/calc/us-401k-max";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";

const P = RETIREMENT_LIMITS[2026];

const BASE: Us401kMaxInput = {
  year: 2026,
  age: 40,
  annualSalary: 130_000,
  payPeriodsPerYear: 26,
  periodsElapsed: 0,
  contributedSoFar: 0,
  employerMatchPercent: 100,
  employerMatchLimitPercent: 6,
  frontLoadPercent: 50,
};

const run = (over: Partial<Us401kMaxInput> = {}) => {
  const result = computeUs401kMax({ ...BASE, ...over });
  if (!result) throw new Error("computeUs401kMax returned null");
  return result;
};

describe("computeUs401kMax — the per-paycheck answer", () => {
  it("divides the room left by the periods left", () => {
    const r = run();
    expect(r.limit).toBe(P.electiveDeferral);
    expect(r.remainingRoom).toBe(P.electiveDeferral);
    expect(r.periodsRemaining).toBe(26);
    expect(r.perPeriodAmount).toBeCloseTo(P.electiveDeferral / 26, 10);
    expect(r.payPerPeriod).toBeCloseTo(130_000 / 26, 10);
    expect(r.perPeriodPercent).toBeCloseTo(
      (P.electiveDeferral / 130_000) * 100,
      10,
    );
  });

  it("raises the per-paycheck figure once the year is part gone", () => {
    // Half the year gone with nothing in: the same limit over half the
    // paychecks. This is the arithmetic readers get wrong by re-using the
    // percent they would have needed in January.
    const r = run({ periodsElapsed: 13 });
    expect(r.periodsRemaining).toBe(13);
    expect(r.perPeriodAmount).toBeCloseTo(P.electiveDeferral / 13, 10);
    expect(r.perPeriodPercent!).toBeCloseTo(
      (P.electiveDeferral / 13 / (130_000 / 26)) * 100,
      10,
    );
    expect(r.perPeriodPercent!).toBeGreaterThan(37);
  });

  it("counts what is already in", () => {
    const r = run({ periodsElapsed: 13, contributedSoFar: 10_000 });
    expect(r.remainingRoom).toBe(P.electiveDeferral - 10_000);
    expect(r.perPeriodAmount).toBeCloseTo((P.electiveDeferral - 10_000) / 13, 10);
  });

  it("adds the catch-up to the limit at 50, and the higher one at 61", () => {
    expect(run({ age: 49 }).limit).toBe(P.electiveDeferral);
    expect(run({ age: 50 }).limit).toBe(P.electiveDeferral + P.catchUp50);
    expect(run({ age: 61 }).limit).toBe(P.electiveDeferral + P.catchUp60to63);
    expect(run({ age: 64 }).limit).toBe(P.electiveDeferral + P.catchUp50);
  });

  it("says the limit is out of reach rather than printing an impossible percent", () => {
    // One paycheck left and the whole limit to go. The percent is over 100
    // and the flag says so; `maxStillPossible` is the honest answer.
    const r = run({ periodsElapsed: 25 });
    expect(r.periodsRemaining).toBe(1);
    expect(r.exceedsPay).toBe(true);
    expect(r.perPeriodPercent!).toBeGreaterThan(100);
    expect(r.maxStillPossible).toBeCloseTo(130_000 / 26, 10);
    expect(r.maxStillPossible).toBeLessThan(r.remainingRoom);
  });

  it("reports no per-paycheck figure at all once the year is over", () => {
    const r = run({ periodsElapsed: 26 });
    expect(r.periodsRemaining).toBe(0);
    // Null, not Infinity and not zero: there is no paycheck to divide into.
    expect(r.perPeriodAmount).toBe(null);
    expect(r.perPeriodPercent).toBe(null);
    expect(r.exceedsPay).toBe(false);
    expect(r.maxStillPossible).toBe(0);
  });

  it("reports the limit as reached, and any excess over it", () => {
    const at = run({ contributedSoFar: P.electiveDeferral, periodsElapsed: 20 });
    expect(at.alreadyAtLimit).toBe(true);
    expect(at.remainingRoom).toBe(0);
    expect(at.perPeriodAmount).toBe(0);
    expect(at.overLimit).toBe(0);

    const over = run({
      contributedSoFar: P.electiveDeferral + 1_500,
      periodsElapsed: 20,
    });
    expect(over.overLimit).toBe(1_500);
    expect(over.remainingRoom).toBe(0);
  });

  it("uses capped compensation for the paycheck, not the salary", () => {
    const r = run({ annualSalary: 500_000 });
    expect(r.planCompensation).toBe(P.compensation);
    expect(r.payPerPeriod).toBeCloseTo(P.compensation / 26, 10);
    expect(r.matchThresholdPerPeriod).toBeCloseTo(
      (P.compensation / 26) * 0.06,
      10,
    );
  });
});

describe("computeUs401kMax — front-loading and the match", () => {
  it("earns the whole match on a level schedule under either plan", () => {
    // A level deferral to the limit on a 130.000 salary is about 18% of pay,
    // well above the 6% match threshold in every period, so a per-period
    // plan and a true-up plan agree exactly.
    const r = run();
    expect(r.planned.underThresholdPeriods).toBe(0);
    expect(r.planned.emptyPeriods).toBe(0);
    expect(r.planned.matchPerPeriodPlan).toBeCloseTo(
      r.matchThresholdAnnual,
      6,
    );
    expect(r.planned.matchLostWithoutTrueUp).toBeCloseTo(0, 6);
  });

  it("forfeits the match on every paycheck after front-loading hits the cap", () => {
    const r = run();
    // At 50% of pay, 24.500 is reached part way through the year and the
    // rest of the paychecks defer nothing.
    expect(r.frontLoaded.emptyPeriods).toBeGreaterThan(0);
    expect(r.frontLoaded.totalDeferral).toBeCloseTo(P.electiveDeferral, 6);
    // Same total deferral, same true-up match, LESS per-period match.
    expect(r.frontLoaded.totalDeferral).toBeCloseTo(r.planned.totalDeferral, 6);
    expect(r.frontLoaded.matchTrueUpPlan).toBeCloseTo(
      r.planned.matchTrueUpPlan,
      6,
    );
    expect(r.frontLoaded.matchPerPeriodPlan).toBeLessThan(
      r.planned.matchPerPeriodPlan,
    );
    expect(r.frontLoadCost).toBeGreaterThan(0);
    expect(r.frontLoaded.matchLostWithoutTrueUp).toBeCloseTo(r.frontLoadCost, 6);
  });

  it("prices the loss as the match on the empty paychecks", () => {
    // The mechanism, checked directly rather than through the totals: each
    // empty paycheck gives up exactly one period's worth of full match.
    const r = run();
    const fullPeriodMatch = r.matchThresholdPerPeriod;
    expect(r.frontLoadCost).toBeCloseTo(
      r.frontLoaded.emptyPeriods * fullPeriodMatch,
      6,
    );
  });

  it("costs nothing to front-load when the plan trues up", () => {
    const r = run();
    expect(r.frontLoaded.matchTrueUpPlan).toBeCloseTo(r.matchThresholdAnnual, 6);
    // Which is the whole point of reporting both: the same schedule is free
    // under one plan document and expensive under another.
    expect(r.frontLoaded.matchTrueUpPlan).toBeGreaterThan(
      r.frontLoaded.matchPerPeriodPlan,
    );
  });

  it("front-loads harder for a bigger loss", () => {
    const gentle = run({ frontLoadPercent: 25 });
    const hard = run({ frontLoadPercent: 100 });
    expect(hard.frontLoaded.emptyPeriods).toBeGreaterThan(
      gentle.frontLoaded.emptyPeriods,
    );
    expect(hard.frontLoadCost).toBeGreaterThan(gentle.frontLoadCost);
  });

  it("loses nothing when the front-load rate is below the match threshold", () => {
    // Deferring 6% all year reaches neither the cap nor an empty paycheck,
    // so there is nothing to forfeit — and also no cap reached, which the
    // total shows.
    const r = run({ frontLoadPercent: 6 });
    expect(r.frontLoaded.emptyPeriods).toBe(0);
    expect(r.frontLoaded.totalDeferral).toBeCloseTo(130_000 * 0.06, 6);
    expect(r.frontLoaded.totalDeferral).toBeLessThan(P.electiveDeferral);
    expect(r.frontLoaded.matchLostWithoutTrueUp).toBeCloseTo(0, 6);
  });

  it("counts a below-threshold paycheck as a partial loss, not a full one", () => {
    // A low earner spreading a small deferral thinly: every period is under
    // the 6% threshold, so a per-period plan pays less than a true-up plan
    // even with no empty paycheck anywhere.
    const r = run({
      annualSalary: 130_000,
      periodsElapsed: 26,
      contributedSoFar: 2_600,
      frontLoadPercent: 2,
    });
    expect(r.planned.emptyPeriods).toBe(0);
    expect(r.planned.underThresholdPeriods).toBe(26);
    expect(r.planned.matchPerPeriodPlan).toBeCloseTo(2_600, 6);
    expect(r.planned.matchTrueUpPlan).toBeCloseTo(2_600, 6);
    // Level and under the threshold: the two plans agree, because a true-up
    // cannot pay match on deferrals that were never made.
    expect(r.planned.matchLostWithoutTrueUp).toBeCloseTo(0, 6);
  });

  it("shows the gap that a LUMPY schedule opens even with no empty period", () => {
    // Half the limit in the first 13 periods and a trickle after: no empty
    // paycheck, but the early periods overshoot the per-period threshold and
    // the late ones fall below it. Only a true-up recovers the difference.
    const r = run({ periodsElapsed: 13, contributedSoFar: 23_000 });
    expect(r.planned.emptyPeriods).toBe(0);
    expect(r.planned.underThresholdPeriods).toBeGreaterThan(0);
    expect(r.planned.matchLostWithoutTrueUp).toBeGreaterThan(0);
  });

  it("keeps every schedule's total at or below the limit", () => {
    for (const over of [
      {},
      { frontLoadPercent: 100 },
      { age: 61 },
      { periodsElapsed: 13, contributedSoFar: 10_000 },
      { annualSalary: 40_000 },
      { payPeriodsPerYear: 12 },
      { payPeriodsPerYear: 52 },
    ]) {
      const r = run(over);
      expect(r.frontLoaded.totalDeferral).toBeLessThanOrEqual(r.limit + 1e-9);
      expect(r.planned.totalDeferral).toBeLessThanOrEqual(r.limit + 1e-9);
      // And no schedule can defer more than a paycheck in any period.
      for (const amount of [...r.planned.deferrals, ...r.frontLoaded.deferrals]) {
        expect(amount).toBeLessThanOrEqual(r.payPerPeriod + 1e-9);
        expect(amount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("gives every schedule exactly one entry per pay period", () => {
    for (const payPeriodsPerYear of [12, 24, 26, 52]) {
      const r = run({ payPeriodsPerYear });
      expect(r.planned.deferrals).toHaveLength(payPeriodsPerYear);
      expect(r.frontLoaded.deferrals).toHaveLength(payPeriodsPerYear);
    }
  });
});

describe("computeUs401kMax — rejections and edges", () => {
  it("refuses a year the limits table does not cover", () => {
    expect(computeUs401kMax({ ...BASE, year: 2019 })).toBe(null);
  });

  it("rejects impossible inputs", () => {
    expect(computeUs401kMax({ ...BASE, annualSalary: -1 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, contributedSoFar: -1 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, age: 121 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, payPeriodsPerYear: 0 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, payPeriodsPerYear: 367 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, payPeriodsPerYear: 26.5 })).toBe(null);
    // More periods elapsed than the year has is a contradiction, not a
    // finished year.
    expect(computeUs401kMax({ ...BASE, periodsElapsed: 27 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, periodsElapsed: -1 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, periodsElapsed: 1.5 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, employerMatchLimitPercent: 101 })).toBe(
      null,
    );
    expect(computeUs401kMax({ ...BASE, employerMatchPercent: 201 })).toBe(null);
    expect(computeUs401kMax({ ...BASE, frontLoadPercent: 101 })).toBe(null);
  });

  it("handles a zero salary without dividing by it", () => {
    const r = run({ annualSalary: 0 });
    expect(r.payPerPeriod).toBe(0);
    expect(r.perPeriodPercent).toBe(null);
    expect(r.matchThresholdPerPeriod).toBe(0);
    expect(r.planned.matchPerPeriodPlan).toBe(0);
    expect(r.frontLoaded.totalDeferral).toBe(0);
  });

  it("handles no match at all", () => {
    const r = run({ employerMatchPercent: 0 });
    expect(r.planned.matchPerPeriodPlan).toBe(0);
    expect(r.frontLoadCost).toBe(0);
    // With no match there is no reason not to front-load, and the module
    // says so by pricing it at zero rather than by an opinion.
    expect(r.frontLoaded.matchLostWithoutTrueUp).toBe(0);
  });

  it("treats the first period of the year as nothing elapsed", () => {
    const r = run({ periodsElapsed: 0, contributedSoFar: 0 });
    expect(r.planned.deferrals).toHaveLength(26);
    expect(r.planned.deferrals.every((amount) => amount > 0)).toBe(true);
  });
});
