import { describe, it, expect } from "vitest";
import {
  computeAnalysis,
  computeRatios,
  type FinancialsInput,
} from "@/lib/calc/financials";

// A plausible mid-cap: 1.000 tỷ revenue, 600 COGS, 250 opex, 30 interest,
// 24 tax. Balance sheet totals 900 assets against 400 liabilities.
const BASE: FinancialsInput = {
  revenue: 1_000_000_000_000,
  costOfGoodsSold: 600_000_000_000,
  operatingExpenses: 250_000_000_000,
  interestExpense: 30_000_000_000,
  taxExpense: 24_000_000_000,

  cash: 100_000_000_000,
  receivables: 150_000_000_000,
  inventory: 200_000_000_000,
  otherCurrentAssets: 50_000_000_000,
  nonCurrentAssets: 400_000_000_000,
  currentLiabilities: 250_000_000_000,
  longTermDebt: 100_000_000_000,
  otherNonCurrentLiabilities: 50_000_000_000,

  sharesOutstanding: 100_000_000,
  sharePrice: 20_000,
};

function ratios(input: FinancialsInput) {
  const result = computeRatios(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeRatios — the derived statements", () => {
  it("walks the income statement down to net profit", () => {
    const r = ratios(BASE);
    expect(r.grossProfit).toBe(400_000_000_000);
    expect(r.operatingProfit).toBe(150_000_000_000);
    expect(r.profitBeforeTax).toBe(120_000_000_000);
    expect(r.netProfit).toBe(96_000_000_000);
  });

  it("balances the balance sheet", () => {
    const r = ratios(BASE);
    expect(r.currentAssets).toBe(500_000_000_000);
    expect(r.totalAssets).toBe(900_000_000_000);
    expect(r.totalLiabilities).toBe(400_000_000_000);
    // The identity that makes it a balance sheet.
    expect(r.equity).toBe(r.totalAssets - r.totalLiabilities);
    expect(r.equity).toBe(500_000_000_000);
  });

  it("nets cash off debt, and reports gross debt beside it", () => {
    const r = ratios(BASE);
    expect(r.totalDebt).toBe(350_000_000_000);
    expect(r.netDebt).toBe(250_000_000_000);
    expect(r.netDebt).toBe(r.totalDebt - 100_000_000_000);
  });
});

describe("computeRatios — profitability", () => {
  it("computes the three margins off revenue", () => {
    const r = ratios(BASE);
    expect(r.grossMarginPercent).toBeCloseTo(40, 8);
    expect(r.operatingMarginPercent).toBeCloseTo(15, 8);
    expect(r.netMarginPercent).toBeCloseTo(9.6, 8);
  });

  it("computes returns off the closing balances", () => {
    const r = ratios(BASE);
    expect(r.returnOnAssetsPercent).toBeCloseTo((96 / 900) * 100, 8);
    expect(r.returnOnEquityPercent).toBeCloseTo((96 / 500) * 100, 8);
  });

  it("keeps return on equity above return on assets when geared", () => {
    const r = ratios(BASE);
    expect(r.returnOnEquityPercent!).toBeGreaterThan(
      r.returnOnAssetsPercent!,
    );
  });

  it("returns null margins on zero revenue rather than Infinity", () => {
    const r = ratios({ ...BASE, revenue: 0, costOfGoodsSold: 0 });
    expect(r.grossMarginPercent).toBeNull();
    expect(r.netMarginPercent).toBeNull();
    expect(r.assetTurnover).toBeCloseTo(0, 10);
  });
});

describe("computeRatios — liquidity", () => {
  it("computes the three liquidity ratios", () => {
    const r = ratios(BASE);
    expect(r.currentRatio).toBeCloseTo(2, 8);
    // Quick drops inventory: (100 + 150 + 50) ÷ 250 = 1,2.
    expect(r.quickRatio).toBeCloseTo(1.2, 8);
    expect(r.cashRatio).toBeCloseTo(0.4, 8);
  });

  it("orders them current ≥ quick ≥ cash", () => {
    const r = ratios(BASE);
    expect(r.currentRatio!).toBeGreaterThanOrEqual(r.quickRatio!);
    expect(r.quickRatio!).toBeGreaterThanOrEqual(r.cashRatio!);
  });

  it("returns null with no current liabilities, not Infinity", () => {
    const r = ratios({ ...BASE, currentLiabilities: 0 });
    expect(r.currentRatio).toBeNull();
    expect(r.quickRatio).toBeNull();
    expect(r.cashRatio).toBeNull();
  });
});

