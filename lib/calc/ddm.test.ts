import { describe, it, expect } from "vitest";
import { computeDdm, type DdmInput } from "@/lib/calc/ddm";

// D0 = 2.000 ₫, growth 5%/năm, required return 12%/năm.
const BASE: DdmInput = {
  dividend: 2_000,
  growthPercent: 5,
  requiredReturnPercent: 12,
};

function ddm(input: DdmInput) {
  const result = computeDdm(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeDdm — the model", () => {
  it("grows D0 once, then divides by the spread", () => {
    // D1 = 2.000 × 1,05 = 2.100. Value = 2.100 ÷ 0,07 = 30.000.
    const result = ddm(BASE);
    expect(result.nextDividend).toBeCloseTo(2_100, 8);
    expect(result.intrinsicValue).toBeCloseTo(30_000, 6);
  });

  it("uses D1 as given when told it is next year's", () => {
    // The factor of (1 + g) that separates the two conventions.
    const asNext = ddm({ ...BASE, dividend: 2_000, dividendIsNext: true });
    expect(asNext.nextDividend).toBe(2_000);
    expect(asNext.intrinsicValue).toBeCloseTo(2_000 / 0.07, 6);
    expect(asNext.intrinsicValue).not.toBeCloseTo(30_000, 0);
  });

  it("splits the required return into yield and growth", () => {
    const result = ddm(BASE);
    expect(result.dividendYieldPercent).toBeCloseTo(7, 8);
    expect(result.capitalGainsYieldPercent).toBeCloseTo(5, 10);
    // By construction the two must add to the required return.
    expect(result.totalReturnPercent).toBeCloseTo(12, 8);
  });

  it("rises steeply as growth approaches the required return", () => {
    let previous = 0;
    for (const growthPercent of [0, 4, 8, 10, 11, 11.9]) {
      const value = ddm({ ...BASE, growthPercent }).intrinsicValue;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
    // The last one is enormous, which is the model's known weakness.
    expect(previous).toBeGreaterThan(2_000_000);
  });

  it("handles a shrinking dividend", () => {
    const result = ddm({ ...BASE, growthPercent: -3 });
    expect(result.nextDividend).toBeCloseTo(1_940, 8);
    expect(result.intrinsicValue).toBeCloseTo(1_940 / 0.15, 6);
    expect(result.capitalGainsYieldPercent).toBeCloseTo(-3, 10);
  });

  it("refuses growth at or above the required return", () => {
    // The formula would return a negative number that is not a price.
    expect(computeDdm({ ...BASE, growthPercent: 12 })).toBeNull();
    expect(computeDdm({ ...BASE, growthPercent: 15 })).toBeNull();
    expect(computeDdm({ ...BASE, growthPercent: 11.999 })).not.toBeNull();
  });
});

describe("computeDdm — against a market price", () => {
  it("calls a cheap price undervalued", () => {
    const result = ddm({ ...BASE, price: 25_000 });
    expect(result.verdict).toBe("undervalued");
    expect(result.premiumDiscountPercent).toBeCloseTo(-16.666_666_67, 6);
  });

  it("calls a dear price overvalued", () => {
    const result = ddm({ ...BASE, price: 36_000 });
    expect(result.verdict).toBe("overvalued");
    expect(result.premiumDiscountPercent).toBeCloseTo(20, 8);
  });

  it("calls the model's own value fair", () => {
    const result = ddm({ ...BASE, price: 30_000 });
    expect(result.verdict).toBe("fair");
    expect(result.premiumDiscountPercent).toBeCloseTo(0, 6);
  });

  it("uses a half-percent band rather than exact equality", () => {
    // `intrinsicValue` is a division, so it lands on 30000.000000000004 and a
    // strict `===` would make the fair verdict unreachable. The band is also
    // the honest resolution of a model built on estimates.
    expect(ddm({ ...BASE, price: 30_120 }).verdict).toBe("fair");
    expect(ddm({ ...BASE, price: 29_880 }).verdict).toBe("fair");
    expect(ddm({ ...BASE, price: 30_200 }).verdict).toBe("overvalued");
    expect(ddm({ ...BASE, price: 29_800 }).verdict).toBe("undervalued");
  });

  it("leaves the price block null when no price was given", () => {
    const result = ddm(BASE);
    expect(result.price).toBeNull();
    expect(result.verdict).toBeNull();
    expect(result.premiumDiscountPercent).toBeNull();
    expect(result.impliedGrowthPercent).toBeNull();
    expect(result.impliedReturnPercent).toBeNull();
  });
});

describe("computeDdm — inverting the model", () => {
  it("recovers the growth rate from its own value", () => {
    // Feed the model's value back as the price and the implied growth must
    // be the growth that produced it.
    const value = ddm(BASE).intrinsicValue;
    const inverted = ddm({ ...BASE, price: value });
    expect(inverted.impliedGrowthPercent).toBeCloseTo(5, 6);
  });

  it("recovers the required return from its own value", () => {
    const value = ddm(BASE).intrinsicValue;
    const inverted = ddm({ ...BASE, price: value });
    expect(inverted.impliedReturnPercent).toBeCloseTo(12, 6);
  });

  it("inverts correctly in the D1 convention too", () => {
    const asNext = { ...BASE, dividendIsNext: true };
    const value = ddm(asNext).intrinsicValue;
    const inverted = ddm({ ...asNext, price: value });
    expect(inverted.impliedGrowthPercent).toBeCloseTo(5, 6);
    expect(inverted.impliedReturnPercent).toBeCloseTo(12, 6);
  });

  it("implies higher growth at a higher price", () => {
    const cheap = ddm({ ...BASE, price: 20_000 }).impliedGrowthPercent!;
    const dear = ddm({ ...BASE, price: 60_000 }).impliedGrowthPercent!;
    expect(dear).toBeGreaterThan(cheap);
  });

  it("implies a lower return at a higher price", () => {
    const cheap = ddm({ ...BASE, price: 20_000 }).impliedReturnPercent!;
    const dear = ddm({ ...BASE, price: 60_000 }).impliedReturnPercent!;
    expect(dear).toBeLessThan(cheap);
  });

  it("round-trips implied growth back through the model", () => {
    // The strongest check on the closed-form inversion: value the share at
    // the growth the price implies and the value must be the price.
    const price = 45_000;
    const implied = ddm({ ...BASE, price }).impliedGrowthPercent!;
    const revalued = ddm({ ...BASE, growthPercent: implied });
    expect(revalued.intrinsicValue).toBeCloseTo(price, 4);
  });
});

describe("computeDdm — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeDdm({ ...BASE, dividend: 0 })).toBeNull();
    expect(computeDdm({ ...BASE, dividend: -1 })).toBeNull();
    expect(computeDdm({ ...BASE, price: 0 })).toBeNull();
    expect(computeDdm({ ...BASE, price: -1 })).toBeNull();
    expect(computeDdm({ ...BASE, dividend: Number.NaN })).toBeNull();
    expect(computeDdm({ ...BASE, growthPercent: Number.NaN })).toBeNull();
    expect(
      computeDdm({ ...BASE, requiredReturnPercent: Number.NaN }),
    ).toBeNull();
  });
});
