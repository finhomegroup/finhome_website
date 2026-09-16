/**
 * The two row-8 pictures, against the supervisor's independent fixture.
 *
 * Every figure asserted here was computed OUTSIDE this codebase — direct
 * amortization plus a closed-form effective-annual growth, no production
 * imports — and is recorded in
 * `../../../../artifacts/finhome-tools-audit-2026-09-14/rent-card-current-review.md`:
 *
 * | month | 0 | 12 | 36 | 60 |
 * |---|---:|---:|---:|---:|
 * | rent net cost | 0 | 87.840.000 | 266.298.624 | 447.936.416,0064 |
 * | buy net cost @ 0%/năm | 120.000.000 | 332.896.641,871266 | 747.280.540,604949 | 1.144.128.119,341705 |
 * | buy net cost @ 3%/năm | 120.000.000 | 244.696.641,871266 | 474.663.160,604949 | 675.862.340,899705 |
 * | buy net cost @ 6%/năm | 120.000.000 | 156.496.641,871266 | 185.693.500,604949 | 149.744.921,197705 |
 *
 * Buying is first ahead and stays ahead from month 25, at 6%/năm only.
 *
 * The adapter's own contract is narrower than those numbers: it must not
 * compute any of them. So the assertions here are of two kinds — the figures
 * it PASSES THROUGH, which are checked against the references above, and the
 * things it decides for itself: bounds, sampling, labels, markers, and the
 * fact that a negative net cost survives the trip to the axis.
 */
import { describe, expect, it } from "vitest";
import {
  compareGrowthScenarios,
  compareRentVsBuy,
  growthScenarioRates,
  MAX_RENT_BUY_MONTHS,
  type RentVsBuyInput,
} from "@/lib/calc/rent-vs-buy";
import {
  MAX_SCENARIO_SERIES,
  MAX_TRAJECTORY_POINTS,
  rentBuyScenariosModel,
  rentBuyTrajectoryModel,
} from "@/lib/calc/charts/rent-buy-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import { isMoneyCell, type TableCell } from "@/lib/calc/table-cell";

const REFERENCE: RentVsBuyInput = {
  price: 3_000_000_000,
  downPayment: 900_000_000,
  purchaseCosts: 60_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyOwnerCosts: 3_000_000,
  priceGrowthPercent: 3,
  sellingCostPercent: 2,
  monthlyRent: 12_000_000,
  rentGrowthPercent: 3,
  rentDeposit: 24_000_000,
  investmentReturnPercent: 6,
  horizonMonths: 60,
};

/**
 * The independent REVERSAL fixture: buying is first ahead in month 90 and
 * last ahead in month 302, and by month 360 renting is ahead by
 * 1.999.592.145,235119 ₫ — so `breakEvenMonth` is null while "buying was
 * never ahead" would be false. Recorded in `rent-card-current-review.md`.
 */
const REVERSAL: RentVsBuyInput = {
  price: 3_000_000_000,
  downPayment: 900_000_000,
  purchaseCosts: 60_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyOwnerCosts: 2_500_000,
  priceGrowthPercent: 4,
  sellingCostPercent: 2,
  monthlyRent: 15_000_000,
  rentGrowthPercent: 4,
  rentDeposit: 24_000_000,
  investmentReturnPercent: 10,
  horizonMonths: 360,
};

/** The page's own labels, so a missing string is a red test and not a blank. */
const TRAJECTORY = { ...CHART_UI.money, ...RENT_VS_BUY.chart };
const SCENARIOS = { ...CHART_UI.money, ...RENT_VS_BUY.scenarioChart };

/** A hundredth of a đồng on a nine-figure accumulation. */
const DONG = 1e-2;

function trajectoryOf(input: RentVsBuyInput) {
  return rentBuyTrajectoryModel(compareRentVsBuy(input), TRAJECTORY);
}

function seriesValue(
  model: ReturnType<typeof rentBuyTrajectoryModel>,
  key: string,
  month: number,
): number {
  const line = model.series.find((series) => series.key === key)!;
  return line.points.find((point) => point.period === month)!.value;
}

function money(cell: TableCell): number {
  expect(isMoneyCell(cell)).toBe(true);
  return isMoneyCell(cell) ? cell.value : NaN;
}

