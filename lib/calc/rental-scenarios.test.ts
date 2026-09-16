// Original row 15's vacancy and maintenance scenarios.
//
// The reference figures come from the page's own shipped defaults, which
// `content/calculators/rental-property.ts` records: 3 tỷ, trả trước 1,2 tỷ,
// phí mua 150 triệu, vay 9%/năm 240 tháng, thuê 15 triệu/tháng, trống 5%,
// chi phí 2 triệu/tháng. Every scenario figure below is recomputed here from
// `computeRentalProperty` on the same inputs with one assumption replaced, so
// this file checks the COMPARISON's own contracts — selection not increment,
// deltas against the baseline, nulls preserved — rather than re-deriving the
// property arithmetic a second time.
import { describe, expect, it } from "vitest";
import { computeRentalProperty } from "@/lib/calc/rental-property";
import {
  compareRentalScenarios,
  SCENARIO_EXPENSE_UPLIFT_PERCENT,
  SCENARIO_EXTRA_VACANT_MONTHS,
} from "@/lib/calc/rental-scenarios";

const INPUT = {
  price: 3_000_000_000,
  downPayment: 1_200_000_000,
  purchaseCosts: 150_000_000,
  annualRatePercent: 9,
  termMonths: 240,
  monthlyRent: 15_000_000,
  vacancyPercent: 5,
  monthlyExpenses: 2_000_000,
};

describe("the four scenarios", () => {
  const comparison = compareRentalScenarios(INPUT)!;

  it("leads with the reader's own figures, unchanged", () => {
    const base = comparison.scenarios[0];
    expect(base.key).toBe("base");
    expect(base.vacancyPercent).toBe(5);
    expect(base.monthlyExpenses).toBe(2_000_000);
    expect(base.cashFlowPerMonthDelta).toBe(0);
    expect(base.result.cashFlowPerMonth).toBe(
      comparison.base.cashFlowPerMonth,
    );
  });

  it("expresses an extra empty month as percentage points of a year", () => {
    expect(SCENARIO_EXTRA_VACANT_MONTHS).toBe(1);
    expect(comparison.extraVacancyPoints).toBeCloseTo(100 / 12, 12);
    const vacancy = comparison.scenarios[1];
    expect(vacancy.key).toBe("vacancy");
    expect(vacancy.vacancyPercent).toBeCloseTo(5 + 100 / 12, 12);
    // The cost side is untouched in this scenario.
    expect(vacancy.monthlyExpenses).toBe(2_000_000);
  });

  it("raises only the recurring cost in the cost scenario", () => {
    expect(SCENARIO_EXPENSE_UPLIFT_PERCENT).toBe(50);
    const expenses = comparison.scenarios[2];
    expect(expenses.key).toBe("expenses");
    expect(expenses.monthlyExpenses).toBe(3_000_000);
    expect(expenses.vacancyPercent).toBe(5);
  });

  it("is a SELECTION, not an increment: nothing compounds", () => {
    // "Both" changes the same two assumptions the single scenarios change —
    // it does not apply the uplift twice, which is the defect the rate-stress
    // preset shipped.
    const both = comparison.scenarios[3];
    expect(both.key).toBe("both");
    expect(both.vacancyPercent).toBe(comparison.scenarios[1].vacancyPercent);
    expect(both.monthlyExpenses).toBe(comparison.scenarios[2].monthlyExpenses);
    // And calling it twice returns the same figures, exactly.
    const again = compareRentalScenarios(INPUT)!;
    expect(again.scenarios.map((s) => s.result.cashFlowPerMonth)).toEqual(
      comparison.scenarios.map((s) => s.result.cashFlowPerMonth),
    );
  });

  it("delegates every figure to the engine, on the same inputs", () => {
    for (const scenario of comparison.scenarios) {
      const direct = computeRentalProperty({
        ...INPUT,
        vacancyPercent: scenario.vacancyPercent,
        monthlyExpenses: scenario.monthlyExpenses,
      })!;
      expect(scenario.result).toEqual(direct);
    }
  });

  it("reports each scenario as a DIFFERENCE from the baseline", () => {
    for (const scenario of comparison.scenarios) {
      expect(scenario.cashFlowPerMonthDelta).toBeCloseTo(
        scenario.result.cashFlowPerMonth - comparison.base.cashFlowPerMonth,
        6,
      );
      // Worse assumptions can only reduce the cash flow.
      if (scenario.key !== "base") {
        expect(scenario.cashFlowPerMonthDelta).toBeLessThan(0);
      }
    }
  });

  it("flags the sign change, which is the question the view answers", () => {
    // The shipped defaults are already negative, so both flags are true.
    expect(comparison.baseNegativeCashFlow).toBe(true);
    expect(comparison.anyNegativeCashFlow).toBe(true);
  });

  it("finds the case where a scenario turns a positive plan negative", () => {
    // Cash-positive at the reader's own figures, negative once a month of
    // vacancy and half again the costs are assumed. This is the state the
    // page's own notice is written for.
    // A bigger deposit on the same flat: +1.453.289 ₫/month at the reader's
    // own assumptions, −796.711 ₫ once a month of vacancy and half again the
    // running costs are assumed. Both figures from this module.
    const tighter = compareRentalScenarios({
      ...INPUT,
      downPayment: 1_800_000_000,
    })!;
    expect(tighter.baseNegativeCashFlow).toBe(false);
    expect(tighter.base.cashFlowPerMonth).toBeCloseTo(1_453_288.53, 2);
    expect(tighter.anyNegativeCashFlow).toBe(true);
    expect(tighter.scenarios[3].result.cashFlowPerMonth).toBeCloseTo(
      -796_711.47,
      2,
    );
    // The single-assumption scenarios still survive, so the notice is about
    // the combination and the table shows which one did it.
    expect(tighter.scenarios[1].result.cashFlowPerMonth).toBeGreaterThan(0);
  });
});