describe("computeRatios — leverage", () => {
  it("computes gearing and the equity multiplier", () => {
    const r = ratios(BASE);
    expect(r.debtToEquity).toBeCloseTo(0.7, 8);
    expect(r.debtToAssetsPercent).toBeCloseTo((350 / 900) * 100, 8);
    expect(r.equityMultiplier).toBeCloseTo(1.8, 8);
  });

  it("covers interest five times over", () => {
    const r = ratios(BASE);
    expect(r.interestCoverage).toBeCloseTo(5, 8);
  });

  it("returns null coverage with no interest expense, not Infinity", () => {
    // A company with no debt has no coverage ratio, and printing ∞ would
    // claim infinite safety.
    const r = ratios({ ...BASE, interestExpense: 0 });
    expect(r.interestCoverage).toBeNull();
  });

  it("flags negative equity, where every equity ratio misleads", () => {
    const r = ratios({
      ...BASE,
      otherNonCurrentLiabilities: 700_000_000_000,
    });
    expect(r.equity).toBeLessThan(0);
    expect(r.negativeEquity).toBe(true);
    // The ratios still compute, but their sign is meaningless — hence the
    // flag, so the page can say so.
    expect(r.returnOnEquityPercent!).toBeLessThan(0);
  });

  it("does not flag healthy equity", () => {
    expect(ratios(BASE).negativeEquity).toBe(false);
  });
});

describe("computeRatios — efficiency", () => {
  it("computes turnover and the day-count equivalents", () => {
    const r = ratios(BASE);
    expect(r.assetTurnover).toBeCloseTo(1000 / 900, 8);
    expect(r.inventoryTurnover).toBeCloseTo(3, 8);
    expect(r.daysSalesOutstanding).toBeCloseTo((150 / 1000) * 365, 6);
    expect(r.daysInventory).toBeCloseTo((200 / 600) * 365, 6);
  });

  it("keeps turnover and days consistent", () => {
    // Days inventory should be 365 divided by inventory turnover.
    const r = ratios(BASE);
    expect(r.daysInventory).toBeCloseTo(365 / r.inventoryTurnover!, 6);
  });

  it("returns null turnover with no inventory, not Infinity", () => {
    const r = ratios({ ...BASE, inventory: 0 });
    expect(r.inventoryTurnover).toBeNull();
    expect(r.daysInventory).toBeCloseTo(0, 10);
  });
});

describe("computeRatios — per share and valuation", () => {
  it("computes earnings and book value per share", () => {
    const r = ratios(BASE);
    expect(r.earningsPerShare).toBeCloseTo(960, 6);
    expect(r.bookValuePerShare).toBeCloseTo(5_000, 6);
  });

  it("computes the valuation multiples off market capitalisation", () => {
    const r = ratios(BASE);
    // 100 triệu shares at 20.000 ₫ is 2.000 tỷ of market cap.
    expect(r.priceToEarnings).toBeCloseTo(2_000 / 96, 6);
    expect(r.priceToBook).toBeCloseTo(2_000 / 500, 6);
  });

  it("agrees with price divided by per-share figures", () => {
    const r = ratios(BASE);
    expect(r.priceToEarnings).toBeCloseTo(20_000 / r.earningsPerShare!, 6);
    expect(r.priceToBook).toBeCloseTo(20_000 / r.bookValuePerShare!, 6);
  });

  it("returns null without the share inputs", () => {
    const r = ratios({
      ...BASE,
      sharesOutstanding: undefined,
      sharePrice: undefined,
    });
    expect(r.earningsPerShare).toBeNull();
    expect(r.bookValuePerShare).toBeNull();
    expect(r.priceToEarnings).toBeNull();
    expect(r.priceToBook).toBeNull();
  });

  it("returns null valuation with shares but no price", () => {
    const r = ratios({ ...BASE, sharePrice: undefined });
    expect(r.earningsPerShare).not.toBeNull();
    expect(r.priceToEarnings).toBeNull();
  });
});