/** The month each table row is about, read off its own count cell. */
function monthOf(cell: TableCell): number {
  return typeof cell === "object" && cell !== null && cell.kind === "count"
    ? cell.value
    : Number.NaN;
}

function tabulatedMonths(model: { table: { rows: TableCell[][] } }): number[] {
  return model.table.rows.map((row) => monthOf(row[0]));
}

describe("rentBuyTrajectoryModel — the two net-cost lines", () => {
  it("draws exactly the two sides, with a non-colour channel each", () => {
    const model = trajectoryOf(REFERENCE);
    expect(model.unavailable).toBeNull();
    expect(model.series.map((series) => series.key)).toEqual(["buy", "rent"]);
    expect(new Set(model.series.map((series) => series.stroke)).size).toBe(2);
    expect(model.kind).toBe("lines");
  });

  it("passes the independent trajectory through unchanged", () => {
    for (const [growth, expected] of [
      [0, [120_000_000, 332_896_641.871266, 747_280_540.604949, 1_144_128_119.341705]],
      [3, [120_000_000, 244_696_641.871266, 474_663_160.604949, 675_862_340.899705]],
      [6, [120_000_000, 156_496_641.871266, 185_693_500.604949, 149_744_921.197705]],
    ] as const) {
      const model = trajectoryOf({ ...REFERENCE, priceGrowthPercent: growth });
      const months = [0, 12, 36, 60];
      months.forEach((month, index) => {
        expect(
          Math.abs(seriesValue(model, "buy", month) - expected[index]),
          `buy at ${growth}% growth, month ${month}`,
        ).toBeLessThan(DONG);
      });
    }
  });

  it("starts the buy line at the entry-plus-exit cost, not at zero", () => {
    // Month 0 under an immediate modelled sale: 60 triệu to buy and 2% of the
    // unchanged price to sell. The renter is level.
    const model = trajectoryOf(REFERENCE);
    expect(seriesValue(model, "buy", 0)).toBeCloseTo(120_000_000, 6);
    expect(seriesValue(model, "rent", 0)).toBe(0);
  });

  it("passes the independent rent path through unchanged", () => {
    const model = trajectoryOf(REFERENCE);
    for (const [month, expected] of [
      [0, 0],
      [12, 87_840_000],
      [36, 266_298_624],
      [60, 447_936_416.0064],
    ] as const) {
      expect(
        Math.abs(seriesValue(model, "rent", month) - expected),
        `rent at month ${month}`,
      ).toBeLessThan(DONG);
    }
  });

  it("ends both lines on the figures the headline reports", () => {
    const result = compareRentVsBuy(REFERENCE)!;
    const model = rentBuyTrajectoryModel(result, TRAJECTORY);
    expect(Math.abs(seriesValue(model, "buy", 60) - result.buy.netCost))
      .toBeLessThan(DONG);
    expect(Math.abs(seriesValue(model, "rent", 60) - result.rent.netCost))
      .toBeLessThan(DONG);
  });

  it("marks the crossing only where there is one", () => {
    const at6 = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 6 });
    expect(at6.markers.map((marker) => marker.period)).toContain(25);
    expect(at6.summary).toContain("25");
    const at3 = trajectoryOf(REFERENCE);
    expect(at3.markers.map((marker) => marker.period)).toEqual([60]);
    expect(at3.summary).toContain(RENT_VS_BUY.chart.noBreakEvenNote);
  });

  it("does not say buying was NEVER ahead when it was ahead and overtaken", () => {
    // Independent reversal fixture: buying is first ahead in month 90 and
    // last ahead in month 302, and by month 360 renting is ahead by
    // 1.999.592.145,235119 ₫ — so `breakEvenMonth` is null under the
    // stays-ahead-through-the-horizon definition, and "mua không lúc nào rẻ
    // hơn" would be false in the reader's favour.
    const result = compareRentVsBuy(REVERSAL)!;
    expect(result.breakEvenMonth).toBeNull();
    const ahead = result.trajectory.filter(
      (point) => point.month > 0 && point.advantageOfBuying > 0,
    );
    expect(ahead[0].month).toBe(90);
    expect(ahead[ahead.length - 1].month).toBe(302);
    expect(
      Math.abs(result.advantageOfBuying + 1_999_592_145.235119),
    ).toBeLessThan(DONG);
    // The endpoint references for the same fixture.
    const at = (month: number) =>
      result.trajectory.find((point) => point.month === month)!;
    expect(Math.abs(at(120).buyNetCost - 564_866_628.685458)).toBeLessThan(DONG);
    expect(Math.abs(at(120).rentNetCost - 669_356_339.478947)).toBeLessThan(DONG);
    expect(Math.abs(at(240).buyNetCost + 508_072_944.355980)).toBeLessThan(DONG);
    expect(Math.abs(at(240).rentNetCost + 885_808.918388)).toBeLessThan(DONG);
    expect(Math.abs(at(360).buyNetCost + 3_301_759_583.318695)).toBeLessThan(DONG);
    expect(Math.abs(at(360).rentNetCost + 5_301_351_728.553814)).toBeLessThan(DONG);

    const model = rentBuyTrajectoryModel(result, TRAJECTORY);
    expect(model.summary).not.toContain(RENT_VS_BUY.chart.noBreakEvenNote);
    expect(model.summary).toContain("tháng 90");
    expect(model.summary).toContain("tháng 302");
    // No crossing marker, because there is no durable crossing to mark.
    expect(model.markers.map((marker) => marker.period)).toEqual([360]);

    // AND THE SECOND FIGURE MUST AGREE WITH THE FIRST. Both sit on one page,
    // so a scenario line that was ahead for 213 months cannot be described as
    // never ahead. Only the 4%/năm scenario is asserted here: it is the one
    // the trajectory above is drawn from.
    const scenarios = compareGrowthScenarios(REVERSAL, [4])!;
    const band = rentBuyScenariosModel(scenarios, SCENARIOS);
    expect(band.summary).toContain(
      "Giá nhà 4%/năm: mua rẻ hơn trong quãng từ tháng 90 đến tháng 302",
    );
    expect(band.summary).not.toContain(
      "Giá nhà 4%/năm: mua không rẻ hơn ở tháng nào",
    );
    // Still no fake event marker for a crossing that does not exist.
    expect(band.markers).toHaveLength(0);
  });

  it("keeps the never-ahead sentence for a scenario that never was", () => {
    // The 60-month reference at 0%/năm: buying is behind at every month, so
    // the flat "không rẻ hơn ở tháng nào" sentence is the true one.
    const scenarios = compareGrowthScenarios(REFERENCE, [0])!;
    const band = rentBuyScenariosModel(scenarios, SCENARIOS);
    expect(band.summary).toContain(
      "Giá nhà 0%/năm: mua không rẻ hơn ở tháng nào trong khoảng này",
    );
    expect(band.summary).not.toContain("mua rẻ hơn trong quãng");
  });

  it("attributes a negative line to the side whose money made it negative", () => {
    // The buyer's line goes below zero on assumed house-price growth; the
    // renter's on assumed investment gain, which is their own cash. One
    // sentence for both used to call the renter's gain house appreciation.
    const buyOnly = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 12 });
    expect(buyOnly.summary).toContain(RENT_VS_BUY.chart.negativeBuyNote);
    expect(buyOnly.summary).not.toContain(RENT_VS_BUY.chart.negativeRentNote);

    // The reversal fixture takes BOTH below zero by month 360 — buy
    // −3.301.759.583 and rent −5.301.351.729 — so both halves are said.
    const both = rentBuyTrajectoryModel(
      compareRentVsBuy(REVERSAL),
      TRAJECTORY,
    );
    expect(both.summary).toContain(RENT_VS_BUY.chart.negativeBuyNote);
    expect(both.summary).toContain(RENT_VS_BUY.chart.negativeRentNote);

    // And neither sentence appears when nothing is negative.
    const positive = trajectoryOf(REFERENCE);
    expect(positive.summary).not.toContain(RENT_VS_BUY.chart.negativeNote);
    expect(positive.summary).not.toContain(RENT_VS_BUY.chart.negativeRentNote);
  });

  it("claims only the month the backward scan actually establishes", () => {
    // "Trước mốc đó thuê đang rẻ hơn" was an inference about EVERY earlier
    // month. What the scan establishes is the month immediately before.
    const model = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 6 });
    expect(model.summary).toContain("ở tháng 24 liền trước thì chưa");
    expect(model.summary).not.toContain("trước mốc đó thuê đang rẻ hơn");
    expect(model.summary).toContain("Những tháng sớm hơn có thể lúc rẻ hơn");
  });

  it("calls an exact tie a tie, not a win for renting", () => {
    // A cash purchase with every rate at 0 and no rent: both net costs are 0.
    // `buyingWins` is `advantage > 0`, so without the tie state the page
    // announces "thuê lợi hơn 0 ₫".
    const tie = compareRentVsBuy({
      price: 3_000_000_000,
      downPayment: 3_000_000_000,
      purchaseCosts: 0,
      annualRatePercent: 0,
      termMonths: 240,
      monthlyOwnerCosts: 0,
      priceGrowthPercent: 0,
      sellingCostPercent: 0,
      monthlyRent: 0,
      rentGrowthPercent: 0,
      rentDeposit: 0,
      investmentReturnPercent: 0,
      horizonMonths: 12,
    })!;
    expect(tie.buy.netCost).toBe(0);
    expect(tie.rent.netCost).toBe(0);
    expect(tie.advantageOfBuying).toBe(0);
    expect(tie.buyingWins).toBe(false);
    expect(tie.tied).toBe(true);
    const model = rentBuyTrajectoryModel(tie, TRAJECTORY);
    expect(model.summary).toContain("hai phương án tốn ngang nhau");
    // And NOT the general sentence, which would name a winner.
    expect(model.summary).not.toContain(
      `phương án ${RENT_VS_BUY.chart.winnerRent} thấp hơn`,
    );
    // A flat zero pair is still a drawable chart, not an empty state.
    expect(model.unavailable).toBeNull();
    expect(model.series[0].points.length).toBeGreaterThan(1);
  });

  it("keeps the tie band off a real difference", () => {
    // 1 ₫ is a figure a reader can act on and is NOT a tie; the band is half
    // a đồng, the smallest unit the currency has.
    const result = compareRentVsBuy({ ...REFERENCE })!;
    expect(result.tied).toBe(false);
    expect(Math.abs(result.advantageOfBuying)).toBeGreaterThan(1);
  });

  it("keeps the crossing month in the table, whatever the stride", () => {
    // A table that thinned away the month the headline names would send a
    // reader looking for a figure that is not there.
    const model = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 6 });
    expect(tabulatedMonths(model)).toContain(25);
    expect(tabulatedMonths(model)).toContain(0);
    expect(tabulatedMonths(model)).toContain(60);
  });

  it("agrees with its own table at every tabulated month", () => {
    // A chart that disagreed with its table would have to be a bug here,
    // which is the whole reason the adapter resolves both.
    const model = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 6 });
    for (const row of model.table.rows) {
      const month = monthOf(row[0]);
      expect(Number.isInteger(month)).toBe(true);
      expect(Math.abs(money(row[1]!) - seriesValue(model, "buy", month)))
        .toBeLessThan(DONG);
      expect(Math.abs(money(row[2]!) - seriesValue(model, "rent", month)))
        .toBeLessThan(DONG);
      // The advantage column is the difference of the same two figures.
      expect(Math.abs(money(row[3]!) - (money(row[2]!) - money(row[1]!))))
        .toBeLessThan(DONG);
    }
  });

  it("keeps a negative net cost negative, and says so", () => {
    // At 12%/năm the modelled gain exceeds everything the buyer paid, so the
    // net cost is genuinely below zero. Clamping it to a positive-only axis
    // would delete the case.
    const model = trajectoryOf({ ...REFERENCE, priceGrowthPercent: 12 });
    const lowest = Math.min(
      ...model.series.flatMap((series) => series.points.map((p) => p.value)),
    );
    expect(lowest).toBeLessThan(0);
    expect(model.yMin).toBeLessThan(0);
    expect(model.yMin).toBeLessThanOrEqual(lowest);
    expect(model.summary).toContain(RENT_VS_BUY.chart.negativeNote);
  });

  it("puts zero inside the plot, so the reference line is real", () => {
    const model = trajectoryOf(REFERENCE);
    expect(model.yMin).toBeLessThanOrEqual(0);
    expect(model.yMax).toBeGreaterThan(0);
    expect(model.references.map((reference) => reference.value)).toEqual([0]);
  });

  it("bounds the drawn points, whatever the horizon", () => {
    const model = trajectoryOf({
      ...REFERENCE,
      termMonths: MAX_RENT_BUY_MONTHS,
      horizonMonths: MAX_RENT_BUY_MONTHS,
    });
    expect(model.xMax).toBe(MAX_RENT_BUY_MONTHS);
    for (const series of model.series) {
      // The stride plus at most two forced checkpoints (month 0 and the
      // horizon are already in the stride's set).
      expect(series.points.length).toBeLessThanOrEqual(
        MAX_TRAJECTORY_POINTS + 2,
      );
    }
    expect(model.table.rows.length).toBeLessThanOrEqual(15);
  });

  it("leaves no placeholder unfilled in its own sentences", () => {
    const model = trajectoryOf(REFERENCE);
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
    for (const marker of model.markers) {
      expect(marker.label).not.toMatch(/\{[a-z]+\}/i);
    }
    expect(model.yAxis.label).not.toMatch(/\{[a-z]+\}/i);
  });

  it("explains itself when there is nothing to draw", () => {
    const model = rentBuyTrajectoryModel(null, TRAJECTORY);
    expect(model.series).toHaveLength(0);
    expect(model.table.rows).toHaveLength(0);
    expect(model.unavailable?.reason).toBe(
      RENT_VS_BUY.chart.unavailableReason,
    );
    expect(model.unavailable?.recovery).toBe(
      RENT_VS_BUY.chart.unavailableRecovery,
    );
    expect(model.summary).toBe(RENT_VS_BUY.chart.unavailableReason);
  });
});

