/**
 * The two debt paths as a chart model — original rows 29/30.
 *
 * The figures come from `card-plan.test.ts`'s independent reference table
 * (50 triệu at 30%/năm: fixed 3 triệu clears in 22 months, the declining
 * minimum at 5%/200k in 125). What this file checks is the adapter's own
 * contract: that the curves, the markers, the dates and the accessible table
 * all come off the same schedules, that a path which has ended is not drawn
 * along zero, and that the drawing is bounded.
 */
import { describe, expect, it } from "vitest";
import { planCardPayoff, type CardPlanInput } from "@/lib/calc/card-plan";
import {
  cardPathsModel,
  MAX_CARD_POINTS,
  strategyName,
} from "@/lib/calc/charts/card-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import { isMoneyCell, type TableCell } from "@/lib/calc/table-cell";

const LABELS = { ...CHART_UI.money, ...CARD_PAYOFF.chart };

const BASE: CardPlanInput = {
  balance: 50_000_000,
  annualRatePercent: 30,
  strategy: "fixed",
  monthlyPayment: 3_000_000,
  minimumPercent: 5,
  minimumFloor: 200_000,
  start: { year: 2026, month: 9, day: 15 },
  householdBudget: 3_000_000,
};

function modelOf(input: Partial<CardPlanInput> = {}) {
  return cardPathsModel(planCardPayoff({ ...BASE, ...input }), LABELS);
}

function monthOf(cell: TableCell): number {
  return typeof cell === "object" && cell !== null && cell.kind === "count"
    ? cell.value
    : Number.NaN;
}

