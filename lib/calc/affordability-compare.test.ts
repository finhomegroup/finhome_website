/**
 * ORIGINAL ROW 7 — the baseline-versus-changed comparison, on one model.
 *
 * The supervisor's household fixture: gross 55 triệu, net 45 triệu, essential
 * 20 triệu, existing debt 3 triệu, monthly buffer 5 triệu, other housing costs
 * 2 triệu; cash 900 triệu less a protected 150 triệu reserve, 3% purchase
 * costs, an ASSUMED maximum financing share of 70%, 240 months, ratios 40%/50%.
 * Housing budget 17 triệu, principal-and-interest budget 15 triệu.
 *
 * | Rate  | Payment-supported borrowing | Affordable price    | Loan used         | Binding                          |
 * |-------|-----------------------------|---------------------|-------------------|----------------------------------|
 * | 8,5%  | 1.728.462.597,3688219       | 2.272.727.272,727272| 1.590.909.090,90909| cash / assumed financing share  |
 * | 10,5% | 1.502.434.113,084084        | 2.186.829.236,003965| 1.502.434.113,084084| monthly capacity               |
 * | 12,5% | 1.320.259.188,334673        | 2.009.960.377,0239542| 1.320.259.188,334673| monthly capacity              |
 *
 * The reference side is computed IN THIS FILE from the closed forms in the
 * module's own docstring — a present value written out here, and the two price
 * ceilings `(K + C) / (1 + c)` and `C / (1 + c − v)`. Nothing in the reference
 * imports `finance.ts` or `affordability.ts`.
 *
 * These are deterministic test inputs: not market rates, not a bank's policy,
 * not an approval and not a recommendation.
 *
 * Bounds are stated absolutely, per docs §8 — `toBeCloseTo`'s second argument
 * is a digit count, not a delta.
 */
import { describe, expect, it } from "vitest";
import { computeAffordability } from "@/lib/calc/affordability";
import {
  COMPARED_KEYS,
  compareAffordabilityScenarios,
} from "@/lib/calc/affordability-compare";

/** `|actual − expected| < tolerance`. */
function near(actual: number, expected: number, tolerance: number, label?: string) {
  expect(Math.abs(actual - expected), label).toBeLessThan(tolerance);
}

/** A thousandth of a đồng on nine-figure amounts: float residue only. */
const DONG = 1e-3;

const BASE = {
  mode: "household" as const,
  monthlyIncome: 55_000_000,
  monthlyNetIncome: 45_000_000,
  essentialExpenses: 20_000_000,
  monthlyDebts: 3_000_000,
  monthlyBuffer: 5_000_000,
  monthlyHousingCosts: 2_000_000,
  downPayment: 900_000_000,
  cashReserve: 150_000_000,
  purchaseCostPercent: 3,
  assumedMaxLtvPercent: 70,
  termMonths: 240,
  housingRatioPercent: 40,
  totalDebtRatioPercent: 50,
};

/** The independent reference: present value of the affordable instalment. */
function referencePrice(annualRatePercent: number) {
  // Monthly budget: net − essentials − debts − buffer = 17 triệu, capped by the
  // ratio ceiling (min of 40% × 55 = 22 triệu and 50% × 55 − 3 = 24,5 triệu).
  const residual =
    BASE.monthlyNetIncome -
    BASE.essentialExpenses -
    BASE.monthlyDebts -
    BASE.monthlyBuffer;
  const ceiling = Math.min(
    BASE.monthlyIncome * (BASE.housingRatioPercent / 100),
    BASE.monthlyIncome * (BASE.totalDebtRatioPercent / 100) - BASE.monthlyDebts,
  );
  const housingBudget = Math.min(residual, ceiling);
  const principalInterest = housingBudget - BASE.monthlyHousingCosts;

  const rate = annualRatePercent / 100 / 12;
  const capacity =
    rate === 0
      ? principalInterest * BASE.termMonths
      : (principalInterest * (1 - (1 + rate) ** -BASE.termMonths)) / rate;

  const cash = BASE.downPayment - BASE.cashReserve;
  const costRate = BASE.purchaseCostPercent / 100;
  const ltv = BASE.assumedMaxLtvPercent / 100;
  const capacityBound = (capacity + cash) / (1 + costRate);
  const financingBound = cash / (1 + costRate - ltv);

  return {
    housingBudget,
    principalInterest,
    capacity,
    price: Math.min(capacityBound, financingBound),
    binding: financingBound < capacityBound ? "financing" : "payment",
  };
}

const scenarioAt = (annualRatePercent: number) => {
  const input = { ...BASE, annualRatePercent };
  const result = computeAffordability(input);
  expect(result, `rate ${annualRatePercent}`).not.toBeNull();
  if (result === null) throw new Error("unreachable");
  return { input, result };
};

