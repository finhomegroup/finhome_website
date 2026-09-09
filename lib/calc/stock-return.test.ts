import { describe, it, expect } from "vitest";
import {
  computeStockReturn,
  type StockReturnInput,
} from "@/lib/calc/stock-return";

// 10.000 shares bought at 30.000 ₫, sold at 36.000 ₫, 1.500 ₫/share of
// dividends, on Vietnamese default rates.
const BASE: StockReturnInput = {
  shares: 10_000,
  buyPricePerShare: 30_000,
  sellPricePerShare: 36_000,
  brokerageFeePercent: 0.15,
  dividendPerShare: 1_500,
  dividendTaxPercent: 5,
  transferTaxPercent: 0.1,
  years: 2,
};

function trade(input: StockReturnInput) {
  const result = computeStockReturn(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeStockReturn — the two sides of the trade", () => {
  it("adds commission to the cost", () => {
    const result = trade(BASE);
    expect(result.grossCost).toBe(300_000_000);
    expect(result.buyFee).toBeCloseTo(450_000, 6);
    expect(result.totalCost).toBeCloseTo(300_450_000, 6);
  });

  it("takes commission and transfer tax off the proceeds", () => {
    const result = trade(BASE);
    expect(result.grossProceeds).toBe(360_000_000);
    expect(result.sellFee).toBeCloseTo(540_000, 6);
    expect(result.transferTax).toBeCloseTo(360_000, 6);
    expect(result.netProceeds).toBeCloseTo(359_100_000, 6);
  });

  it("withholds tax on the dividends", () => {
    const result = trade(BASE);
    expect(result.grossDividends).toBe(15_000_000);
    expect(result.dividendTax).toBeCloseTo(750_000, 6);
    expect(result.netDividends).toBeCloseTo(14_250_000, 6);
  });

  it("keeps the profit identity", () => {
    const result = trade(BASE);
    expect(result.netProfit).toBeCloseTo(
      result.netProceeds + result.netDividends - result.totalCost,
      6,
    );
    expect(result.netProfit).toBeCloseTo(72_900_000, 6);
  });

  it("totals the fees and the taxes separately", () => {
    const result = trade(BASE);
    expect(result.totalFees).toBeCloseTo(990_000, 6);
    expect(result.totalTaxes).toBeCloseTo(1_110_000, 6);
  });
});

describe("computeStockReturn — the friction", () => {
  it("reports the return before and after everything", () => {
    const result = trade(BASE);
    // Gross: (360 + 15 − 300) ÷ 300 = 25%.
    expect(result.grossReturnPercent).toBeCloseTo(25, 8);
    expect(result.returnPercent).toBeLessThan(result.grossReturnPercent);
    expect(result.dragPoints).toBeCloseTo(
      result.grossReturnPercent - result.returnPercent,
      10,
    );
    expect(result.dragPoints).toBeGreaterThan(0);
  });

  it("charges no friction when every rate is zero", () => {
    const result = trade({
      ...BASE,
      brokerageFeePercent: 0,
      dividendTaxPercent: 0,
      transferTaxPercent: 0,
    });
    expect(result.totalFees).toBe(0);
    expect(result.totalTaxes).toBe(0);
    expect(result.returnPercent).toBeCloseTo(result.grossReturnPercent, 10);
    expect(result.dragPoints).toBeCloseTo(0, 10);
  });

  it("grows the drag with the commission", () => {
    const cheap = trade({ ...BASE, brokerageFeePercent: 0.1 }).dragPoints;
    const dear = trade({ ...BASE, brokerageFeePercent: 0.35 }).dragPoints;
    expect(dear).toBeGreaterThan(cheap);
  });
});

