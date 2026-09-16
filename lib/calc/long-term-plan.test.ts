// The shared long-term plan behind original rows 44, 45, 48 and 50.
//
// What these tests are for: the four views must be ANSWERS from one engine on
// one set of assumptions, not four pages sharing a module. So the assertions
// are mostly AGREEMENTS between views, plus the boundary states the plan's own
// requirements name — a rate at −100%, retirement today, a spend other income
// already covers, and the partial payment in the year the money runs out.
import { describe, expect, it } from "vitest";
import {
  LONGEVITY_STRESS_YEARS,
  MAX_EXTRA_WORKING_YEARS,
  remedyFor,
  resolveLongTermPlan,
} from "@/lib/calc/long-term-plan";
import { projectRetirement, type RetirementInput } from "@/lib/calc/retirement";

/**
 * A household 30 years from retiring, currency-agnostic: the engine takes
 * plain amounts and this module never formats, so the figures below are just
 * numbers. Deliberately UNDER-funded, because the gap view is the one with
 * three answers to check.
 */
const BASE: RetirementInput = {
  currentAge: 35,
  retirementAge: 60,
  endAge: 85,
  currentBalance: 500_000_000,
  annualContribution: 60_000_000,
  contributionGrowthPercent: 5,
  returnBeforePercent: 8,
  returnAfterPercent: 5,
  inflationPercent: 4,
  desiredAnnualSpending: 240_000_000,
  otherAnnualIncome: 36_000_000,
};

const plan = (patch: Partial<RetirementInput> = {}) => {
  const resolved = resolveLongTermPlan({ ...BASE, ...patch });
  expect(resolved).not.toBeNull();
  return resolved!;
};

describe("one plan, four views", () => {
  const p = plan();

  it("projects the inputs as entered, once, for every view to read", () => {
    const direct = projectRetirement(BASE)!;
    expect(p.asEntered).toEqual(direct);
  });

  it("makes the gap view quote the contribution view's own figure", () => {
    // The merge this module exists for: two routes cannot answer "how much
    // more" with two numbers.
    const contribute = remedyFor(p.gap, "contribute");
    if (contribute.key !== "contribute") throw new Error("wrong remedy");
    expect(contribute.annualContribution).toBe(
      p.contribution.annualContribution,
    );
    expect(contribute.monthlyEquivalent).toBe(p.contribution.monthlyEquivalent);
  });

  it("makes the withdrawal view quote the engine's own sustainable spend", () => {
    expect(p.withdrawal.sustainableSpending).toBe(
      p.asEntered.sustainableSpending,
    );
    const spendLess = remedyFor(p.gap, "spendLess");
    if (spendLess.key !== "spendLess") throw new Error("wrong remedy");
    // The gap's third remedy and the withdrawal view's sustainable path are
    // the SAME answer to the same question.
    expect(spendLess.annualSpending).toBe(p.withdrawal.sustainableSpending);
  });

  it("reports the capital gap in today's money, from the engine", () => {
    expect(p.gap.realBalanceReached).toBe(p.asEntered.realBalanceAtRetirement);
    expect(p.gap.realBalanceRequired).toBe(
      p.asEntered.requiredRealBalanceAtRetirement,
    );
    expect(p.gap.realShortfall).toBe(
      p.asEntered.realBalanceShortfallAtRetirement,
    );
    expect(p.gap.coveragePercent).toBe(p.asEntered.capitalCoveragePercent);
  });
});