describe("the household fixture reproduces the audit's table", () => {
  it("splits the budget the same way at every rate", () => {
    const reference = referencePrice(8.5);
    expect(reference.housingBudget).toBe(17_000_000);
    expect(reference.principalInterest).toBe(15_000_000);

    const { result } = scenarioAt(8.5);
    expect(result.affordableHousingPayment).toBe(17_000_000);
    expect(result.affordablePrincipalInterest).toBe(15_000_000);
    // The budget came from the household, not from the ratios.
    expect(result.bindingLimit).toBe("household");
    // The reserve is out of the usable cash exactly once.
    expect(result.usableCash).toBe(750_000_000);
  });

  it.each([
    [8.5, 1_728_462_597.3688219, 2_272_727_272.727272, 1_590_909_090.90909, "financing"],
    [10.5, 1_502_434_113.084084, 2_186_829_236.003965, 1_502_434_113.084084, "payment"],
    [12.5, 1_320_259_188.334673, 2_009_960_377.0239542, 1_320_259_188.334673, "payment"],
  ])(
    "at %f%% supports %d of borrowing and a %d price",
    (rate, capacity, price, loanUsed, binding) => {
      const reference = referencePrice(rate);
      const { result } = scenarioAt(rate);

      near(result.paymentSupportedLoan, reference.capacity, DONG, "capacity vs reference");
      near(result.paymentSupportedLoan, capacity, DONG, "capacity vs fixture");
      near(result.maxPrice, reference.price, DONG, "price vs reference");
      near(result.maxPrice, price, DONG, "price vs fixture");
      near(result.maxLoan, loanUsed, DONG, "loan used vs fixture");
      expect(result.priceBinding).toBe(binding);
    },
  );

  it("does not spend the reserve a second time at the baseline", () => {
    // The audit's own identity: cash-to-price 681.818.181,818182 plus purchase
    // costs 68.181.818,18181816 is exactly the 750 triệu of usable cash.
    const { result } = scenarioAt(8.5);
    near(result.cashToPrice, 681_818_181.818182, DONG, "cash to price");
    near(result.purchaseCosts, 68_181_818.18181816, DONG, "purchase costs");
    near(
      result.cashToPrice + result.purchaseCosts,
      result.usableCash,
      DONG,
      "cash identity",
    );
  });

  it("keeps capacity and the financeable loan distinct where they differ", () => {
    // At 8,5% the payment could service 1,73 tỷ but the cash and the assumed
    // 70% financing share only reach 1,59 tỷ. Conflating the two is the defect
    // the three separate figures exist to prevent.
    const { result } = scenarioAt(8.5);
    expect(result.maxLoan).toBeLessThan(result.paymentSupportedLoan);
    near(result.maxLoan, result.maxPrice * 0.7, DONG, "loan at the assumed share");
    // At 10,5% the monthly capacity binds and the two coincide.
    const tighter = scenarioAt(10.5).result;
    near(
      tighter.maxLoan,
      tighter.paymentSupportedLoan,
      DONG,
      "capacity binds",
    );
  });
});

