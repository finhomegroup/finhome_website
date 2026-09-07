import { describe, it, expect } from "vitest";
import { computeBond, type BondInput } from "@/lib/calc/bond";

// A 100 triệu face bond, 8%/năm coupon paid semiannually, 5 years to run.
const BASE: BondInput = {
  faceValue: 100_000_000,
  couponRatePercent: 8,
  years: 5,
  paymentsPerYear: 2,
  yieldPercent: 10,
};

function bond(input: BondInput) {
  const result = computeBond(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeBond — the coupon and the periods", () => {
  it("splits the annual coupon across the periods", () => {
    const result = bond(BASE);
    expect(result.couponPerYear).toBeCloseTo(8_000_000, 6);
    expect(result.couponPerPeriod).toBeCloseTo(4_000_000, 6);
    expect(result.periods).toBe(10);
  });

  it("pays the whole coupon once a year when told to", () => {
    const result = bond({ ...BASE, paymentsPerYear: 1 });
    expect(result.couponPerPeriod).toBeCloseTo(8_000_000, 6);
    expect(result.periods).toBe(5);
  });

  it("sums the undiscounted cash flows", () => {
    expect(bond(BASE).totalCashFlows).toBeCloseTo(140_000_000, 6);
  });
});

describe("computeBond — price from yield", () => {
  it("matches a hand-computed reference", () => {
    // 4 triệu × annuity(5%, 10) + 100 triệu / 1,05^10
    const annuity = (1 - 1.05 ** -10) / 0.05;
    const expected = 4_000_000 * annuity + 100_000_000 / 1.05 ** 10;
    expect(bond(BASE).price).toBeCloseTo(expected, 4);
    expect(bond(BASE).price).toBeCloseTo(92_278_265, 0);
  });

  it("prices at par when the yield equals the coupon", () => {
    const result = bond({ ...BASE, yieldPercent: 8 });
    expect(result.price).toBeCloseTo(100_000_000, 4);
    expect(result.pricePercentOfFace).toBeCloseTo(100, 6);
    expect(result.quote).toBe("par");
  });

  it("trades at a discount when the yield exceeds the coupon", () => {
    const result = bond(BASE);
    expect(result.price).toBeLessThan(100_000_000);
    expect(result.quote).toBe("discount");
  });

  it("trades at a premium when the yield is below the coupon", () => {
    const result = bond({ ...BASE, yieldPercent: 6 });
    expect(result.price).toBeGreaterThan(100_000_000);
    expect(result.quote).toBe("premium");
  });

  it("falls monotonically as the yield rises", () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const yieldPercent of [2, 4, 6, 8, 10, 15, 25]) {
      const price = bond({ ...BASE, yieldPercent }).price;
      expect(price).toBeLessThan(previous);
      previous = price;
    }
  });

  it("is the undiscounted total at a 0% yield", () => {
    expect(bond({ ...BASE, yieldPercent: 0 }).price).toBeCloseTo(
      140_000_000,
      6,
    );
  });

  it("prices a zero-coupon bond off the face value alone", () => {
    const result = bond({ ...BASE, couponRatePercent: 0 });
    expect(result.couponPerPeriod).toBe(0);
    expect(result.price).toBeCloseTo(100_000_000 / 1.05 ** 10, 4);
    expect(result.currentYieldPercent).toBe(0);
  });
});

describe("computeBond — yield from price", () => {
  it("inverts the pricing exactly", () => {
    // The round trip that ties the two modes together.
    const priced = bond(BASE);
    const solved = bond({
      ...BASE,
      yieldPercent: undefined,
      price: priced.price,
    });
    expect(solved.yieldPercent).toBeCloseTo(10, 6);
  });

  it("returns the coupon rate at par", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 100_000_000,
    });
    expect(result.yieldPercent).toBeCloseTo(8, 6);
  });

  it("gives a yield above the coupon at a discount", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 90_000_000,
    });
    expect(result.yieldPercent!).toBeGreaterThan(8);
    expect(result.quote).toBe("discount");
  });

  it("gives a yield below the coupon at a premium", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 110_000_000,
    });
    expect(result.yieldPercent!).toBeLessThan(8);
    expect(result.quote).toBe("premium");
  });

  it("round-trips at every price it is given", () => {
    for (const price of [70_000_000, 90_000_000, 100_000_000, 130_000_000]) {
      const solved = bond({ ...BASE, yieldPercent: undefined, price });
      const repriced = bond({ ...BASE, yieldPercent: solved.yieldPercent! });
      expect(repriced.price).toBeCloseTo(price, 0);
    }
  });
});

