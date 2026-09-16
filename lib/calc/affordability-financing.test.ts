import { describe, it, expect } from "vitest";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";

/**
 * The financing envelope: price, loan, cash and purchase costs must reconcile,
 * with non-negative equity, in every corner.
 *
 * The defect this file exists for. `maxPrice` used to be
 * `(maxLoan + usableCash) / (1 + costRate)` with no financing or cash
 * constraint at all. With 50 triệu of income, no debts, a 0% rate, 240 months,
 * NO CASH and a 5% purchase-cost rate it reported:
 *
 *   paymentSupportedLoan 4,8 tỷ · maxPrice 4,571428571 tỷ
 *   purchaseCosts 228,571429 triệu · cashToPrice −228,571429 triệu
 *
 * i.e. −228 triệu of equity, which the chart then hid by dropping the negative
 * segment. Hiding it was not the fix. The envelope is now a closed form with
 * two ceilings and equity is non-negative by construction.
 *
 * The identity every case below asserts:
 *
 *     cashToPrice + purchaseCosts = usableCash   (when cash is the binding side)
 *     maxLoan + cashToPrice       = maxPrice     (always)
 *     maxLoan                     ≤ paymentSupportedLoan
 *     maxLoan                     ≤ assumedMaxLtv × maxPrice
 *     cashToPrice                 ≥ 0
 */

const BASE: AffordabilityInput = {
  monthlyIncome: 50_000_000,
  monthlyDebts: 0,
  annualRatePercent: 0,
  termMonths: 240,
  downPayment: 0,
};

function afford(input: AffordabilityInput) {
  const result = computeAffordability(input);
  expect(result).not.toBeNull();
  return result!;
}

/** Every structural identity the envelope must satisfy, in one place. */
function expectCoherent(result: ReturnType<typeof afford>) {
  // The price is made of the loan plus the cash that reached it.
  expect(result.maxLoan + result.cashToPrice).toBeCloseTo(result.maxPrice, 4);
  // Equity is never negative.
  expect(result.cashToPrice).toBeGreaterThanOrEqual(0);
  // Neither bound is exceeded.
  expect(result.maxLoan).toBeLessThanOrEqual(
    result.paymentSupportedLoan + 1e-6,
  );
  expect(result.maxLoan).toBeLessThanOrEqual(
    (result.assumedMaxLtvPercent / 100) * result.maxPrice + 1e-6,
  );
  // The cash is spent once, on costs and equity, and never over-spent.
  expect(result.cashToPrice + result.purchaseCosts).toBeLessThanOrEqual(
    result.usableCash + 1e-6,
  );
  // Nothing is non-finite.
  for (const value of [
    result.maxPrice,
    result.maxLoan,
    result.cashToPrice,
    result.purchaseCosts,
    result.paymentSupportedLoan,
  ]) {
    expect(Number.isFinite(value)).toBe(true);
  }
}

describe("the reported defect case", () => {
  // 50 triệu income, no debts, 40% housing ratio, 0% rate, 240 months,
  // ZERO cash, 5% purchase costs.
  const result = afford({ ...BASE, purchaseCostPercent: 5 });

  it("still reports the full monthly borrowing capacity", () => {
    // 40% of 50 triệu over 240 months at 0% is exactly 4,8 tỷ. The capacity is
    // real and is still reported — it is the PURCHASE that is not feasible.
    expect(result.affordablePrincipalInterest).toBeCloseTo(20_000_000, 6);
    expect(result.paymentSupportedLoan).toBeCloseTo(4_800_000_000, 4);
  });

  it("no longer reports a price the buyer cannot complete", () => {
    // Was 4,571428571 tỷ with −228 triệu of equity.
    expect(result.maxPrice).toBe(0);
    expect(result.maxLoan).toBe(0);
    expect(result.cashToPrice).toBe(0);
    expect(result.purchaseCosts).toBe(0);
  });

  it("says why, instead of leaving a contradiction on the chart", () => {
    expect(result.financingBlocked).toBe(true);
    expect(result.priceBinding).toBe("financing");
    // And it is NOT `noRoom`: the monthly budget is fine. Conflating the two
    // would tell the buyer to cut spending when the problem is the deposit.
    expect(result.noRoom).toBe(false);
  });

  it("is coherent", () => {
    expectCoherent(result);
  });
});

