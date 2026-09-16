/**
 * /cong-cu/thue-hay-mua/ AT ITS SHIPPED DEFAULTS, and every figure its prose
 * quotes.
 *
 * docs §6's substitute for component coverage: parse the content file's own
 * default strings with the SAME parsers the component uses, run the module,
 * format with the same formatter, and pin the result. Three of the suite's
 * five worst defects lived in a default input or in prose rather than in a
 * module.
 *
 * ORIGINAL ROW 8's repair moved the renter's figures — the rental deposit no
 * longer earns a return while the landlord holds it — so every derived number
 * in this page's copy moved with it. This file is what stops the prose and the
 * engine drifting apart again.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import {
  compareGrowthScenarios,
  compareRentVsBuy,
  growthScenarioRates,
} from "@/lib/calc/rent-vs-buy";
import {
  rentBuyScenariosModel,
  rentBuyTrajectoryModel,
} from "@/lib/calc/charts/rent-buy-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { fill } from "@/lib/calc/charts/labels";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";

const F = RENT_VS_BUY.form;

/** The defaults, read through the component's own parsers. */
const input = {
  price: parseMoney(F.defaultPrice)!,
  downPayment: parseMoney(F.defaultDown)!,
  purchaseCosts: parseMoney(F.defaultPurchaseCosts)!,
  annualRatePercent: parseDecimal(F.defaultRate)!,
  termMonths: parseDecimal(F.defaultTerm)!,
  monthlyOwnerCosts: parseMoney(F.defaultOwnerCosts)!,
  priceGrowthPercent: parseDecimal(F.defaultGrowth)!,
  sellingCostPercent: parseDecimal(F.defaultSellingCost)!,
  monthlyRent: parseMoney(F.defaultRent)!,
  rentGrowthPercent: parseDecimal(F.defaultRentGrowth)!,
  rentDeposit: parseMoney(F.defaultDeposit)!,
  investmentReturnPercent: parseDecimal(F.defaultInvestment)!,
  horizonMonths: parseDecimal(F.defaultHorizon)!,
};

const result = compareRentVsBuy(input);
/**
 * The file's RAW text, not `JSON.stringify` of the export.
 *
 * The provenance header is a `//` comment block, so a stringified object
 * cannot see it — and that header is where the worked example lives. Reading
 * the source covers the comment and the user-facing strings at once, which is
 * what keeps the recorded example and the rendered copy from drifting apart.
 */
const prose = readFileSync("content/calculators/rent-vs-buy.ts", "utf8");
const money = (value: number) => formatMoney(value);

describe("the shipped defaults compute, and the prose quotes them", () => {
  it("parses every default with the grammar its field uses", () => {
    expect(input.price).toBe(3_000_000_000);
    expect(input.downPayment).toBe(900_000_000);
    expect(input.purchaseCosts).toBe(100_000_000);
    expect(input.rentDeposit).toBe(30_000_000);
    expect(input.horizonMonths).toBe(120);
    expect(result).not.toBeNull();
  });

  it("invests the upfront cash LESS the landlord's deposit", () => {
    // The repair: 1 tỷ committed, 30 triệu of it held by the landlord, so
    // 970 triệu is what actually earns the assumed return.
    expect(result!.investedCash).toBe(970_000_000);
    // A hundredth of a đồng: the monthly compounding path and the annual
    // closed form are not bit-identical.
    expect(
      Math.abs(result!.investmentGain - 970_000_000 * (1.06 ** 10 - 1)),
    ).toBeLessThan(1e-2);
  });

  it("binds the quoted renting figures to the module's output", () => {
    expect(prose).toContain(money(result!.totalRent));
    expect(prose).toContain(money(result!.investmentGain));
    expect(prose).toContain(money(result!.rent.netCost));
  });

  it("binds the quoted buying figures to the module's output", () => {
    expect(prose).toContain(money(result!.monthlyPayment));
    expect(prose).toContain(money(result!.buy.totalPaid));
    expect(prose).toContain(money(result!.buy.netWorth));
    expect(prose).toContain(money(result!.buy.netCost));
    expect(prose).toContain(money(result!.houseValue));
    expect(prose).toContain(money(result!.loanBalance));
    expect(prose).toContain(money(result!.totalInterest));
  });

  it("binds the verdict and the break-even month", () => {
    expect(prose).toContain(money(result!.advantageOfBuying));
    expect(result!.breakEvenMonth).not.toBeNull();
    expect(prose).toContain(`tháng ${result!.breakEvenMonth}`);
  });

  it("says the deposit does not earn while it is held", () => {
    // The page used to describe the invested pool as the whole upfront cash.
    expect(prose).toContain("tiền cọc");
    expect(prose).not.toContain("đúng bằng tiền trả trước cộng phí mua");
  });

  it("discloses that NEITHER side invests its monthly difference", () => {
    const all = RENT_VS_BUY.formula.body.join(" ");
    expect(all).toContain("CỐ Ý không làm");
    expect(all).toContain("Cả hai phía");
    expect(all).toContain("không phải dự báo tài sản");
  });

  it("quotes no market rate of its own for the invested pool", () => {
    // The same boundary the savings repair set: the page cannot know a current
    // deposit rate, so it asks for the reader's own quoted return.
    expect(prose).not.toContain("5–6%/năm");
    expect(RENT_VS_BUY.faq.items[1].a).toContain("không gợi ý một mức nào");
  });
});

