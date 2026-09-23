import { describe, it, expect } from "vitest";
import { compareRefinance } from "@/lib/calc/refinance";
import { refinanceChartModel } from "@/lib/calc/charts/refinance-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { REFINANCE } from "@/content/calculators/refinance";
import { moneyCell, countCell } from "@/lib/calc/table-cell";
import { PLOT, yFor, linePath, areaPath } from "@/lib/calc/charts/geometry";

const labels = { ...CHART_UI.money, ...REFINANCE.chart };
const base = { balance: 2e9, currentRatePercent: 11, remainingMonths: 216,
  newRatePercent: 8.5, newTermMonths: 300, closingCosts: 40e6, horizonMonths: 60 };

describe("refinance chart: two signed ledgers, kept apart", () => {
  it("uses exactly engine points; period zero and selected horizon always in typed table", () => {
    const result = compareRefinance(base)!;
    const model = refinanceChartModel(result, labels);
    // TWO measures, two series. Cost counts the debt still owed; cash counts
    // only money already handed over, and C12 exists because they differ.
    expect(model.series.map((s) => s.key)).toEqual(["cost-saving", "cash-saving"]);
    expect(new Set(model.series.map((s) => s.stroke)).size).toBe(2);
    expect(model.series[0].points).toEqual(result.timeline.map((r) => ({ period: r.month, value: r.costSaving })));
    expect(model.series[1].points).toEqual(result.timeline.map((r) => ({ period: r.month, value: r.cashFlowSaving })));
    expect(model.series[0].points[0].value).toBe(-40e6);
    expect(model.series[1].points[0].value).toBe(-40e6);
    expect(model.series[0].points.at(-1)?.value).toBe(result.horizonCostSaving);
    expect(model.series[1].points.at(-1)?.value).toBe(result.horizonCashFlowSaving);
    expect(model.table.rows[0]).toEqual([countCell(0), moneyCell(-40e6), moneyCell(-40e6), moneyCell(2e9), moneyCell(2e9)]);
    expect(model.table.rows.at(-1)).toEqual([countCell(60), moneyCell(result.horizonCostSaving), moneyCell(result.horizonCashFlowSaving), moneyCell(result.horizon.currentBalance), moneyCell(result.horizon.newBalance)]);
    expect(model.table.rows.some((r) => JSON.stringify(r[0]) === JSON.stringify(countCell(result.breakEvenMonths!)))).toBe(true);
    expect(model.table.rows.some((r) => JSON.stringify(r[0]) === JSON.stringify(countCell(result.cashFlowBreakEvenMonths!)))).toBe(true);
    expect(model.table.rows.length).toBeLessThanOrEqual(10);
    // Five columns cannot be read at 390 px even compacted.
    expect(model.table.mobileCards).toBe(true);
    expect(model.references).toEqual([{ value: 0, label: labels.zeroReference }]);
    expect(model.yAxis.label).toContain("triệu");
    expect(model.yAxis.label).toContain("₫");
    expect(model.summary).not.toMatch(/\{\w+\}/);
  });
  it("gives each break-even its own marker and its own words", () => {
    const result = compareRefinance(base)!;
    const model = refinanceChartModel(result, labels);
    const markers = model.markers.map((m) => m.label);
    expect(result.breakEvenMonths).not.toBe(result.cashFlowBreakEvenMonths);
    expect(markers).toContain(`Chi phí bù đủ phí lần đầu: tháng ${result.breakEvenMonths}`);
    expect(markers).toContain(`Tiền đã chi bù đủ phí lần đầu: tháng ${result.cashFlowBreakEvenMonths}`);
    // And the two months are still stated as two, so one cannot be read as
    // the other — in the figure's labelled disclosure, §8b, because the
    // caption above the plot was five sentences. What stays visible is the
    // pair of markers above and what a negative value means on each line.
    expect(model.detail?.title).toBe(labels.detailTitle);
    expect(model.detail?.body).toContain("Hai mốc khác nhau");
    expect(model.detail?.body).toContain("Chênh lệch tiền đã chi tại mốc đó");
    expect(model.detail?.body).not.toMatch(/\{\w+\}/);
    expect(model.summary).not.toContain("Hai mốc khác nhau");
    expect(model.summary).not.toMatch(/\{\w+\}/);
    // The sign guard is NOT in the disclosure: it decides how the picture is
    // read at all.
    expect(model.summary).toContain("chưa nói gì về lợi ích kinh tế");
  });
  it("all-negative costs remain negative, with a centered zero line", () => {
    const result = compareRefinance({ ...base, currentRatePercent: 8.5, remainingMonths: 120, newTermMonths: 240 })!;
    const model = refinanceChartModel(result, labels);
    expect(model.series[0].points.every((p) => p.value < 0)).toBe(true);
    expect(model.yMin).toBeLessThan(result.horizonCostSaving);
    expect(model.yMax).toBe(-model.yMin);
    expect(model.yAxis.ticks.find((t) => t.label === "0,0")?.at).toBe(0.5);
    // The horizon rule, plus a cash crossing where one exists. No COST
    // crossing here: this fixture never pays for itself inside the horizon.
    expect(result.breakEvenMonths).toBeNull();
    expect(model.markers.map((m) => m.period)).toEqual(
      result.cashFlowBreakEvenMonths === null
        ? [result.horizonMonths]
        : [result.horizonMonths, result.cashFlowBreakEvenMonths],
    );
  });
  it.each([0, 1, 2, 7, 60, 400, 1200])("supports horizon %s without fractional or repeated month ticks", (horizonMonths) => {
    const r = compareRefinance({ ...base, horizonMonths })!;
    const model = refinanceChartModel(r, labels);
    expect(model.series[0].points).toHaveLength(horizonMonths + 1);
    expect(new Set(model.xAxis.ticks.map((t) => t.label)).size).toBe(model.xAxis.ticks.length);
    expect(model.xAxis.ticks.every((t) => !t.label.includes(","))).toBe(true);
    expect(model.table.rows.at(-1)?.[0]).toEqual(countCell(horizonMonths));
  });
  it("clears all data on invalid, then rebuilds deterministically", () => {
    const result = compareRefinance(base)!;
    const valid = refinanceChartModel(result, labels);
    const invalid = refinanceChartModel(null, labels);
    expect(invalid.unavailable?.recovery).toBe(labels.unavailableRecovery);
    expect(invalid.series).toEqual([]);
    expect(invalid.table.rows).toEqual([]);
    expect(invalid.markers).toEqual([]);
    expect(invalid.references).toEqual([]);
    expect(refinanceChartModel(result, labels)).toEqual(valid);
  });
  it("all-zero equality remains a drawable finite model", () => {
    const r = compareRefinance({ ...base, newRatePercent: 11, newTermMonths: 216, closingCosts: 0 })!;
    const m = refinanceChartModel(r, labels);
    expect(m.yMax).toBeGreaterThan(m.yMin);
    expect(m.series[0].points.every((p) => p.value === 0)).toBe(true);
    expect(m.unavailable).toBeNull();
  });
});