describe("zero cash", () => {
  it("is feasible when no purchase costs are modelled and 100% is assumed", () => {
    // The degenerate but legitimate case: the assumption is that the whole
    // price can be financed and there are no costs, so no cash is needed.
    const result = afford(BASE);
    expect(result.assumedMaxLtvPercent).toBe(100);
    expect(result.maxPrice).toBeCloseTo(4_800_000_000, 4);
    expect(result.maxLoan).toBeCloseTo(4_800_000_000, 4);
    expect(result.cashToPrice).toBeCloseTo(0, 6);
    expect(result.financingBlocked).toBe(false);
    expectCoherent(result);
  });

  it("is blocked as soon as any deposit is assumed to be required", () => {
    const result = afford({ ...BASE, assumedMaxLtvPercent: 70 });
    expect(result.maxPrice).toBe(0);
    expect(result.financingBlocked).toBe(true);
    expectCoherent(result);
  });
});

describe("low cash against purchase costs", () => {
  const result = afford({
    ...BASE,
    downPayment: 100_000_000,
    purchaseCostPercent: 5,
  });

  it("caps the price at what the cash can actually fund", () => {
    // slack = 1 + 0,05 − 1 = 0,05, so the price ceiling is 100 triệu / 0,05
    // = 2 tỷ — far below the 4,8 tỷ the payment could service.
    expect(result.maxPrice).toBeCloseTo(2_000_000_000, 4);
    expect(result.priceBinding).toBe("financing");
    expect(result.maxLoan).toBeLessThan(result.paymentSupportedLoan);
  });

  it("spends the cash exactly once, entirely on the costs", () => {
    // At a 100% financing assumption every đồng of cash goes to the costs and
    // the equity is zero — which is coherent, not hidden.
    expect(result.purchaseCosts).toBeCloseTo(100_000_000, 4);
    expect(result.cashToPrice).toBeCloseTo(0, 4);
    expect(result.cashToPrice + result.purchaseCosts).toBeCloseTo(
      result.usableCash,
      4,
    );
    expectCoherent(result);
  });
});

describe("a reserve larger than the cash", () => {
  const result = afford({
    ...BASE,
    downPayment: 100_000_000,
    cashReserve: 200_000_000,
    purchaseCostPercent: 3,
  });

  it("leaves no usable cash and blocks the purchase", () => {
    expect(result.usableCash).toBe(0);
    expect(result.maxPrice).toBe(0);
    expect(result.financingBlocked).toBe(true);
    expectCoherent(result);
  });

  it("never lets the reserve push the cash negative", () => {
    expect(result.usableCash).toBeGreaterThanOrEqual(0);
  });
});

describe("the 100% financing assumption", () => {
  it("leaves the financing bound inert when no costs are modelled", () => {
    // slack is exactly 0 here, which is the one case where the financing bound
    // cannot bind. It must not produce a division by zero or an Infinity.
    const result = afford({ ...BASE, downPayment: 600_000_000 });
    expect(result.priceBinding).toBe("payment");
    expect(result.maxPrice).toBeCloseTo(4_800_000_000 + 600_000_000, 4);
    expect(result.cashToPrice).toBeCloseTo(600_000_000, 4);
    expectCoherent(result);
  });

  it("is the default, so the tool asserts no deposit requirement", () => {
    // The default must not encode a claim about what any bank requires.
    expect(afford(BASE).assumedMaxLtvPercent).toBe(100);
  });
});

