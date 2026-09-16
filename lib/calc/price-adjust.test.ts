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

/**
 * Original row 60: successive discounts do not add.
 *
 * Reference values computed by hand: on a 100 triệu list price, 20% leaves
 * 80 triệu and a further 10% of THAT leaves 72 triệu — 28% off, not 30%. With
 * a 10% tax added on top of the discounted net, the final price is
 * 79,2 triệu. The combined figure carries float residue
 * (1 − 0,8 × 0,9 = 0,27999999999999993), so it is compared with a tolerance
 * rather than pinned exactly.
 */
describe("adjustPrice — two successive percentage discounts", () => {
  const SUCCESSIVE = {
    listPrice: 100_000_000,
    discountPercent: 20,
    secondDiscountPercent: 10,
    taxPercent: 10,
    taxIncluded: false,
  };

  it("applies the second percentage to what the first left", () => {
    const result = adjustPrice(SUCCESSIVE)!;
    expect(result.firstPercentOff).toBe(20_000_000);
    // 10% of 80 triệu, NOT 10% of 100 triệu.
    expect(result.secondPercentOff).toBe(8_000_000);
    expect(result.netPrice).toBe(72_000_000);
  });

  it("reports 28% off, and what the naive sum would have claimed", () => {
    const result = adjustPrice(SUCCESSIVE)!;
    expect(result.combinedDiscountPercent).toBeCloseTo(28, 10);
    expect(result.naiveSumPercent).toBe(30);
    // The gap is the lesson, and it is two real percentage points of a
    // 100 triệu price — 2 triệu the reader would have expected and not got.
    expect(result.naiveSumPercent - result.combinedDiscountPercent).toBeCloseTo(
      2,
      10,
    );
  });

  it("prices the whole purchase, tax added after the discounts", () => {
    const result = adjustPrice(SUCCESSIVE)!;
    expect(result.tax).toBeCloseTo(7_200_000, 6);
    expect(result.finalPrice).toBeCloseTo(79_200_000, 6);
    expect(result.discount).toBe(28_000_000);
  });

  it("is order-independent between the two percentages", () => {
    // 0,8 × 0,9 and 0,9 × 0,8 are the same number, so a shop applying them
    // the other way round reaches the same total. Worth pinning because the
    // FIXED amount is NOT order-independent, which is the next test.
    const forwards = adjustPrice(SUCCESSIVE)!;
    const backwards = adjustPrice({
      ...SUCCESSIVE,
      discountPercent: 10,
      secondDiscountPercent: 20,
    })!;
    expect(backwards.finalPrice).toBeCloseTo(forwards.finalPrice, 6);
    expect(backwards.combinedDiscountPercent).toBeCloseTo(
      forwards.combinedDiscountPercent,
      10,
    );
    // ...but the individual lines differ, so the ledger is not the same.
    expect(backwards.firstPercentOff).not.toBe(forwards.firstPercentOff);
  });

  it("takes the fixed amount after BOTH percentages", () => {
    const result = adjustPrice({
      listPrice: 1_000_000,
      discountPercent: 20,
      secondDiscountPercent: 10,
      discountAmount: 50_000,
      taxPercent: 0,
    })!;
    // 1.000.000 → 800.000 → 720.000 → 670.000.
    expect(result.finalPrice).toBe(670_000);
    expect(result.discount).toBe(330_000);
  });

  it("collapses to the single-discount behaviour when the second is zero", () => {
    const one = adjustPrice({ ...BASE, discountPercent: 20 })!;
    const two = adjustPrice({
      ...BASE,
      discountPercent: 20,
      secondDiscountPercent: 0,
    })!;
    expect(two.finalPrice).toBe(one.finalPrice);
    expect(two.secondPercentOff).toBe(0);
    // With at most one percentage there is no gap to teach.
    expect(two.combinedDiscountPercent).toBeCloseTo(two.naiveSumPercent, 10);
  });

  it("rejects a second percentage above 100", () => {
    expect(
      adjustPrice({ ...BASE, secondDiscountPercent: 101 }),
    ).toBeNull();
    expect(
      adjustPrice({ ...BASE, secondDiscountPercent: -1 }),
    ).toBeNull();
  });

  it("still allows two 100% discounts, which is free rather than negative", () => {
    // 100% then 100% of nothing is still 0, not a refund.
    const result = adjustPrice({
      listPrice: 500_000,
      discountPercent: 100,
      secondDiscountPercent: 100,
      taxPercent: 0,
    })!;
    expect(result.finalPrice).toBe(0);
    expect(result.secondPercentOff).toBe(0);
  });
});

describe("adjustPrice — the adding-up ledger", () => {
  it("walks the steps in order, each line carrying the running balance", () => {
    const result = adjustPrice({
      listPrice: 100_000_000,
      discountPercent: 20,
      secondDiscountPercent: 10,
      discountAmount: 2_000_000,
      taxPercent: 10,
      taxIncluded: false,
    })!;
    expect(result.ledger).toEqual([
      { key: "list", delta: 100_000_000, balance: 100_000_000 },
      { key: "firstPercent", delta: -20_000_000, balance: 80_000_000 },
      { key: "secondPercent", delta: -8_000_000, balance: 72_000_000 },
      { key: "fixed", delta: -2_000_000, balance: 70_000_000 },
      { key: "taxAdded", delta: 7_000_000, balance: 77_000_000 },
    ]);
  });

  it("ends on the price actually paid", () => {
    // The guard that matters: a ledger whose last balance is not the headline
    // figure is a table contradicting the result beside it.
    for (const over of [
      { discountPercent: 20, secondDiscountPercent: 10 },
      { discountPercent: 0, secondDiscountPercent: 0 },
      { discountAmount: 50_000 },
      { taxIncluded: false as const },
      { taxPercent: 0 },
    ]) {
      const result = adjustPrice({ ...BASE, ...over })!;
      expect(result.ledger.at(-1)!.balance).toBeCloseTo(result.finalPrice, 6);
    }
  });

  it("omits a step that did not happen", () => {
    const plain = adjustPrice({
      listPrice: 1_000_000,
      discountPercent: 0,
      secondDiscountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
    })!;
    // Only the starting line: no "− 0 ₫" reductions and no tax line.
    expect(plain.ledger).toEqual([
      { key: "list", delta: 1_000_000, balance: 1_000_000 },
    ]);
  });

  it("names tax already inside the price with a delta of zero", () => {
    // In tax-included mode the tax is not a step: it is a part of a number
    // already counted. A negative delta here would double-count it.
    const result = adjustPrice({
      listPrice: 1_000_000,
      discountPercent: 20,
      taxPercent: 10,
      taxIncluded: true,
    })!;
    const taxLine = result.ledger.find((step) => step.key === "taxInside")!;
    expect(taxLine.delta).toBe(0);
    expect(taxLine.balance).toBe(result.finalPrice);
    expect(result.ledger.some((step) => step.key === "taxAdded")).toBe(false);
  });
});