describe("the contribution view", () => {
  it("solves a contribution whose own projection is funded", () => {
    const p = plan();
    expect(p.contribution.state).toBe("solved");
    expect(p.contribution.annualContribution!).toBeGreaterThan(0);
    // The contract `solveRequiredContribution` settles for: the projection
    // handed back never depletes.
    expect(p.contribution.projection!.depletionAge).toBeNull();
  });

  it("states the monthly figure as an EQUIVALENCE, not a monthly plan", () => {
    const p = plan();
    const annual = p.contribution.annualContribution!;
    expect(p.contribution.monthlyEquivalent).toBeCloseTo(annual / 12, 9);
    expect(p.contribution.monthlyEquivalent! * 12).toBeCloseTo(annual, 6);
  });

  it("knows WHICH WAY the monthly gap runs", () => {
    // An earlier version of this module's own header had it backwards. The
    // engine credits a yearly contribution with a full year, which is a
    // January deposit; twelve month-end deposits of a twelfth each arrive
    // late and end up BEHIND. Executed here so the copy cannot drift from
    // the arithmetic: 12 triệu in January at 12% effective, against 1 triệu
    // at the end of each month.
    const january = 12_000_000 * 1.12;
    const monthlyRate = 1.12 ** (1 / 12) - 1;
    const monthly =
      1_000_000 * (((1 + monthlyRate) ** 12 - 1) / monthlyRate);
    expect(january).toBeCloseTo(13_440_000, 6);
    expect(monthly).toBeCloseTo(12_646_498.0, 0);
    expect(monthly).toBeLessThan(january);
  });

  it("says how much MORE than the plan already contributes", () => {
    const p = plan();
    expect(p.contribution.extraPerYear).toBeCloseTo(
      p.contribution.annualContribution! - BASE.annualContribution,
      6,
    );
  });

  it("answers 0 when the balance already funds the plan", () => {
    const p = plan({ currentBalance: 20_000_000_000 });
    expect(p.contribution.state).toBe("alreadyFunded");
    expect(p.contribution.annualContribution).toBe(0);
    expect(p.gap.funded).toBe(true);
  });

  it("names the OTHER-INCOME case rather than crediting the savings", () => {
    // The pension covers the whole spend, so the portfolio is never touched.
    // "Already funded" would tell the reader their savings did it.
    const p = plan({ otherAnnualIncome: 240_000_000 });
    expect(p.asEntered.fundedByOtherIncome).toBe(true);
    expect(p.contribution.state).toBe("fundedByOtherIncome");
    expect(p.contribution.annualContribution).toBe(0);
    expect(p.asEntered.totalWithdrawn).toBe(0);
    // And it is NOT reported for a plan that does draw on the portfolio.
    expect(plan().asEntered.fundedByOtherIncome).toBe(false);
  });

  it("distinguishes no time to contribute from out of reach", () => {
    // Retiring today: there is no year left to pay into.
    const now = plan({ currentAge: 60, currentBalance: 100_000_000 });
    expect(now.contribution.state).toBe("noTimeToContribute");
    expect(now.contribution.annualContribution).toBeNull();
    expect(now.contribution.monthlyEquivalent).toBeNull();
    // The gap is still reportable — that is the answer in this state.
    expect(now.gap.funded).toBe(false);
    expect(now.gap.realShortfall).toBeGreaterThan(0);

    // Retiring today with enough money is `alreadyFunded`, not "no time".
    const funded = plan({
      currentAge: 60,
      currentBalance: 20_000_000_000,
    });
    expect(funded.contribution.state).toBe("alreadyFunded");
    expect(funded.contribution.annualContribution).toBe(0);
  });
});