describe("a cash-only buyer", () => {
  const result = afford({
    ...BASE,
    monthlyDebts: 60_000_000,
    downPayment: 3_000_000_000,
    purchaseCostPercent: 5,
  });

  it("supports no loan but still names a price", () => {
    expect(result.paymentSupportedLoan).toBe(0);
    expect(result.noRoom).toBe(true);
    expect(result.maxLoan).toBeCloseTo(0, 6);
    // 3 tỷ of cash at a 5% cost rate buys 3/1,05 ≈ 2,857 tỷ.
    expect(result.maxPrice).toBeCloseTo(3_000_000_000 / 1.05, 4);
    expectCoherent(result);
  });

  it("funds the costs from the same cash, once", () => {
    expect(result.cashToPrice + result.purchaseCosts).toBeCloseTo(
      3_000_000_000,
      4,
    );
    expect(result.downPaymentPercent).toBeCloseTo(100, 6);
  });
});

describe("a deposit requirement the buyer was quoted", () => {
  const result = afford({
    ...BASE,
    downPayment: 600_000_000,
    assumedMaxLtvPercent: 70,
    purchaseCostPercent: 3,
  });

  it("binds the price on the cash, not on the payment", () => {
    // slack = 1 + 0,03 − 0,7 = 0,33, so 600 triệu / 0,33 ≈ 1,818 tỷ.
    expect(result.maxPrice).toBeCloseTo(600_000_000 / 0.33, 3);
    expect(result.priceBinding).toBe("financing");
  });

  it("holds the loan at exactly the assumed share of the price", () => {
    expect(result.maxLoan).toBeCloseTo(0.7 * result.maxPrice, 3);
    expect(result.cashToPrice).toBeCloseTo(0.3 * result.maxPrice, 3);
    expectCoherent(result);
  });

  it("echoes the assumption back so the page can label it as one", () => {
    expect(result.assumedMaxLtvPercent).toBe(70);
  });
});

describe("a zero financing assumption", () => {
  it("is the same as buying with cash alone", () => {
    const noFinancing = afford({
      ...BASE,
      downPayment: 1_000_000_000,
      assumedMaxLtvPercent: 0,
    });
    expect(noFinancing.maxLoan).toBeCloseTo(0, 6);
    expect(noFinancing.maxPrice).toBeCloseTo(1_000_000_000, 4);
    expectCoherent(noFinancing);
  });
});

describe("which ceiling binds", () => {
  it("names the payment when cash is plentiful", () => {
    const result = afford({
      ...BASE,
      downPayment: 10_000_000_000,
      purchaseCostPercent: 5,
    });
    expect(result.priceBinding).toBe("payment");
    expectCoherent(result);
  });

  it("names financing when cash is the constraint", () => {
    const result = afford({
      ...BASE,
      downPayment: 50_000_000,
      purchaseCostPercent: 5,
    });
    expect(result.priceBinding).toBe("financing");
    expectCoherent(result);
  });

  it("stays coherent across a sweep of cash and cost rates", () => {
    // docs §8: "if a property depends on which side of a root you land, sweep
    // the input that decides it". The binding side flips inside this sweep.
    for (const cash of [0, 50e6, 200e6, 600e6, 2e9, 10e9]) {
      for (const costPercent of [0, 1, 3, 5, 10]) {
        for (const ltv of [0, 50, 70, 80, 100]) {
          const result = afford({
            ...BASE,
            downPayment: cash,
            purchaseCostPercent: costPercent,
            assumedMaxLtvPercent: ltv,
          });
          expectCoherent(result);
        }
      }
    }
  });
});

describe("rejections around the new inputs", () => {
  it("refuses an assumed LTV outside 0–100", () => {
    expect(
      computeAffordability({ ...BASE, assumedMaxLtvPercent: 101 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...BASE, assumedMaxLtvPercent: -1 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...BASE, assumedMaxLtvPercent: Number.NaN }),
    ).toBeNull();
  });

  it("refuses a purchase-cost rate that cannot be funded", () => {
    expect(
      computeAffordability({ ...BASE, purchaseCostPercent: 100 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...BASE, purchaseCostPercent: 150 }),
    ).toBeNull();
  });
});
