import { describe, expect, it } from "vitest";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import type { RetirementInput } from "@/lib/calc/retirement";
import { retirementStatus } from "@/lib/calc/retirement-status";

/** The shared long-term scenario the four routes open on, in numbers. */
const SHIPPED: RetirementInput = {
  currentAge: 35,
  retirementAge: 60,
  endAge: 85,
  currentBalance: 300_000_000,
  annualContribution: 60_000_000,
  contributionGrowthPercent: 3,
  returnBeforePercent: 7,
  returnAfterPercent: 5,
  inflationPercent: 4,
  desiredAnnualSpending: 240_000_000,
  otherAnnualIncome: 0,
};

/** The render test's constructed boundary: funded by a forgiven residue. */
const BOUNDARY: RetirementInput = {
  currentAge: 60,
  retirementAge: 60,
  endAge: 85,
  currentBalance: 4_000_000_000,
  annualContribution: 0,
  contributionGrowthPercent: 0,
  returnBeforePercent: 4,
  returnAfterPercent: 4,
  inflationPercent: 4,
  desiredAnnualSpending: 196_000_000,
  otherAnnualIncome: 36_000_000,
};

describe("retirementStatus", () => {
  it("is UNKNOWN with no plan, never a stale verdict", () => {
    const status = retirementStatus(null);
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("unknown");
  });

  it("is a SHORTFALL on a depleting plan, with the engine's own ages", () => {
    const plan = resolveLongTermPlan({ ...SHIPPED, desiredAnnualSpending: 400_000_000 });
    expect(plan).not.toBeNull();
    const status = retirementStatus(plan);
    expect(status.tone).toBe("shortfall");
    expect(status.kind).toBe("depleted");
    expect(status.depletionAge).toBe(plan!.asEntered.depletionAge);
    expect(status.yearsShort).toBe(plan!.asEntered.yearsShort);
    expect(status.endAge).toBe(85);
  });

  it("is MET on a comfortably funded plan", () => {
    const plan = resolveLongTermPlan({ ...SHIPPED, desiredAnnualSpending: 50_000_000 });
    const status = retirementStatus(plan);
    expect(status.tone).toBe("met");
    expect(status.kind).toBe("funded");
    expect(status.depletionAge).toBeNull();
  });

  it("names a plan funded by OTHER income as such, not as a funded portfolio", () => {
    const plan = resolveLongTermPlan({
      ...SHIPPED,
      desiredAnnualSpending: 100_000_000,
      otherAnnualIncome: 150_000_000,
    });
    const status = retirementStatus(plan);
    expect(status.tone).toBe("met");
    expect(status.kind).toBe("fundedByOtherIncome");
  });

  it("is CAUTION at the funded boundary the engine forgives, never SHORTFALL", () => {
    // `depletionAge` reads 84 here; `fundedAtBoundary` forgives a residue of
    // millionths of a đồng. Funded — but by exactly nothing to spare.
    const plan = resolveLongTermPlan(BOUNDARY);
    expect(plan!.asEntered.depletionAge).toBe(84);
    const status = retirementStatus(plan);
    expect(status.tone).toBe("caution");
    expect(status.kind).toBe("exactBoundary");
    expect(status.residue).not.toBeNull();
    expect(status.depletionAge).toBeNull();
  });
});
