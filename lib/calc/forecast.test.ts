import { describe, expect, it } from "vitest";
import { computeForecast, type ForecastInput } from "@/lib/calc/forecast";

const BASE: ForecastInput = {
  baseRevenue: 10_000_000_000,
  revenueGrowthPercent: 15,
  variableCostPercent: 60,
  baseFixedCost: 3_000_000_000,
  fixedCostGrowthPercent: 8,
  years: 5,
  baseYear: 2026,
  taxPercent: 20,
};

describe("computeForecast", () => {
  it("leaves year one exactly as entered", () => {
    const result = computeForecast(BASE)!;
    const first = result.years[0];
    expect(first.year).toBe(2026);
    expect(first.revenue).toBe(10_000_000_000);
    expect(first.fixedCost).toBe(3_000_000_000);
    expect(first.variableCost).toBe(6_000_000_000);
    // 10 − 6 − 3 = 1 tỷ, at 10% margin.
    expect(first.operatingProfit).toBeCloseTo(1_000_000_000, 2);
    expect(first.operatingMarginPercent).toBeCloseTo(10, 10);
  });

  it("compounds growth rather than multiplying it", () => {
    const result = computeForecast(BASE)!;
    // Five years at 15% is FOUR compoundings: 1,15^4 = 1,74900625. A
    // linear projection would say 1 + 4 x 0,15 = 1,60, so this case alone
    // would catch the bug — but only just, which is why the ten-year case
    // below is asserted too: there the gap is 3,52 against 2,35.
    expect(result.finalRevenue).toBeCloseTo(17_490_062_500, 2);

    const decade = computeForecast({ ...BASE, years: 10 })!;
    // 1,15^9 = 3,5178762919...
    expect(decade.finalRevenue).toBeCloseTo(35_178_762_919.2, 0);
  });

  it("reports the input growth rate back as the CAGR", () => {
    const result = computeForecast(BASE)!;
    // Not new information: a check that the series really compounded. If the
    // projection were linear this would come back below 15.
    expect(result.revenueCagrPercent).toBeCloseTo(15, 8);
  });

  it("widens the margin when revenue outgrows fixed costs", () => {
    const result = computeForecast(BASE)!;
    // Revenue at 15%, fixed costs at 8%. Variable costs stay 60% of revenue,
    // so the whole margin story is fixed costs shrinking as a share.
    expect(result.years[0].operatingMarginPercent).toBeCloseTo(10, 10);
    // Year five: doanh thu 17.490,06 triệu, biến phí 10.494,04, định phí
    // 3.000 x 1,08^4 = 4.081,47 — còn lại 2.914,56 triệu.
    expect(result.finalMarginPercent).toBeCloseTo(16.66408, 5);
    expect(result.marginChangePoints).toBeCloseTo(6.66408, 5);
  });

  it("keeps the margin flat when fixed costs grow with revenue", () => {
    // The degenerate case worth pinning: with fixed costs growing at exactly
    // the revenue rate, every year has year one's margin. A forecast that
    // treats all costs as a percent of revenue can only ever produce this.
    const result = computeForecast({ ...BASE, fixedCostGrowthPercent: 15 })!;
    for (const row of result.years) {
      expect(row.operatingMarginPercent).toBeCloseTo(10, 8);
    }
    expect(result.marginChangePoints).toBeCloseTo(0, 8);
  });

  it("narrows the margin when fixed costs outgrow revenue", () => {
    const result = computeForecast({
      ...BASE,
      revenueGrowthPercent: 5,
      fixedCostGrowthPercent: 20,
    })!;
    expect(result.marginChangePoints!).toBeLessThan(0);
    // 1,20^4 = 2,0736 on fixed costs against 1,05^4 = 1,21550625 on revenue:
    // fixed cost 6.220,8 triệu against revenue 12.155,06 triệu, of which 60%
    // is variable. The year turns a loss.
    expect(result.years[4].operatingProfit).toBeLessThan(0);
    expect(result.hasLossYear).toBe(true);
  });

  it("charges no tax on a loss and does not refund one", () => {
    const result = computeForecast({
      ...BASE,
      baseFixedCost: 8_000_000_000,
    })!;
    const first = result.years[0];
    // 10 − 6 − 8 = −4 tỷ.
    expect(first.operatingProfit).toBeCloseTo(-4_000_000_000, 2);
    expect(first.tax).toBe(0);
    // The loss passes through untouched: tax does not soften it.
    expect(first.profitAfterTax).toBeCloseTo(-4_000_000_000, 2);
  });

  it("names the first profitable year", () => {
    const result = computeForecast({
      ...BASE,
      baseFixedCost: 5_000_000_000,
    })!;
    // Year one: 10 − 6 − 5 = −1 tỷ. Revenue grows 15%, fixed 8%, so the gap
    // closes; the module says which year it closes in.
    expect(result.years[0].operatingProfit).toBeLessThan(0);
    // The gap closes slowly: −1.000, −800, −542, −215, then +194 triệu.
    // Four loss-making years before it turns, which is exactly the kind of
    // thing a reader plans around and a headline growth rate hides.
    expect(result.firstProfitableYear).toBe(2030);
    expect(result.years[3].operatingProfit).toBeLessThan(0);
    expect(result.years[4].operatingProfit).toBeGreaterThan(0);
  });

  it("returns null for firstProfitableYear when it never happens", () => {
    const result = computeForecast({
      ...BASE,
      variableCostPercent: 100,
      baseFixedCost: 1_000_000_000,
    })!;
    // Variable cost alone eats all revenue, so fixed cost is pure loss and
    // no amount of growth rescues it.
    expect(result.firstProfitableYear).toBe(null);
    expect(result.hasLossYear).toBe(true);
  });

  it("handles a declining business", () => {
    const result = computeForecast({
      ...BASE,
      revenueGrowthPercent: -10,
      fixedCostGrowthPercent: 0,
    })!;
    // 0,9^4 = 0,6561.
    expect(result.finalRevenue).toBeCloseTo(6_561_000_000, 2);
    expect(result.revenueCagrPercent).toBeCloseTo(-10, 8);
    // Fixed costs held flat while revenue falls: the margin collapses.
    expect(result.marginChangePoints!).toBeLessThan(0);
    expect(result.finalOperatingProfit).toBeLessThan(0);
  });

  it("sums the horizon", () => {
    const result = computeForecast(BASE)!;
    const manual = result.years.reduce(
      (total, row) => total + row.revenue,
      0,
    );
    expect(result.totalRevenue).toBeCloseTo(manual, 2);
    // The geometric sum: 10 x (1,15^5 − 1) / 0,15 = 67.423,8125 triệu.
    expect(result.totalRevenue).toBeCloseTo(67_423_812_500, 0);
    expect(result.totalOperatingProfit).toBeCloseTo(
      result.totalRevenue - result.totalCost,
      2,
    );
  });

  it("taxes each year separately, not the total", () => {
    // A year of loss followed by years of profit. Taxing the SUM would net
    // the loss against later profits and produce a smaller tax bill; taxing
    // each year does not, and that difference is the point.
    const result = computeForecast({
      ...BASE,
      baseFixedCost: 5_000_000_000,
    })!;
    const taxOnEachYear = result.years.reduce(
      (total, row) => total + row.tax,
      0,
    );
    const taxOnTheTotal = result.totalOperatingProfit * 0.2;
    expect(taxOnEachYear).toBeGreaterThan(taxOnTheTotal);
    expect(result.years[0].tax).toBe(0);
  });

  it("profit after tax is the profit less the tax, every year", () => {
    const result = computeForecast(BASE)!;
    for (const row of result.years) {
      expect(row.profitAfterTax).toBeCloseTo(row.operatingProfit - row.tax, 6);
      expect(row.totalCost).toBeCloseTo(row.variableCost + row.fixedCost, 6);
      expect(row.operatingProfit).toBeCloseTo(row.revenue - row.totalCost, 6);
    }
  });

  it("numbers the years consecutively from the base", () => {
    const result = computeForecast({ ...BASE, years: 7, baseYear: 2030 })!;
    expect(result.years.map((row) => row.year)).toEqual([
      2030, 2031, 2032, 2033, 2034, 2035, 2036,
    ]);
    expect(result.years.map((row) => row.index)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("gives a one-year horizon no growth and no CAGR", () => {
    const result = computeForecast({ ...BASE, years: 1 })!;
    expect(result.years).toHaveLength(1);
    expect(result.finalRevenue).toBe(10_000_000_000);
    // Nothing compounded, so there is no rate to report.
    expect(result.revenueCagrPercent).toBe(null);
    expect(result.marginChangePoints).toBeCloseTo(0, 10);
  });

  it("returns a null margin rather than dividing by zero revenue", () => {
    const result = computeForecast({ ...BASE, baseRevenue: 0 })!;
    expect(result.years[0].revenue).toBe(0);
    expect(result.years[0].operatingMarginPercent).toBe(null);
    expect(result.finalMarginPercent).toBe(null);
    expect(result.marginChangePoints).toBe(null);
    expect(result.revenueCagrPercent).toBe(null);
    // The fixed cost is still a real loss.
    expect(result.years[0].operatingProfit).toBeCloseTo(-3_000_000_000, 2);
  });

  it("rejects inputs that cannot describe a business", () => {
    expect(computeForecast({ ...BASE, years: 0 })).toBe(null);
    expect(computeForecast({ ...BASE, years: -3 })).toBe(null);
    expect(computeForecast({ ...BASE, years: 2.5 })).toBe(null);
    // Compounding a guess for three decades is not a forecast.
    expect(computeForecast({ ...BASE, years: 31 })).toBe(null);
    expect(computeForecast({ ...BASE, baseRevenue: -1 })).toBe(null);
    expect(computeForecast({ ...BASE, baseFixedCost: -1 })).toBe(null);
    expect(computeForecast({ ...BASE, variableCostPercent: -1 })).toBe(null);
    expect(computeForecast({ ...BASE, variableCostPercent: 101 })).toBe(null);
    expect(computeForecast({ ...BASE, taxPercent: -1 })).toBe(null);
    expect(computeForecast({ ...BASE, taxPercent: 101 })).toBe(null);
    // Below −100%/năm revenue would turn negative: a sign error, not a fall.
    expect(computeForecast({ ...BASE, revenueGrowthPercent: -101 })).toBe(null);
    expect(computeForecast({ ...BASE, fixedCostGrowthPercent: -101 })).toBe(
      null,
    );
    expect(computeForecast({ ...BASE, baseYear: 2026.5 })).toBe(null);
  });

  it("accepts the boundary cases it should", () => {
    expect(computeForecast({ ...BASE, years: 30 })).not.toBe(null);
    expect(computeForecast({ ...BASE, years: 1 })).not.toBe(null);
    expect(computeForecast({ ...BASE, variableCostPercent: 0 })).not.toBe(null);
    expect(computeForecast({ ...BASE, variableCostPercent: 100 })).not.toBe(
      null,
    );
    expect(computeForecast({ ...BASE, taxPercent: 0 })).not.toBe(null);
    // Exactly −100%: revenue goes to zero from year two, which is a
    // legitimate thing to model.
    const wipeout = computeForecast({
      ...BASE,
      revenueGrowthPercent: -100,
    })!;
    expect(wipeout.years[1].revenue).toBe(0);
    expect(wipeout.years[1].operatingMarginPercent).toBe(null);
  });

  it("has no zero-tax escape hatch at exactly break-even", () => {
    // Profit of exactly 0 is taxed 0 either way, but the guard is `> 0` so
    // the sign of the comparison is worth pinning: no negative tax appears.
    const result = computeForecast({
      ...BASE,
      variableCostPercent: 70,
      baseFixedCost: 3_000_000_000,
    })!;
    expect(result.years[0].operatingProfit).toBeCloseTo(0, 2);
    expect(result.years[0].tax).toBe(0);
  });
});