describe("computeStockReturn — transfer tax on a loss", () => {
  it("charges the tax even when the trade lost money", () => {
    // The reason this module exists rather than a generic gain calculator.
    const result = trade({ ...BASE, sellPricePerShare: 24_000 });
    expect(result.netProfit).toBeLessThan(0);
    expect(result.transferTax).toBeCloseTo(240_000, 6);
    expect(result.taxedOnALoss).toBe(true);
  });

  it("makes the loss bigger than the price move implies", () => {
    const result = trade({
      ...BASE,
      sellPricePerShare: 24_000,
      dividendPerShare: 0,
    });
    // The price fell 20%; the loss after friction is worse than 20%.
    expect(result.grossReturnPercent).toBeCloseTo(-20, 8);
    expect(result.returnPercent).toBeLessThan(-20);
  });

  it("is shallower than the price fall once dividends cover the friction", () => {
    // The notice this flag renders must NOT claim the real loss always
    // exceeds the price fall: at the shipped 1.500 ₫/cp dividend it never
    // does, because the 14.250.000 ₫ net dividend outruns the friction.
    const result = trade({ ...BASE, sellPricePerShare: 24_000 });
    expect(result.taxedOnALoss).toBe(true);
    expect(result.returnPercent).toBeCloseTo(-15.5766350, 6);
    // The price fell 20%; the loss after friction is only 15,577%.
    expect(result.grossReturnPercent).toBeCloseTo(-15, 8);
    expect(result.returnPercent).toBeGreaterThan(-20);
    // What IS true of every losing trade, and what the notice now says: the
    // loss after friction is deeper than the loss before it.
    expect(result.returnPercent).toBeLessThan(result.grossReturnPercent);
  });

  it("always loses ground to friction, at every losing price", () => {
    // The notice fires on any netProfit < 0, so its claim has to hold across
    // the whole losing range rather than at one example.
    for (const sellPricePerShare of [28_000, 24_000, 20_000, 10_000, 1_000]) {
      const result = trade({ ...BASE, sellPricePerShare });
      expect(result.netProfit).toBeLessThan(0);
      expect(result.returnPercent).toBeLessThan(result.grossReturnPercent);
      expect(result.dragPoints).toBeGreaterThan(0);
    }
  });

  it("does not flag a profitable trade", () => {
    expect(trade(BASE).taxedOnALoss).toBe(false);
  });

  it("does not flag a loss when there is no transfer tax", () => {
    const result = trade({
      ...BASE,
      sellPricePerShare: 24_000,
      transferTaxPercent: 0,
    });
    expect(result.netProfit).toBeLessThan(0);
    expect(result.taxedOnALoss).toBe(false);
  });
});