describe("the monthly budget is not the instalment", () => {
  /**
   * The reproduced label defect: the page called the 15 triệu BUDGET "trả gốc
   * và lãi mỗi tháng" while the loan the cash actually allows —
   * 1.590.909.090,90909 ₫ at 8,5% over 240 months — charges 13.806.278,71 ₫.
   * The reader was told about 1,19 triệu a month they would not be paying.
   *
   * Reference computed here from the annuity closed form, not from `pmt`.
   */
  const instalment = (principal: number, annualRatePercent: number) => {
    const rate = annualRatePercent / 100 / 12;
    if (rate === 0) return principal / BASE.termMonths;
    const growth = (1 + rate) ** BASE.termMonths;
    return (principal * rate * growth) / (growth - 1);
  };

  it("reports the instalment on the loan actually used", () => {
    const { result } = scenarioAt(8.5);
    near(
      result.expectedPrincipalInterest,
      instalment(result.maxLoan, 8.5),
      DONG,
      "instalment vs reference",
    );
    near(
      result.expectedPrincipalInterest,
      13_806_278.712633489,
      DONG,
      "instalment vs independent figure",
    );
    // And it is NOT the budget the price was solved from.
    expect(result.affordablePrincipalInterest).toBe(15_000_000);
    near(
      result.affordablePrincipalInterest - result.expectedPrincipalInterest,
      1_193_721.2873665113,
      DONG,
      "budget minus instalment",
    );
  });

  it("coincides with the budget when the payment is what binds", () => {
    // At 10,5% and 12,5% the monthly capacity caps the price, so the loan used
    // IS the loan the budget services and the two figures are one.
    for (const rate of [10.5, 12.5]) {
      const { result } = scenarioAt(rate);
      expect(result.priceBinding, `rate ${rate}`).toBe("payment");
      near(
        result.expectedPrincipalInterest,
        result.affordablePrincipalInterest,
        DONG,
        `coincide at ${rate}`,
      );
    }
  });

  it("never reports an instalment above the budget", () => {
    // `maxLoan ≤ paymentSupportedLoan` and the instalment rises with the
    // principal, so this is an invariant rather than a coincidence. Swept over
    // the cash and the assumed financing share, which are what make them differ.
    for (const downPayment of [0, 200_000_000, 900_000_000, 5_000_000_000]) {
      for (const assumedMaxLtvPercent of [0, 30, 70, 100]) {
        for (const annualRatePercent of [0, 8.5, 12.5]) {
          const result = computeAffordability({
            ...BASE,
            downPayment,
            assumedMaxLtvPercent,
            annualRatePercent,
          });
          if (result === null) continue;
          const label = `${downPayment}/${assumedMaxLtvPercent}/${annualRatePercent}`;
          expect(
            result.expectedPrincipalInterest,
            label,
          ).toBeLessThanOrEqual(result.affordablePrincipalInterest + 1e-6);
          // And it really is the instalment on `maxLoan`.
          near(
            result.expectedPrincipalInterest,
            instalment(result.maxLoan, annualRatePercent),
            1e-3,
            label,
          );
        }
      }
    }
  });

  it("reports no instalment when there is no loan", () => {
    // A price of 0 charges nothing; a dash would be wrong and so would the
    // budget.
    const blocked = computeAffordability({
      ...BASE,
      downPayment: 0,
      cashReserve: 0,
      annualRatePercent: 8.5,
    });
    expect(blocked).not.toBeNull();
    if (blocked === null) return;
    expect(blocked.financingBlocked).toBe(true);
    expect(blocked.maxLoan).toBe(0);
    expect(blocked.expectedPrincipalInterest).toBe(0);
    // The capacity is still real: this is a deposit problem, not an income one.
    expect(blocked.paymentSupportedLoan).toBeGreaterThan(0);
  });
});