// The review's own reconciliation fixture, executed independently against a
// loan annuity of 2 tỷ × (0,085/12) ÷ (1 − (1 + 0,085/12)^−240): price 3 tỷ,
// deposit 1 tỷ, 100 triệu of purchase costs, rent 25 triệu/tháng, 10%
// vacancy, 3 triệu/tháng of running costs, revenue below the 1 tỷ threshold.
describe("the review's cash-flow bridge, to the đồng", () => {
  const FIXTURE = {
    price: 3_000_000_000,
    downPayment: 1_000_000_000,
    purchaseCosts: 100_000_000,
    annualRatePercent: 8.5,
    termMonths: 240,
    monthlyRent: 25_000_000,
    vacancyPercent: 10,
    monthlyExpenses: 3_000_000,
  };

  it("reproduces the baseline monthly figure exactly", () => {
    const base = compareRentalScenarios(FIXTURE)!.base;
    // 25m − 2,5m vacancy − 3m expenses − 0 tax − 17.356.464,66731 debt.
    expect(base.rentalTaxPerYear).toBe(0);
    expect(base.monthlyPayment).toBeCloseTo(17_356_464.66731, 4);
    expect(base.cashFlowPerMonth).toBeCloseTo(2_143_535.33269, 4);
    // The one-off purchase cost belongs in the capital at risk, NOT in a
    // monthly expense a second time.
    expect(base.cashInvested).toBe(1_100_000_000);
  });

  it("reproduces the stressed figure, and the gap reconciles to its parts", () => {
    // 20% vacancy AND 2 triệu more of recurring maintenance — total 5 triệu,
    // not double-counted.
    const stressed = compareRentalScenarios({
      ...FIXTURE,
      vacancyPercent: 20,
      monthlyExpenses: 5_000_000,
    })!.base;
    expect(stressed.cashFlowPerMonth).toBeCloseTo(-2_356_464.66731, 4);

    const base = compareRentalScenarios(FIXTURE)!.base;
    const deterioration = base.cashFlowPerMonth - stressed.cashFlowPerMonth;
    expect(deterioration).toBeCloseTo(4_500_000, 4);
    // And it is EXACTLY the two assumptions that changed: 2,5 triệu more of
    // vacancy (10% of 25 triệu) plus 2 triệu more of maintenance.
    expect(deterioration).toBeCloseTo(2_500_000 + 2_000_000, 4);
  });

  it("is an annualised run rate, not a dated month", () => {
    // The figure is `cashFlowPerYear ÷ 12`; nothing here claims the rent and
    // the instalment land on the same day of the month.
    const base = compareRentalScenarios(FIXTURE)!.base;
    expect(base.cashFlowPerMonth).toBeCloseTo(base.cashFlowPerYear / 12, 9);
  });
});

describe("edge cases and refusals", () => {
  it("caps vacancy at a whole year rather than wrapping past it", () => {
    const comparison = compareRentalScenarios({
      ...INPUT,
      vacancyPercent: 95,
    })!;
    expect(comparison.scenarios[1].vacancyPercent).toBe(100);
    expect(comparison.scenarios[1].result.effectiveRentPerYear).toBe(0);
  });

  it("keeps a null ratio null rather than reporting a zero difference", () => {
    // A cash purchase has no debt service, so there is no DSCR on either
    // side — and "they are the same" is not what a missing figure means.
    const cash = compareRentalScenarios({
      ...INPUT,
      downPayment: 3_000_000_000,
    })!;
    for (const scenario of cash.scenarios) {
      expect(scenario.result.dscr).toBeNull();
      expect(scenario.dscrDelta).toBeNull();
    }
    // Cash-on-cash still exists here, because cash WAS invested.
    expect(cash.scenarios[1].cashOnCashDeltaPoints).not.toBeNull();
  });

  it("keeps cash-on-cash null when nothing was invested", () => {
    const nothing = compareRentalScenarios({
      ...INPUT,
      downPayment: 0,
      purchaseCosts: 0,
    })!;
    for (const scenario of nothing.scenarios) {
      expect(scenario.result.cashOnCashPercent).toBeNull();
      expect(scenario.cashOnCashDeltaPoints).toBeNull();
    }
  });

  it("refuses when the baseline itself is not a property", () => {
    expect(compareRentalScenarios({ ...INPUT, price: 0 })).toBeNull();
    expect(
      compareRentalScenarios({ ...INPUT, monthlyRent: -1 }),
    ).toBeNull();
    expect(
      compareRentalScenarios({ ...INPUT, downPayment: 4_000_000_000 }),
    ).toBeNull();
  });

  it("carries the declared PIT relief into every scenario", () => {
    // A declaration applies to the whole comparison or none of it: a table
    // whose rows disagreed about the tax treatment would be unreadable.
    const relieved = compareRentalScenarios({
      ...INPUT,
      monthlyRent: 90_000_000,
      pitThresholdPerYear: 1_000_000_000,
      pitReliefPercent: 30,
    })!;
    for (const scenario of relieved.scenarios) {
      if (scenario.result.pitPerYear > 0) {
        expect(scenario.result.pitReliefPerYear).toBeCloseTo(
          scenario.result.pitPerYear * 0.3,
          6,
        );
      }
    }
  });
});