describe("computeStockReturn — the break-even price", () => {
  it("sits above the purchase price with no dividends", () => {
    const result = trade({ ...BASE, dividendPerShare: 0 });
    expect(result.breakEvenPricePerShare!).toBeGreaterThan(30_000);
  });

  it("actually breaks even when used as the sale price", () => {
    // The check that matters: feed it back in and the profit must be zero.
    for (const dividendPerShare of [0, 1_500, 4_000]) {
      const first = trade({ ...BASE, dividendPerShare });
      const atBreakEven = trade({
        ...BASE,
        dividendPerShare,
        sellPricePerShare: first.breakEvenPricePerShare!,
      });
      expect(atBreakEven.netProfit).toBeCloseTo(0, 4);
    }
  });

  it("falls below the purchase price once dividends cover the friction", () => {
    const result = trade({ ...BASE, dividendPerShare: 4_000 });
    expect(result.breakEvenPricePerShare!).toBeLessThan(30_000);
  });

  it("matches the closed form the docstring states, at every rate, with no dividends", () => {
    // Pins the module docstring's zero-dividend contract, which used to claim
    // the break-even is above the purchase price unconditionally. Swept
    // instead of sampled because the docstring states it for the whole
    // zero-dividend range, and the zero-commission/zero-transfer-tax corner
    // is the one point where it is EQUAL to the buy price rather than above
    // it. BASE keeps dividendTaxPercent at 5 throughout, which is what makes
    // that corner equality hold: with no dividends the dividend tax rate
    // cannot move the break-even at all.
    for (const brokerageFeePercent of [0, 0.1, 0.15, 0.35, 1, 5]) {
      for (const transferTaxPercent of [0, 0.1, 0.5, 2]) {
        const result = trade({
          ...BASE,
          dividendPerShare: 0,
          brokerageFeePercent,
          transferTaxPercent,
        });
        const feeRate = brokerageFeePercent / 100;
        const closedForm =
          (30_000 * (1 + feeRate)) / (1 - feeRate - transferTaxPercent / 100);
        // Four multiplications and one division, no solved rate anywhere, so
        // the only error is IEEE-754 rounding: the largest gap over this
        // sweep is 3,6e-12 ₫ on a ~30.000 ₫ figure. 1e-6 ₫ is loose for that
        // and still far tighter than anything the page displays.
        expect(result.breakEvenPricePerShare!).toBeCloseTo(closedForm, 6);
        if (brokerageFeePercent === 0 && transferTaxPercent === 0) {
          expect(result.breakEvenPricePerShare!).toBeCloseTo(30_000, 6);
        } else {
          expect(result.breakEvenPricePerShare!).toBeGreaterThan(30_000);
        }
      }
    }
  });

  it("crosses the purchase price when net dividends pass the round-trip friction", () => {
    // The other half of the docstring's contract: break-even < buy price
    // exactly when netDividends > grossCost × (2 × feeRate + transferRate).
    // At the defaults that is 300.000.000 × 0,004 = 1.200.000 ₫ net, i.e.
    // 126,3158 ₫/share gross once the 5% dividend tax is added back.
    const crossover = (300_000_000 * (2 * 0.0015 + 0.001)) / (1 - 0.05) / 10_000;
    expect(crossover).toBeCloseTo(126.3158, 4);
    expect(
      trade({ ...BASE, dividendPerShare: crossover - 1 })
        .breakEvenPricePerShare!,
    ).toBeGreaterThan(30_000);
    // Same rounding-only argument as above: 1e-6 ₫ on a ~30.000 ₫ figure.
    expect(
      trade({ ...BASE, dividendPerShare: crossover }).breakEvenPricePerShare!,
    ).toBeCloseTo(30_000, 6);
    expect(
      trade({ ...BASE, dividendPerShare: crossover + 1 })
        .breakEvenPricePerShare!,
    ).toBeLessThan(30_000);
  });

  it("never reports a negative price when dividends already cover the cost", () => {
    // 1.000 ₫/năm for 12 years on a 10.000 ₫ par share — ordinary for a
    // Vietnamese issuer declaring 10–30% of par. The closed form's root here
    // is −1.388,47, which is not a price.
    const result = trade({
      ...BASE,
      buyPricePerShare: 10_000,
      sellPricePerShare: 15_000,
      dividendPerShare: 12_000,
      years: 12,
    });
    expect(result.breakEvenPricePerShare).toBe(0);
    expect(result.alreadyBreakEven).toBe(true);
    // The clamp is honest: at a sale price of zero the trade is still ahead,
    // by net dividends 114.000.000 − total cost 100.150.000.
    const atZero = trade({
      ...BASE,
      buyPricePerShare: 10_000,
      sellPricePerShare: 0,
      dividendPerShare: 12_000,
      years: 12,
    });
    expect(atZero.netProfit).toBeCloseTo(13_850_000, 6);
    expect(atZero.netProfit).toBeGreaterThan(0);
  });

  it("crosses into the clamp at (1 + fee)/(1 − dividend tax) × the buy price", () => {
    const threshold = (10_000 * (1 + 0.0015)) / (1 - 0.05); // 10.542,10…
    const below = trade({
      ...BASE,
      buyPricePerShare: 10_000,
      sellPricePerShare: 15_000,
      dividendPerShare: Math.floor(threshold) - 1,
    });
    expect(below.alreadyBreakEven).toBe(false);
    expect(below.breakEvenPricePerShare!).toBeGreaterThan(0);
    const above = trade({
      ...BASE,
      buyPricePerShare: 10_000,
      sellPricePerShare: 15_000,
      dividendPerShare: Math.ceil(threshold) + 1,
    });
    expect(above.alreadyBreakEven).toBe(true);
    expect(above.breakEvenPricePerShare).toBe(0);
  });

  it("distinguishes the clamp from the no-solution case", () => {
    // Two different states with two different explanations on the page: a
    // sale fully consumed by friction has NO break-even price (null), while
    // dividends covering the cost break even at 0.
    const consumed = trade({
      ...BASE,
      brokerageFeePercent: 99.9,
      transferTaxPercent: 0.1,
    });
    expect(consumed.breakEvenPricePerShare).toBeNull();
    expect(consumed.alreadyBreakEven).toBe(false);
  });

  it("leaves an ordinary trade's break-even unclamped", () => {
    // The clamp must not touch the default state: 28.692 ₫ with dividends,
    // 30.120 ₫ without.
    const withDividend = trade(BASE);
    expect(withDividend.alreadyBreakEven).toBe(false);
    expect(withDividend.breakEvenPricePerShare!).toBeCloseTo(28_691.73, 2);
    const without = trade({ ...BASE, dividendPerShare: 0 });
    expect(without.alreadyBreakEven).toBe(false);
    expect(without.breakEvenPricePerShare!).toBeCloseTo(30_120.30, 2);
  });

  it("rises with the commission", () => {
    const cheap = trade({
      ...BASE,
      dividendPerShare: 0,
      brokerageFeePercent: 0.1,
    }).breakEvenPricePerShare!;
    const dear = trade({
      ...BASE,
      dividendPerShare: 0,
      brokerageFeePercent: 0.35,
    }).breakEvenPricePerShare!;
    expect(dear).toBeGreaterThan(cheap);
  });
});