describe("computeBond — the three yields are different numbers", () => {
  it("keeps current yield between the coupon rate and the YTM at a discount", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 90_000_000,
    });
    expect(result.currentYieldPercent!).toBeGreaterThan(8);
    expect(result.currentYieldPercent!).toBeLessThan(result.yieldPercent!);
  });

  it("computes current yield off the price, not the face value", () => {
    const result = bond(BASE);
    expect(result.currentYieldPercent).toBeCloseTo(
      (8_000_000 / result.price) * 100,
      8,
    );
  });

  it("reports an effective yield above the nominal one when paid twice a year", () => {
    const result = bond(BASE);
    // (1,05)² − 1 = 10,25%, not 10%.
    expect(result.effectiveYieldPercent).toBeCloseTo(10.25, 8);
    expect(result.effectiveYieldPercent!).toBeGreaterThan(
      result.yieldPercent!,
    );
  });

  it("has the two coincide on an annual-pay bond", () => {
    const result = bond({ ...BASE, paymentsPerYear: 1 });
    expect(result.effectiveYieldPercent).toBeCloseTo(10, 8);
  });
});

describe("computeBond — duration", () => {
  it("is shorter than the term for a coupon bond", () => {
    const result = bond(BASE);
    expect(result.macaulayDurationYears!).toBeLessThan(5);
    expect(result.macaulayDurationYears!).toBeGreaterThan(3);
  });

  it("equals the term exactly for a zero-coupon bond", () => {
    // The defining property, and the check that the period-to-year division
    // is right: getting it wrong would report 10 years, not 5.
    const result = bond({ ...BASE, couponRatePercent: 0 });
    expect(result.macaulayDurationYears).toBeCloseTo(5, 8);
  });

  it("keeps modified duration just below Macaulay", () => {
    const result = bond(BASE);
    expect(result.modifiedDurationYears!).toBeLessThan(
      result.macaulayDurationYears!,
    );
    expect(result.modifiedDurationYears).toBeCloseTo(
      result.macaulayDurationYears! / 1.05,
      8,
    );
  });

  it("lengthens with the term and shortens with the coupon", () => {
    const short = bond({ ...BASE, years: 2 }).macaulayDurationYears!;
    const long = bond({ ...BASE, years: 20 }).macaulayDurationYears!;
    expect(long).toBeGreaterThan(short);
    const lowCoupon = bond({ ...BASE, couponRatePercent: 2 })
      .macaulayDurationYears!;
    const highCoupon = bond({ ...BASE, couponRatePercent: 15 })
      .macaulayDurationYears!;
    expect(lowCoupon).toBeGreaterThan(highCoupon);
  });

  it("estimates the price fall for a one-point rise in yield", () => {
    const result = bond(BASE);
    expect(result.priceChangePerPointRise!).toBeLessThan(0);
    // Duration is a first-order estimate, so it should be within a few
    // percent of repricing at the higher yield — and slightly overstate the
    // fall, because the price/yield curve is convex.
    const actual =
      bond({ ...BASE, yieldPercent: 11 }).price - result.price;
    expect(result.priceChangePerPointRise!).toBeLessThan(actual);
    expect(Math.abs(result.priceChangePerPointRise! - actual)).toBeLessThan(
      Math.abs(actual) * 0.05,
    );
  });
});

describe("computeBond — rejected inputs", () => {
  it("rejects a term that is not whole coupon periods", () => {
    // Pricing between coupon dates needs accrued interest, which is out of
    // scope — reject rather than round.
    expect(
      computeBond({ ...BASE, years: 5.25, paymentsPerYear: 2 }),
    ).toBeNull();
    // …but half-years are fine on a semiannual bond.
    expect(
      computeBond({ ...BASE, years: 5.5, paymentsPerYear: 2 }),
    ).not.toBeNull();
  });

  it("returns null when neither a yield nor a price is given", () => {
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: undefined }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeBond({ ...BASE, faceValue: 0 })).toBeNull();
    expect(computeBond({ ...BASE, faceValue: -1 })).toBeNull();
    expect(computeBond({ ...BASE, couponRatePercent: -1 })).toBeNull();
    expect(computeBond({ ...BASE, years: 0 })).toBeNull();
    expect(computeBond({ ...BASE, paymentsPerYear: 0 })).toBeNull();
    expect(computeBond({ ...BASE, paymentsPerYear: 2.5 })).toBeNull();
    expect(computeBond({ ...BASE, yieldPercent: Number.NaN })).toBeNull();
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: 0 }),
    ).toBeNull();
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: -1 }),
    ).toBeNull();
    expect(computeBond({ ...BASE, faceValue: Number.NaN })).toBeNull();
  });

  it("handles a long-dated bond", () => {
    const result = bond({ ...BASE, years: 30 });
    expect(result.periods).toBe(60);
    expect(result.price).toBeGreaterThan(0);
    expect(result.macaulayDurationYears!).toBeGreaterThan(10);
  });
});