describe("the gap view's three remedies", () => {
  const p = plan();

  it("offers exactly three, in a fixed order", () => {
    expect(p.gap.remedies.map((r) => r.key)).toEqual([
      "contribute",
      "retireLater",
      "spendLess",
    ]);
  });

  it("finds a retirement age whose OWN projection is funded", () => {
    const remedy = remedyFor(p.gap, "retireLater");
    if (remedy.key !== "retireLater") throw new Error("wrong remedy");
    expect(remedy.available).toBe(true);
    expect(remedy.retirementAge!).toBeGreaterThan(BASE.retirementAge);
    expect(remedy.extraYears).toBe(remedy.retirementAge! - BASE.retirementAge);
    // The promise: that age really does fund it on the same contribution.
    const later = projectRetirement({
      ...BASE,
      retirementAge: remedy.retirementAge!,
    })!;
    expect(later.depletionAge).toBeNull();
    // And it is the FIRST such age — the year before it still depletes.
    const before = projectRetirement({
      ...BASE,
      retirementAge: remedy.retirementAge! - 1,
    })!;
    expect(before.depletionAge).not.toBeNull();
  });

  it("marks working-longer unavailable rather than offering a decade", () => {
    // A plan far out of reach: no age within the bound funds it.
    const hopeless = plan({
      currentBalance: 0,
      annualContribution: 1_000_000,
      desiredAnnualSpending: 2_000_000_000,
    });
    const remedy = remedyFor(hopeless.gap, "retireLater");
    if (remedy.key !== "retireLater") throw new Error("wrong remedy");
    expect(remedy.available).toBe(false);
    expect(remedy.retirementAge).toBeNull();
    expect(MAX_EXTRA_WORKING_YEARS).toBe(7);
  });

  it("prices spending less against what was actually asked for", () => {
    const remedy = remedyFor(p.gap, "spendLess");
    if (remedy.key !== "spendLess") throw new Error("wrong remedy");
    expect(remedy.available).toBe(true);
    expect(remedy.annualSpending!).toBeLessThan(BASE.desiredAnnualSpending);
    expect(remedy.reductionPerYear).toBeCloseTo(
      BASE.desiredAnnualSpending - remedy.annualSpending!,
      6,
    );
    expect(remedy.percentOfDesired!).toBeGreaterThan(0);
    expect(remedy.percentOfDesired!).toBeLessThan(100);
  });

  it("reports a funded plan as funded, with no shortfall", () => {
    const p2 = plan({ currentBalance: 20_000_000_000 });
    expect(p2.gap.funded).toBe(true);
    expect(p2.gap.realShortfall).toBe(0);
    const later = remedyFor(p2.gap, "retireLater");
    if (later.key !== "retireLater") throw new Error("wrong remedy");
    // Nothing to fix: the entered age already works.
    expect(later.retirementAge).toBe(BASE.retirementAge);
    expect(later.extraYears).toBe(0);
  });
});

describe("the withdrawal view's alternative paths", () => {
  const p = plan();

  it("draws the plan as entered, the sustainable spend and a longer life", () => {
    expect(p.withdrawal.paths.map((path) => path.key)).toEqual([
      "asEntered",
      "sustainable",
      "longerLife",
    ]);
    // At most three: `MAX_VALUE_PATHS` is the ceiling on distinguishable
    // lines, and colour is never the only channel in this suite.
    expect(p.withdrawal.paths.length).toBeLessThanOrEqual(3);
  });

  it("makes the sustainable path actually last, and the entered one not", () => {
    const entered = p.withdrawal.paths[0];
    const sustainable = p.withdrawal.paths[1];
    expect(entered.funded).toBe(false);
    expect(entered.projection.depletionAge).not.toBeNull();
    expect(sustainable.funded).toBe(true);
    expect(sustainable.annualSpending).toBeLessThan(entered.annualSpending);
    // Both on the SAME capital: that is what makes them comparable.
    expect(sustainable.projection.balanceAtRetirement).toBeCloseTo(
      entered.projection.balanceAtRetirement,
      6,
    );
  });

  it("runs the longevity path at the ENTERED spend, to a later horizon", () => {
    const longer = p.withdrawal.paths[2];
    expect(longer.annualSpending).toBe(BASE.desiredAnnualSpending);
    expect(longer.endAge).toBe(BASE.endAge + LONGEVITY_STRESS_YEARS);
    // Same accumulation, so the same capital at retirement — only the
    // horizon changed.
    expect(longer.projection.balanceAtRetirement).toBeCloseTo(
      p.asEntered.balanceAtRetirement,
      6,
    );
    // And it depletes no later than the entered path does.
    expect(longer.projection.depletionAge!).toBeLessThanOrEqual(
      p.asEntered.depletionAge!,
    );
  });

  it("omits the longevity path rather than faking a refused horizon", () => {
    // endAge 118 + 5 is past the engine's age ceiling of 120.
    const old = plan({ currentAge: 35, retirementAge: 60, endAge: 118 });
    expect(old.withdrawal.paths.map((path) => path.key)).not.toContain(
      "longerLife",
    );
    expect(old.withdrawal.paths[0].key).toBe("asEntered");
  });

  it("reports the spending shortfall the engine computed", () => {
    expect(p.withdrawal.spendingShortfall).toBe(p.asEntered.spendingShortfall);
    expect(p.withdrawal.spendingShortfall).toBeGreaterThan(0);
  });
});