describe("computeStockReturn — annualising", () => {
  it("uses the compound rate over the holding period", () => {
    const result = trade(BASE);
    const multiple =
      (result.netProceeds + result.netDividends) / result.totalCost;
    expect(result.annualisedPercent).toBeCloseTo(
      (multiple ** (1 / 2) - 1) * 100,
      8,
    );
    expect(result.annualisedPercent!).toBeLessThan(result.returnPercent);
  });

  it("is null when no holding period was given", () => {
    const result = trade({ ...BASE, years: 0 });
    expect(result.annualisedPercent).toBeNull();
    expect(result.returnPercent).toBeGreaterThan(0);
  });

  it("is null when the position was wiped out", () => {
    const result = trade({
      ...BASE,
      sellPricePerShare: 0,
      dividendPerShare: 0,
    });
    expect(result.annualisedPercent).toBeNull();
    expect(result.returnPercent).toBeCloseTo(-100, 6);
  });
});

describe("computeStockReturn — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeStockReturn({ ...BASE, shares: 0 })).toBeNull();
    expect(computeStockReturn({ ...BASE, shares: -1 })).toBeNull();
    expect(computeStockReturn({ ...BASE, buyPricePerShare: 0 })).toBeNull();
    expect(computeStockReturn({ ...BASE, sellPricePerShare: -1 })).toBeNull();
    expect(computeStockReturn({ ...BASE, dividendPerShare: -1 })).toBeNull();
    expect(computeStockReturn({ ...BASE, years: -1 })).toBeNull();
    expect(computeStockReturn({ ...BASE, shares: Number.NaN })).toBeNull();
  });

  it("rejects a fee or tax rate at or above 100%", () => {
    expect(
      computeStockReturn({ ...BASE, brokerageFeePercent: 100 }),
    ).toBeNull();
    expect(
      computeStockReturn({ ...BASE, transferTaxPercent: 100 }),
    ).toBeNull();
    expect(
      computeStockReturn({ ...BASE, dividendTaxPercent: 100 }),
    ).toBeNull();
  });

  it("has no break-even price when the sale is fully consumed", () => {
    // Commission plus transfer tax reaching 100% of the sale leaves nothing
    // for any price to clear.
    const result = trade({
      ...BASE,
      brokerageFeePercent: 99.9,
      transferTaxPercent: 0.1,
    });
    expect(result.breakEvenPricePerShare).toBeNull();
  });
});