describe("cardPathsModel", () => {
  it("draws both paths, each with a non-colour channel", () => {
    const model = modelOf();
    expect(model.unavailable).toBeNull();
    expect(model.series.map((series) => series.key)).toEqual([
      "fixed",
      "minimum",
    ]);
    expect(model.series.map((series) => series.stroke)).toEqual([
      "solid",
      "dashed",
    ]);
    expect(model.xMax).toBe(125);
  });

  it("starts both paths at the same balance", () => {
    const model = modelOf();
    for (const series of model.series) {
      expect(series.points[0].period).toBe(0);
      expect(series.points[0].value).toBe(50_000_000);
    }
  });

  it("stops the faster path at its own payoff month", () => {
    // Not continued along zero: the balance does not exist after the debt is
    // clear, and the marker is what says where it ended.
    const model = modelOf();
    const fixed = model.series[0];
    expect(fixed.points.at(-1)!.period).toBe(22);
    expect(fixed.points.at(-1)!.value).toBe(0);
    expect(model.series[1].points.at(-1)!.period).toBe(125);
  });

  it("marks each payoff with its month AND its date, from the plan", () => {
    const model = modelOf();
    expect(model.markers.map((marker) => marker.period)).toEqual([22, 125]);
    expect(model.markers[0].label).toContain("tháng 22");
    expect(model.markers[0].label).toContain("15/7/2028");
    expect(model.markers[1].label).toContain("tháng 125");
    expect(model.markers[1].label).toContain("15/2/2037");
    for (const marker of model.markers) {
      expect(marker.label).not.toMatch(/\{[a-z]+\}/i);
    }
  });

  it("names the rule each line follows", () => {
    const model = modelOf();
    expect(model.series[0].label).toContain(CARD_PAYOFF.chart.strategyFixed);
    expect(model.series[1].label).toContain(CARD_PAYOFF.chart.strategyMinimum);
    expect(strategyName(
      { strategy: "target", extraPerMonth: 0, levelPayment: 1 },
      LABELS,
    )).toBe(CARD_PAYOFF.chart.strategyTarget);
  });

  it("names the actual rule, including an extra on top of the minimum", () => {
    // "Chỉ trả mức tối thiểu" is the wrong name for a minimum with 1 triệu
    // added, and the flat comparison holds a level that includes that extra —
    // so both labels have to carry the amount.
    const plain = modelOf({ strategy: "minimum" });
    expect(plain.series[0].label).toContain(CARD_PAYOFF.chart.strategyMinimum);
    expect(plain.series[1].label).toContain("Giữ nguyên khoản trả tháng đầu");
    // 2.563.261,48 ₫ held flat.
    expect(plain.series[1].label).toContain("2,6 triệu");

    const plus = modelOf({ strategy: "minimum", extraPerMonth: 1_000_000 });
    expect(plus.series[0].label).toContain("Mức tối thiểu + 1,0 triệu");
    // The flat path now holds the first minimum PLUS that extra.
    expect(plus.series[1].label).toContain("3,6 triệu");
    // And the comparison against a level plan is the minimum-only rule, with
    // no extra to name.
    const fixed = modelOf({ extraPerMonth: 1_000_000 });
    expect(fixed.series[1].label).toContain(CARD_PAYOFF.chart.strategyMinimum);
    expect(fixed.series[1].label).not.toContain("+");
  });

  it("says both dates and the gap in its own summary", () => {
    const model = modelOf();
    expect(model.summary).toContain("15/7/2028");
    expect(model.summary).toContain("15/2/2037");
    expect(model.summary).toContain("22 tháng");
    expect(model.summary).toContain("125 tháng");
    expect(model.summary).toContain("103 tháng");
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("agrees with its own table, and blanks a path that has ended", () => {
    const model = modelOf();
    let blanks = 0;
    for (const row of model.table.rows) {
      const month = monthOf(row[0]);
      expect(Number.isInteger(month)).toBe(true);
      model.series.forEach((series, index) => {
        const point = series.points.find((p) => p.period === month);
        const cell = row[index + 1];
        if (point === undefined) {
          // Past a path's own payoff month: the placeholder, not a zero that
          // reads like a balance anyone still has.
          expect(cell).toBeNull();
          blanks += 1;
          return;
        }
        expect(isMoneyCell(cell)).toBe(true);
        if (isMoneyCell(cell)) {
          expect(Math.abs(cell.value - point.value)).toBeLessThan(1e-6);
        }
      });
    }
    expect(blanks).toBeGreaterThan(0);
    expect(model.table.rows.map((row) => monthOf(row[0]))).toContain(22);
    expect(model.table.rows.map((row) => monthOf(row[0]))).toContain(125);
  });

  it("keeps the y axis above the opening balance", () => {
    const model = modelOf();
    expect(model.yMin).toBe(0);
    expect(model.yMax).toBeGreaterThanOrEqual(50_000_000);
  });

  it("bounds the drawn points on a very long schedule", () => {
    const model = modelOf({
      strategy: "minimum",
      minimumPercent: 1,
      minimumFloor: 1,
    });
    if (model.unavailable !== null) return;
    for (const series of model.series) {
      expect(series.points.length).toBeLessThanOrEqual(MAX_CARD_POINTS + 2);
    }
    expect(model.table.rows.length).toBeLessThanOrEqual(15);
  });

  it("draws one path when the other has no schedule", () => {
    const model = modelOf({ minimumPercent: 0, minimumFloor: 0 });
    expect(model.unavailable).toBeNull();
    expect(model.series).toHaveLength(1);
    expect(model.markers).toHaveLength(1);
    expect(model.summary).toContain(CARD_PAYOFF.chart.noComparisonNote);
    expect(model.table.columns).toHaveLength(2);
  });

  it("explains itself when there is nothing to draw", () => {
    const model = cardPathsModel(null, LABELS);
    expect(model.series).toHaveLength(0);
    expect(model.table.rows).toHaveLength(0);
    expect(model.unavailable?.reason).toBe(
      CARD_PAYOFF.chart.unavailableReason,
    );
    expect(model.unavailable?.recovery).toBe(
      CARD_PAYOFF.chart.unavailableRecovery,
    );
  });

  it("draws the minimum-plan view too, with the flat comparison", () => {
    const model = modelOf({ strategy: "minimum" });
    expect(model.series.map((series) => series.key)).toEqual([
      "minimum",
      "minimumFlat",
    ]);
    expect(model.xMax).toBe(125);
    expect(model.markers.map((marker) => marker.period)).toEqual([125, 28]);
    expect(model.markers[1].label).toContain("15/1/2029");
  });
});