describe("shared signed line geometry with zero-default compatibility", () => {
  it("maps min, zero and max to separate correct coordinates", () => {
    expect(yFor(-100, 100, PLOT, -100)).toBe(PLOT.bottom);
    expect(yFor(0, 100, PLOT, -100)).toBe((PLOT.top + PLOT.bottom) / 2);
    expect(yFor(100, 100, PLOT, -100)).toBe(PLOT.top);
    expect(yFor(0, 100, PLOT)).toBe(PLOT.bottom);
  });
  // The literals below moved with `PLOT` on 2026-09-21, when the box grew into
  // the space the svg tick glyphs used to need: bottom 168 → 210, so the
  // midpoint is 110 rather than 89. Kept LITERAL rather than recomputed from
  // `yFor`, which is the function under test — the point is that a real path
  // string comes out with the negative end at the floor and zero in the middle.
  it("draws negative and positive points, not a clipped negative flatline", () => {
    const p = [{ period: 0, value: -100 }, { period: 1, value: 0 }, { period: 2, value: 100 }];
    expect(linePath(p, 2, 100, PLOT, false, -100)).toBe("M 42 210 L 197 110 L 352 10");
    expect(linePath(p, 2, 100, PLOT, true, -100)).toBe("M 42 210 L 197 210 L 197 110 L 352 110 L 352 10");
    expect(areaPath(p, 2, 100, PLOT, false, -100)).toContain("L 352 110 L 42 110 Z");
  });
  it("also maps an all-negative domain ending at zero", () => {
    expect(yFor(-50, 0, PLOT, -100)).toBe(110);
    expect(linePath([{ period: 0, value: -100 }, { period: 1, value: 0 }], 1, 0, PLOT, false, -100)).toBe("M 42 210 L 352 10");
  });
});
