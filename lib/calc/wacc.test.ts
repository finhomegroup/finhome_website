import { describe, it, expect } from "vitest";
import { computeWacc, type WaccInput } from "@/lib/calc/wacc";

// 700 tỷ equity at 14%, 300 tỷ debt at 9%, Vietnam's 20% CIT rate.
const BASE: WaccInput = {
  equityValue: 700_000_000_000,
  debtValue: 300_000_000_000,
  costOfEquityPercent: 14,
  costOfDebtPercent: 9,
  taxRatePercent: 20,
};

function wacc(input: WaccInput) {
  const result = computeWacc(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeWacc — the weights", () => {
  it("weights on total capital", () => {
    const result = wacc(BASE);
    expect(result.totalCapital).toBe(1_000_000_000_000);
    expect(result.equityWeightPercent).toBeCloseTo(70, 10);
    expect(result.debtWeightPercent).toBeCloseTo(30, 10);
    expect(result.preferredWeightPercent).toBe(0);
  });

  it("sums the weights to 100", () => {
    const result = wacc({ ...BASE, preferredValue: 100_000_000_000, costOfPreferredPercent: 11 });
    expect(
      result.equityWeightPercent +
        result.debtWeightPercent +
        result.preferredWeightPercent,
    ).toBeCloseTo(100, 8);
  });

  it("reports gearing", () => {
    expect(wacc(BASE).debtToEquity).toBeCloseTo(300 / 700, 10);
    expect(wacc({ ...BASE, debtValue: 0 }).debtToEquity).toBe(0);
  });

  it("has no gearing ratio with no equity", () => {
    const result = wacc({ ...BASE, equityValue: 0 });
    expect(result.debtToEquity).toBeNull();
    expect(result.debtWeightPercent).toBeCloseTo(100, 10);
  });
});

describe("computeWacc — the tax shield applies to debt only", () => {
  it("reduces the cost of debt by the tax rate", () => {
    // 9% × (1 − 0,20) = 7,2%.
    expect(wacc(BASE).afterTaxCostOfDebtPercent).toBeCloseTo(7.2, 10);
  });

  it("leaves equity and preferred untouched", () => {
    // The standard error is shielding all three. Equity's contribution must
    // be exactly its weight times its full cost.
    const result = wacc({
      ...BASE,
      preferredValue: 100_000_000_000,
      costOfPreferredPercent: 11,
    });
    expect(result.totalCapital).toBe(1_100_000_000_000);
    expect(result.equityContributionPoints).toBeCloseTo(
      (700 / 1100) * 14,
      8,
    );
    expect(result.preferredContributionPoints).toBeCloseTo(
      (100 / 1100) * 11,
      8,
    );
  });

  it("computes the WACC from the three contributions", () => {
    // 0,7 × 14 + 0,3 × 7,2 = 9,8 + 2,16 = 11,96%.
    const result = wacc(BASE);
    expect(result.waccPercent).toBeCloseTo(11.96, 10);
    expect(result.waccPercent).toBeCloseTo(
      result.equityContributionPoints +
        result.debtContributionPoints +
        result.preferredContributionPoints,
      10,
    );
  });

  it("measures the shield as the gap to the unshielded figure", () => {
    const result = wacc(BASE);
    // 0,7 × 14 + 0,3 × 9 = 12,5% with no deduction.
    expect(result.waccBeforeTaxShieldPercent).toBeCloseTo(12.5, 10);
    expect(result.taxShieldPoints).toBeCloseTo(0.54, 10);
  });

  it("closes the gap at a 0% tax rate", () => {
    const result = wacc({ ...BASE, taxRatePercent: 0 });
    expect(result.afterTaxCostOfDebtPercent).toBeCloseTo(9, 10);
    expect(result.waccPercent).toBeCloseTo(
      result.waccBeforeTaxShieldPercent,
      10,
    );
    expect(result.taxShieldPoints).toBeCloseTo(0, 10);
  });

  it("makes debt free at a 100% tax rate", () => {
    const result = wacc({ ...BASE, taxRatePercent: 100 });
    expect(result.afterTaxCostOfDebtPercent).toBe(0);
    expect(result.waccPercent).toBeCloseTo(9.8, 10);
  });

  it("grows the shield with gearing", () => {
    const light = wacc({
      ...BASE,
      equityValue: 900_000_000_000,
      debtValue: 100_000_000_000,
    }).taxShieldPoints;
    const heavy = wacc({
      ...BASE,
      equityValue: 300_000_000_000,
      debtValue: 700_000_000_000,
    }).taxShieldPoints;
    expect(heavy).toBeGreaterThan(light);
  });
});

describe("computeWacc — the pure cases", () => {
  it("is the cost of equity with no debt", () => {
    const result = wacc({ ...BASE, debtValue: 0 });
    expect(result.waccPercent).toBeCloseTo(14, 10);
    expect(result.equityWeightPercent).toBeCloseTo(100, 10);
  });

  it("is the after-tax cost of debt with no equity", () => {
    const result = wacc({ ...BASE, equityValue: 0 });
    expect(result.waccPercent).toBeCloseTo(7.2, 10);
  });

  it("falls as cheap debt replaces expensive equity", () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const debt of [0, 200, 400, 600, 800]) {
      const result = wacc({
        ...BASE,
        equityValue: (1000 - debt) * 1_000_000_000,
        debtValue: debt * 1_000_000_000,
      });
      expect(result.waccPercent).toBeLessThan(previous);
      previous = result.waccPercent;
    }
  });
});

describe("computeWacc — rejected inputs", () => {
  it("rejects a capital structure with nothing in it", () => {
    expect(
      computeWacc({ ...BASE, equityValue: 0, debtValue: 0 }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeWacc({ ...BASE, equityValue: -1 })).toBeNull();
    expect(computeWacc({ ...BASE, debtValue: -1 })).toBeNull();
    expect(computeWacc({ ...BASE, preferredValue: -1 })).toBeNull();
    expect(computeWacc({ ...BASE, taxRatePercent: -1 })).toBeNull();
    expect(computeWacc({ ...BASE, taxRatePercent: 101 })).toBeNull();
    expect(
      computeWacc({ ...BASE, costOfEquityPercent: Number.NaN }),
    ).toBeNull();
    expect(computeWacc({ ...BASE, equityValue: Number.NaN })).toBeNull();
  });
});