describe("computeRatios — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeRatios({ ...BASE, revenue: -1 })).toBeNull();
    expect(computeRatios({ ...BASE, inventory: -1 })).toBeNull();
    expect(computeRatios({ ...BASE, taxExpense: -1 })).toBeNull();
    expect(computeRatios({ ...BASE, revenue: Number.NaN })).toBeNull();
    expect(computeRatios({ ...BASE, sharesOutstanding: -1 })).toBeNull();
    expect(computeRatios({ ...BASE, sharePrice: -1 })).toBeNull();
  });

  it("allows a loss-making company", () => {
    // Negative profit is a real company; negative inputs are a typo.
    const r = ratios({ ...BASE, operatingExpenses: 500_000_000_000 });
    expect(r.operatingProfit).toBeLessThan(0);
    expect(r.netProfit).toBeLessThan(0);
    expect(r.netMarginPercent!).toBeLessThan(0);
  });
});

describe("computeAnalysis — two periods", () => {
  // Last year: 10% less revenue, thinner margins, less debt.
  const PRIOR: FinancialsInput = {
    ...BASE,
    revenue: 900_000_000_000,
    costOfGoodsSold: 560_000_000_000,
    operatingExpenses: 240_000_000_000,
    interestExpense: 20_000_000_000,
    taxExpense: 16_000_000_000,
    nonCurrentAssets: 350_000_000_000,
    longTermDebt: 60_000_000_000,
  };

  function analysis() {
    const result = computeAnalysis({ current: BASE, prior: PRIOR });
    expect(result).not.toBeNull();
    return result!;
  }

  it("computes both periods' ratio sets", () => {
    const a = analysis();
    expect(a.current.netProfit).toBe(96_000_000_000);
    expect(a.prior.netProfit).toBe(64_000_000_000);
  });

  it("computes year-on-year change in đồng and percent", () => {
    const a = analysis();
    const revenue = a.lines.find((line) => line.key === "revenue")!;
    expect(revenue.change).toBe(100_000_000_000);
    expect(revenue.changePercent).toBeCloseTo(11.111_111_11, 6);
  });

  it("computes common-size percentages against each period's own revenue", () => {
    const a = analysis();
    const gross = a.lines.find((line) => line.key === "grossProfit")!;
    expect(gross.currentOfRevenuePercent).toBeCloseTo(40, 8);
    // 340 ÷ 900 = 37,78%: margins improved, which the single-year ratio set
    // cannot tell you.
    expect(gross.priorOfRevenuePercent).toBeCloseTo(37.777_777_78, 6);
  });

  it("keeps every line's change consistent", () => {
    for (const line of analysis().lines) {
      expect(line.change).toBeCloseTo(line.current - line.prior, 2);
    }
  });

  it("reproduces return on equity from the DuPont product", () => {
    // The two are computed by different routes and must agree — that is what
    // makes the decomposition trustworthy as an attribution.
    const a = analysis();
    expect(a.currentDuPont.returnOnEquityPercent).toBeCloseTo(
      a.current.returnOnEquityPercent!,
      6,
    );
    expect(a.priorDuPont.returnOnEquityPercent).toBeCloseTo(
      a.prior.returnOnEquityPercent!,
      6,
    );
  });

  it("attributes the change in return on equity to its three drivers", () => {
    const a = analysis();
    expect(a.returnOnEquityChangePoints).toBeCloseTo(
      a.current.returnOnEquityPercent! - a.prior.returnOnEquityPercent!,
      8,
    );
    // Margin and leverage both rose here, so ROE rose.
    expect(a.currentDuPont.netMargin!).toBeGreaterThan(
      a.priorDuPont.netMargin!,
    );
    expect(a.currentDuPont.equityMultiplier!).toBeGreaterThan(
      a.priorDuPont.equityMultiplier!,
    );
    expect(a.returnOnEquityChangePoints!).toBeGreaterThan(0);
  });

  it("returns null when either period is rejected", () => {
    expect(
      computeAnalysis({ current: { ...BASE, revenue: -1 }, prior: PRIOR }),
    ).toBeNull();
    expect(
      computeAnalysis({ current: BASE, prior: { ...PRIOR, inventory: -1 } }),
    ).toBeNull();
  });

  it("returns a null change percent against a zero prior figure", () => {
    const result = computeAnalysis({
      current: BASE,
      prior: { ...PRIOR, interestExpense: 0 },
    })!;
    const interest = result.lines.find(
      (line) => line.key === "interestExpense",
    )!;
    expect(interest.changePercent).toBeNull();
    expect(interest.change).toBe(30_000_000_000);
  });
});