describe("compareAffordabilityScenarios — naming what changed", () => {
  it("names the one input that moved, and nothing else", () => {
    const baseline = scenarioAt(8.5);
    const changed = scenarioAt(10.5);
    const comparison = compareAffordabilityScenarios(baseline, changed);

    expect(comparison.changedKeys).toEqual(["annualRatePercent"]);
    expect(comparison.modeChanged).toBe(false);
    expect(comparison.conclusionLimited).toBe(false);
  });

  it("reports the signed differences from the audit's own figures", () => {
    const baseline = scenarioAt(8.5);
    const changed = scenarioAt(12.5);
    const comparison = compareAffordabilityScenarios(baseline, changed);

    near(
      comparison.priceChange,
      2_009_960_377.0239542 - 2_272_727_272.727272,
      DONG,
      "price change",
    );
    near(
      comparison.loanChange,
      1_320_259_188.334673 - 1_590_909_090.90909,
      DONG,
      "loan change",
    );
    near(
      comparison.paymentSupportedLoanChange,
      1_320_259_188.334673 - 1_728_462_597.3688219,
      DONG,
      "capacity change",
    );
    // A higher rate buys less house.
    expect(comparison.priceChange).toBeLessThan(0);
    // The monthly BUDGET did not move: the rate changed, not the household.
    expect(comparison.paymentChange).toBe(0);
    // The INSTALMENT did — it is the one figure a rate change acts on, and
    // reporting only the budget would have said a rate rise costs nothing a
    // month. It rises to meet the budget as the capacity becomes the binding
    // constraint.
    expect(comparison.expectedPaymentChange).toBeGreaterThan(0);
    near(
      comparison.expectedPaymentChange,
      15_000_000 - 13_806_278.712633489,
      DONG,
      "instalment change",
    );
    // And the ceiling that caps the price changed hands, which is worth saying.
    expect(comparison.priceBindingChanged).toBe(true);
    expect(comparison.bindingLimitChanged).toBe(false);
  });

  it("reports nothing changed when nothing changed", () => {
    const baseline = scenarioAt(8.5);
    const same = scenarioAt(8.5);
    const comparison = compareAffordabilityScenarios(baseline, same);
    expect(comparison.changedKeys).toEqual([]);
    expect(comparison.priceChange).toBe(0);
    expect(comparison.loanChange).toBe(0);
    expect(comparison.paymentChange).toBe(0);
    expect(comparison.paymentSupportedLoanChange).toBe(0);
    expect(comparison.priceBindingChanged).toBe(false);
  });

  it("flags a comparison across two different questions", () => {
    // Household comfort against a ratio ceiling on gross income is not one
    // question with two answers, and the flag is what lets the page say so.
    const household = scenarioAt(8.5);
    const ceilingInput = { ...BASE, mode: "ceiling" as const, annualRatePercent: 8.5 };
    const ceilingResult = computeAffordability(ceilingInput);
    expect(ceilingResult).not.toBeNull();
    if (ceilingResult === null) return;

    const comparison = compareAffordabilityScenarios(household, {
      input: ceilingInput,
      result: ceilingResult,
    });
    expect(comparison.modeChanged).toBe(true);
    expect(comparison.changedKeys).toContain("mode");
    // AND the flag is load-bearing rather than decorative: on this fixture the
    // cash binds the price on BOTH sides, so the headline price is IDENTICAL
    // while the question underneath it is not. Nothing in the figures could
    // carry that difference.
    expect(comparison.priceChange).toBe(0);
    expect(comparison.paymentChange).toBeGreaterThan(0);
    expect(comparison.paymentSupportedLoanChange).toBeGreaterThan(0);
    expect(comparison.bindingLimitChanged).toBe(true);
    expect(ceilingResult.householdResidual).toBeNull();
    // 40% of 55 triệu less the 2 triệu of other housing costs, against the
    // household's own 15 triệu.
    expect(ceilingResult.affordablePrincipalInterest).toBe(20_000_000);
    expect(household.result.affordablePrincipalInterest).toBe(15_000_000);
  });

  it("carries an unsupplied expense qualification into the comparison", () => {
    const baseline = scenarioAt(8.5);
    const unknownInput = {
      ...BASE,
      annualRatePercent: 8.5,
      essentialExpenses: undefined,
    };
    const unknownResult = computeAffordability(unknownInput);
    expect(unknownResult).not.toBeNull();
    if (unknownResult === null) return;

    const comparison = compareAffordabilityScenarios(baseline, {
      input: unknownInput,
      result: unknownResult,
    });
    expect(comparison.conclusionLimited).toBe(true);
    expect(comparison.changedKeys).toContain("essentialExpenses");
  });

  it("does not treat an unsupplied expense as a stated zero", () => {
    // The distinction the module is careful about has to survive the
    // comparison: unknown and "somebody else pays" are different scenarios,
    // even though their arithmetic is identical.
    const zeroInput = { ...BASE, annualRatePercent: 8.5, essentialExpenses: 0 };
    const unknownInput = {
      ...BASE,
      annualRatePercent: 8.5,
      essentialExpenses: undefined,
    };
    const zero = computeAffordability(zeroInput);
    const unknown = computeAffordability(unknownInput);
    expect(zero).not.toBeNull();
    expect(unknown).not.toBeNull();
    if (zero === null || unknown === null) return;

    // Identical figures...
    expect(zero.maxPrice).toBe(unknown.maxPrice);
    // ...and still a named change, because the provenance differs.
    const comparison = compareAffordabilityScenarios(
      { input: zeroInput, result: zero },
      { input: unknownInput, result: unknown },
    );
    expect(comparison.changedKeys).toEqual(["essentialExpenses"]);
    expect(comparison.priceChange).toBe(0);
    expect(comparison.conclusionLimited).toBe(true);
  });

  it("names several changes in a stable order", () => {
    const baseline = scenarioAt(8.5);
    const movedInput = {
      ...BASE,
      annualRatePercent: 10.5,
      downPayment: 1_200_000_000,
      termMonths: 300,
    };
    const movedResult = computeAffordability(movedInput);
    expect(movedResult).not.toBeNull();
    if (movedResult === null) return;

    const comparison = compareAffordabilityScenarios(baseline, {
      input: movedInput,
      result: movedResult,
    });
    // `COMPARED_KEYS` order, not insertion or alphabetical order.
    expect(comparison.changedKeys).toEqual([
      "downPayment",
      "annualRatePercent",
      "termMonths",
    ]);
    const order = comparison.changedKeys.map((key) =>
      COMPARED_KEYS.indexOf(key),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("covers every input the tool actually sends", () => {
    // A key added to the form without a decision about naming it would leave a
    // silent change in the comparison. The list is exhaustive over the inputs
    // this page sets.
    for (const key of [
      "mode",
      "monthlyIncome",
      "monthlyNetIncome",
      "essentialExpenses",
      "monthlyBuffer",
      "monthlyDebts",
      "downPayment",
      "cashReserve",
      "purchaseCostPercent",
      "assumedMaxLtvPercent",
      "annualRatePercent",
      "termMonths",
      "monthlyHousingCosts",
      "housingRatioPercent",
      "totalDebtRatioPercent",
    ] as const) {
      expect(COMPARED_KEYS, key).toContain(key);
    }
  });
});