// A sustainable spend is solved from a closed-form annuity factor, so feeding
// it back through the year-by-year projection can land a hair low and make the
// FINAL year unpayable by a float residue. Review measured it on the 30 → 32 →
// 35 fixture (1,49e-8 đồng) and on a 30 → 60 → 90 grid (up to 6,175e-5 đồng).
// A view must not say the sustainable spend is a year short.
describe("the funded boundary", () => {
  const REVIEWED: RetirementInput = {
    currentAge: 30,
    retirementAge: 32,
    endAge: 35,
    currentBalance: 100_000_000,
    annualContribution: 10_000_000,
    contributionGrowthPercent: 0,
    returnBeforePercent: 10,
    returnAfterPercent: 0,
    inflationPercent: 0,
    desiredAnnualSpending: 50_000_000,
    otherAnnualIncome: 0,
  };

  it("forgives the reviewed 1,49e-8 đồng residue, and SAYS it forgave it", () => {
    const p = resolveLongTermPlan(REVIEWED)!;
    const sustainable = p.withdrawal.paths[1];
    expect(sustainable.key).toBe("sustainable");
    expect(sustainable.annualSpending).toBeCloseTo(48_033_333.333333336, 6);
    // The projection's own ledger is UNCHANGED — the depletion is still
    // there, with the residue the review measured.
    expect(sustainable.projection.depletionAge).toBe(34);
    expect(sustainable.projection.lastWithdrawalShortfall).toBeCloseTo(
      1.4901161193847656e-8,
      12,
    );
    // The policy's verdict is what changed, and it reports the residue.
    expect(sustainable.funded).toBe(true);
    expect(sustainable.boundaryResidue).toBe(
      sustainable.projection.lastWithdrawalShortfall,
    );
  });

  it("never forgives a real shortfall, in money or in years", () => {
    const p = resolveLongTermPlan(REVIEWED)!;
    const entered = p.withdrawal.paths[0];
    expect(entered.funded).toBe(false);
    expect(entered.boundaryResidue).toBeNull();
    // 5,9 triệu a year short is money, not a residue.
    expect(entered.projection.lastWithdrawalShortfall!).toBeGreaterThan(
      5_000_000,
    );

    // And a plan short by whole years is refused however small its final
    // year's unpaid part happens to be: the policy requires the FINAL year.
    const short = resolveLongTermPlan({
      ...REVIEWED,
      desiredAnnualSpending: 200_000_000,
    })!;
    expect(short.withdrawal.paths[0].funded).toBe(false);
    expect(short.withdrawal.paths[0].projection.depletionAge).toBeLessThan(
      REVIEWED.endAge - 1,
    );
  });

  it("holds across the reviewed 30 → 60 → 90 grid", () => {
    for (const returnAfterPercent of [2, 5, 8]) {
      for (const inflationPercent of [0, 2.5, 4]) {
        const p = resolveLongTermPlan({
          currentAge: 30,
          retirementAge: 60,
          endAge: 90,
          currentBalance: 500_000_000,
          annualContribution: 60_000_000,
          contributionGrowthPercent: 5,
          returnBeforePercent: 8,
          returnAfterPercent,
          inflationPercent,
          desiredAnnualSpending: 240_000_000,
          otherAnnualIncome: 36_000_000,
        });
        const label = `after ${returnAfterPercent}%, inflation ${inflationPercent}%`;
        expect(p, label).not.toBeNull();
        const sustainable = p!.withdrawal.paths.find(
          (path) => path.key === "sustainable",
        );
        if (sustainable === undefined) continue;
        // The whole point: the sustainable spend is never reported short.
        expect(sustainable.funded, label).toBe(true);
        if (sustainable.boundaryResidue !== null) {
          // When it was a boundary case, the residue is sub-đồng and the
          // depletion it forgave was the final year.
          expect(sustainable.boundaryResidue, label).toBeLessThan(1e-3);
          expect(sustainable.projection.depletionAge, label).toBe(89);
        }
      }
    }
  });

  it("is the same verdict every view uses", () => {
    // A funded plan whose final year carries a residue must not read as
    // funded in one view and short in another.
    const p = resolveLongTermPlan(REVIEWED)!;
    const sustainablePlan = resolveLongTermPlan({
      ...REVIEWED,
      desiredAnnualSpending: p.withdrawal.sustainableSpending!,
    })!;
    expect(sustainablePlan.gap.funded).toBe(true);
    expect(sustainablePlan.gap.realShortfall).toBe(0);
    expect(sustainablePlan.withdrawal.paths[0].funded).toBe(true);
  });
});