/**
 * ORIGINAL ROW 8's UI seam: the two charts, and the scoping the verdict needs.
 *
 * The model figures are pinned in `lib/calc/rent-vs-buy.test.ts` against the
 * independent fixture, and the adapters in
 * `lib/calc/charts/rent-buy-chart.test.ts`. What this block adds is that the
 * PAGE's own labels and defaults feed them — a chart with a missing label or a
 * scenario set that excluded the reader's own rate would pass both of those.
 */
describe("the charts the page renders at its defaults", () => {
  const trajectory = rentBuyTrajectoryModel(result, {
    ...CHART_UI.money,
    ...RENT_VS_BUY.chart,
  });
  const rates = growthScenarioRates(input.priceGrowthPercent)!;
  const scenarios = rentBuyScenariosModel(
    compareGrowthScenarios(input, rates),
    { ...CHART_UI.money, ...RENT_VS_BUY.scenarioChart },
  );

  it("draws both pictures rather than reporting an endpoint only", () => {
    expect(trajectory.unavailable).toBeNull();
    expect(scenarios.unavailable).toBeNull();
    expect(trajectory.series).toHaveLength(2);
  });

  it("ends the trajectory on the same figures the headline shows", () => {
    const last = (key: string) => {
      const series = trajectory.series.find((s) => s.key === key)!;
      return series.points[series.points.length - 1];
    };
    expect(last("buy").period).toBe(input.horizonMonths);
    expect(Math.abs(last("buy").value - result!.buy.netCost)).toBeLessThan(1e-2);
    expect(Math.abs(last("rent").value - result!.rent.netCost)).toBeLessThan(
      1e-2,
    );
  });

  it("includes the reader's own growth assumption among the scenarios", () => {
    // 5%/năm is the page's default, so the scenario view must contain the rate
    // the verdict above it was computed from.
    expect(rates).toContain(input.priceGrowthPercent);
    expect(rates).toEqual([0, 5, 8]);
    expect(scenarios.series.map((series) => series.label)).toEqual([
      "Giá nhà 0%/năm",
      "Giá nhà 5%/năm",
      "Giá nhà 8%/năm",
    ]);
  });

  it("calls the band scenarios and not a confidence interval", () => {
    const words = [
      scenarios.summary,
      ...scenarios.assumptions,
      RENT_VS_BUY.scenarioChart.scenarioNote,
    ].join(" ");
    expect(words).toContain("kịch bản");
    expect(words).toContain("không phải khoảng tin cậy");
    expect(words).not.toContain("dự báo giá nhà là");
  });

  it("scopes the verdict to the horizon and all four assumptions", () => {
    const scope = fill(RENT_VS_BUY.form.verdictScope, {
      months: "120",
      growth: "5%",
      rentGrowth: "4%",
      investment: "6%",
    });
    expect(scope).not.toMatch(/\{[a-z]+\}/i);
    expect(scope).toContain("120 tháng");
    expect(scope).toContain("5%");
    expect(scope).toContain("4%");
    expect(scope).toContain("6%");
    expect(fill(RENT_VS_BUY.form.verdictLabel, { months: "120" })).toContain(
      "120",
    );
  });

  it("lists the non-financial reasons without ranking them", () => {
    const block = RENT_VS_BUY.nonFinancial;
    expect(block.buyItems.length).toBeGreaterThan(2);
    expect(block.rentItems.length).toBeGreaterThan(2);
    const all = [
      block.intro,
      block.note,
      ...block.buyItems,
      ...block.rentItems,
    ].join(" ");
    // No verdict, and no population claim about Vietnamese buyers.
    for (const claim of ["nên mua", "nên thuê", "phần lớn người", "đa số"]) {
      expect(all, `non-financial copy claims "${claim}"`).not.toContain(claim);
    }
    expect(block.note).toContain("không phải kết quả nghiên cứu");
  });
});