describe("growthScenarioRates — the named assumptions", () => {
  it("always includes 0 and the reader's own rate", () => {
    expect(growthScenarioRates(5)).toEqual([0, 5, 8]);
    expect(growthScenarioRates(3)).toEqual([0, 3, 6]);
  });

  it("de-duplicates rather than drawing one rate three times", () => {
    expect(growthScenarioRates(0)).toEqual([0, 3]);
  });

  it("keeps a falling market, sorted", () => {
    expect(growthScenarioRates(-3)).toEqual([-3, 0]);
    expect(growthScenarioRates(-5)).toEqual([-5, -2, 0]);
  });

  it("refuses a rate the comparison itself would refuse", () => {
    expect(growthScenarioRates(-100)).toBeNull();
    expect(growthScenarioRates(Number.NaN)).toBeNull();
    expect(growthScenarioRates(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("never returns more lines than can be told apart", () => {
    for (const rate of [-99, -10, -3, 0, 0.5, 3, 5, 12, 50]) {
      expect(growthScenarioRates(rate)!.length).toBeLessThanOrEqual(
        MAX_SCENARIO_SERIES,
      );
    }
  });
});

describe("rentBuyScenariosModel — the growth-scenario band", () => {
  const scenarios = compareGrowthScenarios(REFERENCE, [0, 3, 6])!;
  const model = rentBuyScenariosModel(scenarios, SCENARIOS);

  it("draws one named line per assumption, each with its own channel", () => {
    expect(model.unavailable).toBeNull();
    expect(model.series).toHaveLength(3);
    expect(model.series.map((series) => series.stroke)).toEqual([
      "solid",
      "dashed",
      "dotted",
    ]);
    expect(model.series.map((series) => series.label)).toEqual([
      "Giá nhà 0%/năm",
      "Giá nhà 3%/năm",
      "Giá nhà 6%/năm",
    ]);
  });

  it("plots the signed advantage, from the engine's own trajectory", () => {
    // rent − buy at the horizon, per the independent references.
    const expected = [
      447_936_416.0064 - 1_144_128_119.341705,
      447_936_416.0064 - 675_862_340.899705,
      447_936_416.0064 - 149_744_921.197705,
    ];
    model.series.forEach((series, index) => {
      const last = series.points[series.points.length - 1];
      expect(last.period).toBe(60);
      expect(Math.abs(last.value - expected[index])).toBeLessThan(DONG);
    });
  });

  it("shows the reversal as a sign change, not as a clamp", () => {
    const endpoints = model.series.map(
      (series) => series.points[series.points.length - 1].value,
    );
    expect(endpoints[0]).toBeLessThan(0);
    expect(endpoints[1]).toBeLessThan(0);
    expect(endpoints[2]).toBeGreaterThan(0);
    expect(model.yMin).toBeLessThan(0);
    expect(model.yMax).toBeGreaterThan(0);
  });

  it("marks only the crossings that exist, and says the rest in prose", () => {
    // A marker is an EVENT rule on the plot: one at the horizon saying "there
    // is no crossing" draws a line where nothing happens. Only 6%/năm has a
    // durable crossing on this fixture, in month 25.
    expect(model.markers).toHaveLength(1);
    expect(model.markers[0].period).toBe(25);
    expect(model.markers[0].label).toBe("Giá nhà 6%/năm: mua có lợi từ tháng 25");
    // The other two are still stated, in the text channel — and on THIS
    // fixture they were genuinely never ahead, so the flat sentence is the
    // true one (the reversal case is asserted in its own test above).
    expect(model.summary).toContain(
      "Giá nhà 0%/năm: mua không rẻ hơn ở tháng nào trong khoảng này",
    );
    expect(model.summary).toContain(
      "Giá nhà 3%/năm: mua không rẻ hơn ở tháng nào trong khoảng này",
    );
  });

  it("rests on one rent path, because the renter does not own the house", () => {
    // The picture shows the advantage, so its lines differ ONLY by the buy
    // side. If a growth rate ever reached the renter's figures, the three
    // lines would stop being one comparison under three assumptions.
    const rentCosts = scenarios.map(
      (scenario) => scenario.result!.rent.netCost,
    );
    for (const cost of rentCosts) {
      expect(Math.abs(cost - rentCosts[0])).toBeLessThan(DONG);
    }
  });

  it("calls them scenarios, and refuses to call them an interval", () => {
    expect(model.summary).toContain("kịch bản");
    expect(model.summary).toContain("không phải khoảng tin cậy");
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("agrees with its own table", () => {
    for (const row of model.table.rows) {
      const month = monthOf(row[0]);
      model.series.forEach((series, index) => {
        const point = series.points.find((p) => p.period === month);
        const value = row[index + 1];
        if (point === undefined) {
          expect(value).toBeNull();
          return;
        }
        expect(Math.abs(money(value!) - point.value)).toBeLessThan(DONG);
      });
    }
  });

  it("refuses more lines than it can distinguish without colour", () => {
    const tooMany = compareGrowthScenarios(REFERENCE, [0, 2, 4, 6]);
    expect(tooMany).toHaveLength(4);
    const refused = rentBuyScenariosModel(tooMany, SCENARIOS);
    expect(refused.series).toHaveLength(0);
    expect(refused.unavailable?.reason).toBe(
      RENT_VS_BUY.scenarioChart.tooManyReason,
    );
  });

  it("explains itself when there is nothing to draw", () => {
    for (const empty of [null, []]) {
      const model = rentBuyScenariosModel(empty, SCENARIOS);
      expect(model.series).toHaveLength(0);
      expect(model.unavailable?.reason).toBe(
        RENT_VS_BUY.scenarioChart.unavailableReason,
      );
    }
    // A scenario list whose every member was refused by the engine is the
    // same state, not a blank axis.
    const refusedByEngine = rentBuyScenariosModel(
      [{ priceGrowthPercent: 3, result: null }],
      SCENARIOS,
    );
    expect(refusedByEngine.unavailable).not.toBeNull();
  });

  it("takes an exact accessible table from a caller, for C08", () => {
    const table = {
      caption: "x",
      columns: [{ label: "a" }, { label: "b", numeric: true }],
      rows: [["Giá nhà 3%/năm", "1 ₫"]],
    };
    const overridden = rentBuyScenariosModel(scenarios, SCENARIOS, {
      table,
      assumptions: ["một giả định"],
    });
    expect(overridden.table).toBe(table);
    expect(overridden.assumptions).toEqual(["một giả định"]);
    // And the override survives the empty state, so a broken hypothetical
    // still renders the article's own figures.
    const refused = rentBuyScenariosModel(null, SCENARIOS, { table });
    expect(refused.table).toBe(table);
  });
});