describe("boundaries the plan's own requirements name", () => {
  it("refuses a rate at −100%, in every rate field", () => {
    for (const field of [
      "inflationPercent",
      "returnAfterPercent",
      "returnBeforePercent",
      "contributionGrowthPercent",
    ] as const) {
      expect(
        resolveLongTermPlan({ ...BASE, [field]: -100 }),
        `${field} at −100%`,
      ).toBeNull();
      // Just inside the boundary still works.
      expect(
        resolveLongTermPlan({ ...BASE, [field]: -99.9 }),
        `${field} at −99,9%`,
      ).not.toBeNull();
    }
  });

  it("reports the PARTIAL payment in the year the money runs out", () => {
    const p = plan();
    const at = p.asEntered.depletionAge!;
    expect(at).toBeGreaterThan(BASE.retirementAge);
    // Three figures, not one date: the year's need, what was actually paid,
    // and the difference.
    expect(p.asEntered.lastWithdrawalPlanned!).toBeGreaterThan(0);
    expect(p.asEntered.lastWithdrawalPaid!).toBeLessThan(
      p.asEntered.lastWithdrawalPlanned!,
    );
    expect(p.asEntered.lastWithdrawalShortfall).toBeCloseTo(
      p.asEntered.lastWithdrawalPlanned! - p.asEntered.lastWithdrawalPaid!,
      6,
    );
    // They belong to that year's row, and the paid figure is what it shows.
    const row = p.asEntered.years.find((year) => year.age === at)!;
    expect(row.withdrawal).toBe(p.asEntered.lastWithdrawalPaid);
    // A funded plan has none of them.
    const funded = plan({ currentBalance: 20_000_000_000 });
    expect(funded.asEntered.lastWithdrawalPlanned).toBeNull();
    expect(funded.asEntered.lastWithdrawalPaid).toBeNull();
    expect(funded.asEntered.lastWithdrawalShortfall).toBeNull();
  });

  it("keeps annual contributions annual", () => {
    // The engine applies the contribution once a year. Feeding it a monthly
    // figure by mistake would understate the plan by a factor of twelve, and
    // this module never multiplies or divides on the way IN.
    const p = plan();
    const firstYear = p.asEntered.years[0];
    expect(firstYear.contribution).toBeCloseTo(BASE.annualContribution, 6);
  });
});
