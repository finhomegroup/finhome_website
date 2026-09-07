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
