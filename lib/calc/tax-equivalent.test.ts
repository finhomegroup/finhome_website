import { describe, it, expect } from "vitest";
import {
  computeTaxEquivalent,
  type TaxEquivalentInput,
} from "@/lib/calc/tax-equivalent";

// A 5,5% deposit — untaxed for individuals in Vietnam — against a corporate
// bond coupon taxed at 5%.
const BASE: TaxEquivalentInput = {
  direction: "toTaxable",
  yieldPercent: 5.5,
  taxRatePercent: 5,
};

function equiv(input: TaxEquivalentInput) {
  const result = computeTaxEquivalent(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeTaxEquivalent — grossing up a tax-free yield", () => {
  it("divides by the retention rate", () => {
    // 5,5 ÷ 0,95 = 5,78947…%
    const result = equiv(BASE);
    expect(result.taxFreePercent).toBe(5.5);
    expect(result.taxablePercent).toBeCloseTo(5.789_473_68, 8);
  });

  it("makes the after-tax yield equal the tax-free one, by construction", () => {
    const result = equiv(BASE);
    expect(result.afterTaxPercent).toBeCloseTo(result.taxFreePercent, 10);
  });

  it("states the tax cost in percentage points", () => {
    const result = equiv(BASE);
    expect(result.taxCostPoints).toBeCloseTo(0.289_473_68, 8);
    expect(result.taxCostPoints).toBeCloseTo(
      result.taxablePercent - result.taxFreePercent,
      10,
    );
  });

  it("needs a bigger gross-up than the tax rate itself", () => {
    // The asymmetry people get wrong: dividing by (1 − t) moves further than
    // multiplying by it. At a 5% tax rate the gross-up is 5,263%.
    const result = equiv(BASE);
    expect(result.grossUpPercent).toBeCloseTo(5.263_157_89, 8);
    expect(result.grossUpPercent).toBeGreaterThan(5);
  });

  it("settles the comparison the page exists for", () => {
    // A 5,8% bond against a 5,5% deposit is not 0,3 points better — it is a
    // dead heat once the 5% coupon tax is applied.
    const needed = equiv(BASE).taxablePercent;
    expect(needed).toBeLessThan(5.8);
    expect(5.8 - needed).toBeLessThan(0.02);
  });

  it("changes nothing at a 0% tax rate", () => {
    const result = equiv({ ...BASE, taxRatePercent: 0 });
    expect(result.taxablePercent).toBe(5.5);
    expect(result.taxCostPoints).toBe(0);
    expect(result.grossUpPercent).toBe(0);
  });

  it("grows steeply as the tax rate rises", () => {
    let previous = 5.5;
    for (const taxRatePercent of [5, 10, 20, 35, 50]) {
      const value = equiv({ ...BASE, taxRatePercent }).taxablePercent;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
    // At 50% tax the taxable product must quote double.
    expect(previous).toBeCloseTo(11, 8);
  });
});

describe("computeTaxEquivalent — netting down a taxable yield", () => {
  const DOWN: TaxEquivalentInput = {
    direction: "toAfterTax",
    yieldPercent: 5.8,
    taxRatePercent: 5,
  };

  it("multiplies by the retention rate", () => {
    const result = equiv(DOWN);
    expect(result.taxablePercent).toBe(5.8);
    expect(result.afterTaxPercent).toBeCloseTo(5.51, 8);
    expect(result.taxFreePercent).toBeCloseTo(5.51, 8);
  });

  it("round-trips against the other direction", () => {
    const down = equiv(DOWN);
    const back = equiv({
      direction: "toTaxable",
      yieldPercent: down.taxFreePercent,
      taxRatePercent: 5,
    });
    expect(back.taxablePercent).toBeCloseTo(5.8, 8);
  });

  it("shows the haircut is smaller than the gross-up", () => {
    // Both at a 5% rate on a 5,5% base: the gross-up adds 0,2895 points, the
    // haircut removes only 0,275.
    const up = equiv(BASE);
    const down = equiv({ ...DOWN, yieldPercent: 5.5 });
    expect(down.taxCostPoints).toBeCloseTo(0.275, 8);
    expect(down.taxCostPoints).toBeLessThan(up.taxCostPoints);
  });

  it("changes nothing at a 0% tax rate", () => {
    const result = equiv({ ...DOWN, taxRatePercent: 0 });
    expect(result.afterTaxPercent).toBe(5.8);
    expect(result.taxCostPoints).toBe(0);
  });
});

describe("computeTaxEquivalent — edges and rejection", () => {
  it("handles a negative yield", () => {
    // A real yield net of higher inflation is genuinely negative.
    const result = equiv({ ...BASE, yieldPercent: -2 });
    expect(result.taxablePercent).toBeCloseTo(-2 / 0.95, 8);
    expect(result.afterTaxPercent).toBeCloseTo(-2, 10);
  });

  it("reports no gross-up on a zero yield", () => {
    const result = equiv({ ...BASE, yieldPercent: 0 });
    expect(result.taxablePercent).toBe(0);
    expect(result.taxCostPoints).toBe(0);
    expect(result.grossUpPercent).toBe(0);
  });

  it("rejects a 100% tax rate, where no yield can match", () => {
    expect(
      computeTaxEquivalent({ ...BASE, taxRatePercent: 100 }),
    ).toBeNull();
    expect(
      computeTaxEquivalent({ ...BASE, taxRatePercent: 99.9 }),
    ).not.toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(
      computeTaxEquivalent({ ...BASE, taxRatePercent: -1 }),
    ).toBeNull();
    expect(
      computeTaxEquivalent({ ...BASE, taxRatePercent: 101 }),
    ).toBeNull();
    expect(
      computeTaxEquivalent({ ...BASE, yieldPercent: Number.NaN }),
    ).toBeNull();
    expect(
      computeTaxEquivalent({ ...BASE, taxRatePercent: Number.NaN }),
    ).toBeNull();
  });
});
