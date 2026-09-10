import { describe, it, expect } from "vitest";
import { adjustPrice, type PriceAdjustInput } from "@/lib/calc/price-adjust";

const BASE: PriceAdjustInput = {
  listPrice: 1_000_000,
  discountPercent: 20,
  taxPercent: 10,
  taxIncluded: true,
};

function price(input: PriceAdjustInput) {
  const result = adjustPrice(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("adjustPrice — tax already in the label (the Vietnamese norm)", () => {
  it("takes the discount off the label price and pays exactly that", () => {
    const result = price(BASE);
    expect(result.discount).toBeCloseTo(200_000, 6);
    expect(result.finalPrice).toBeCloseTo(800_000, 6);
  });

  it("extracts the tax from inside what you pay, rather than adding it", () => {
    // 800.000 at 10% VAT is 727.272,73 net + 72.727,27 tax.
    const result = price(BASE);
    expect(result.netPrice).toBeCloseTo(727_272.727_27, 4);
    expect(result.tax).toBeCloseTo(72_727.272_73, 4);
    expect(result.netPrice + result.tax).toBeCloseTo(result.finalPrice, 6);
  });

  it("never pays more than the label", () => {
    // The bug this branch exists to prevent: adding 10% on top of a shelf
    // price that already includes it, i.e. charging 880.000 for a 800.000 buy.
    const result = price(BASE);
    expect(result.finalPrice).toBeLessThan(BASE.listPrice);
    expect(result.finalPrice).toBeCloseTo(800_000, 6);
  });

  it("measures the saving against the label price", () => {
    const result = price(BASE);
    expect(result.priceWithoutDiscount).toBe(1_000_000);
    expect(result.saving).toBeCloseTo(200_000, 6);
    expect(result.savingPercent).toBeCloseTo(20, 10);
  });
});

describe("adjustPrice — tax added at the till", () => {
  const excluded: PriceAdjustInput = { ...BASE, taxIncluded: false };

  it("adds the tax after the discount", () => {
    const result = price(excluded);
    expect(result.netPrice).toBeCloseTo(800_000, 6);
    expect(result.tax).toBeCloseTo(80_000, 6);
    expect(result.finalPrice).toBeCloseTo(880_000, 6);
  });

  it("compares against the undiscounted price WITH tax", () => {
    const result = price(excluded);
    expect(result.priceWithoutDiscount).toBeCloseTo(1_100_000, 6);
    expect(result.saving).toBeCloseTo(220_000, 6);
    // The saving percentage is unchanged — tax scales both sides equally.
    expect(result.savingPercent).toBeCloseTo(20, 10);
  });

  it("differs from the included branch by exactly the tax rate", () => {
    const included = price(BASE);
    const added = price(excluded);
    expect(added.finalPrice).toBeCloseTo(included.finalPrice * 1.1, 6);
  });
});

describe("adjustPrice — the two discounts", () => {
  it("applies the percentage first, then the fixed amount", () => {
    // 20% off 1.000.000 is 800.000, less a 50.000 voucher is 750.000.
    const result = price({ ...BASE, discountAmount: 50_000 });
    expect(result.discount).toBeCloseTo(250_000, 6);
    expect(result.finalPrice).toBeCloseTo(750_000, 6);
  });

  it("is not the same as the reverse order", () => {
    // Voucher-then-percentage would give (1.000.000 − 50.000) × 0,8 = 760.000.
    const result = price({ ...BASE, discountAmount: 50_000 });
    expect(result.finalPrice).not.toBeCloseTo(760_000, 0);
  });

  it("works with only a fixed amount", () => {
    const result = price({
      ...BASE,
      discountPercent: 0,
      discountAmount: 150_000,
    });
    expect(result.discount).toBe(150_000);
    expect(result.finalPrice).toBeCloseTo(850_000, 6);
  });

  it("handles no discount at all", () => {
    const result = price({ ...BASE, discountPercent: 0 });
    expect(result.discount).toBe(0);
    expect(result.saving).toBe(0);
    expect(result.savingPercent).toBe(0);
    expect(result.finalPrice).toBe(1_000_000);
  });

  it("handles 100% off", () => {
    const result = price({ ...BASE, discountPercent: 100 });
    expect(result.finalPrice).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.savingPercent).toBeCloseTo(100, 10);
  });

  it("handles a tax-free purchase", () => {
    const result = price({ ...BASE, taxPercent: 0 });
    expect(result.tax).toBe(0);
    expect(result.netPrice).toBeCloseTo(800_000, 6);
    expect(result.finalPrice).toBeCloseTo(800_000, 6);
  });

  it("handles the 8% rate as well as 10%", () => {
    const result = price({ ...BASE, taxPercent: 8 });
    expect(result.finalPrice).toBeCloseTo(800_000, 6);
    expect(result.netPrice).toBeCloseTo(800_000 / 1.08, 4);
  });
});

describe("adjustPrice — rejected inputs", () => {
  it("rejects a discount bigger than the price rather than clamping", () => {
    expect(
      adjustPrice({ ...BASE, discountAmount: 900_000 }),
    ).toBeNull();
    expect(
      adjustPrice({ ...BASE, discountPercent: 0, discountAmount: 1_000_001 }),
    ).toBeNull();
    // Exactly the price is fine: that is a giveaway, not a debt.
    expect(
      adjustPrice({ ...BASE, discountPercent: 0, discountAmount: 1_000_000 }),
    ).not.toBeNull();
  });

  it("rejects a discount above 100%", () => {
    expect(adjustPrice({ ...BASE, discountPercent: 101 })).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(adjustPrice({ ...BASE, listPrice: 0 })).toBeNull();
    expect(adjustPrice({ ...BASE, listPrice: -1 })).toBeNull();
    expect(adjustPrice({ ...BASE, discountPercent: -1 })).toBeNull();
    expect(adjustPrice({ ...BASE, discountAmount: -1 })).toBeNull();
    expect(adjustPrice({ ...BASE, taxPercent: -1 })).toBeNull();
    expect(adjustPrice({ ...BASE, listPrice: Number.NaN })).toBeNull();
  });
});
