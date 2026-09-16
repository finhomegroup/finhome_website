/**
 * The shared debt-path adapter's own contract.
 *
 * The FIGURES it carries are pinned against the independent references in
 * `content/education/visual-references.test.ts`, where they arrive through
 * `computeLoan`. What this file checks is what the adapter decides for
 * itself: the opening point, where each path stops, the markers, the axis,
 * the sampling bound and the empty state.
 */
import { describe, expect, it } from "vitest";
import {
  debtPathsModel,
  MAX_DEBT_PATH_POINTS,
  MAX_DEBT_PATHS,
  type DebtPath,
} from "@/lib/calc/charts/debt-path-chart";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { computeLoan } from "@/lib/calc/loan";
import { isMoneyCell } from "@/lib/calc/table-cell";

const LABELS = EDUCATION_VISUAL_LABELS.debtPaths;

/** A short loan, so a whole path fits in a readable assertion. */
function pathOf(
  key: string,
  label: string,
  termMonths: number,
  extraPerMonth = 0,
): DebtPath {
  const loan = computeLoan({
    amount: 120_000_000,
    annualRatePercent: 12,
    termMonths,
    extraPerMonth,
  })!;
  return {
    key,
    label,
    balances: loan.schedule.map((row) => row.balance),
    totalInterest: loan.totalInterest,
  };
}

describe("debtPathsModel", () => {
  const shorter = pathOf("a", "12 tháng", 12);
  const longer = pathOf("b", "24 tháng", 24);
  const model = debtPathsModel([shorter, longer], 120_000_000, LABELS);

  it("opens both paths at the shared opening balance, not month 1", () => {
    // `amortize` pushes CLOSING balances, so a path drawn from rows alone
    // starts one month in and understates the debt at the start.
    for (const series of model.series) {
      expect(series.points[0]).toEqual({ period: 0, value: 120_000_000 });
    }
    expect(model.yMax).toBeGreaterThanOrEqual(120_000_000);
    expect(model.yMin).toBe(0);
  });

  it("gives each path its own non-colour channel", () => {
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.series.map((s) => s.key)).toEqual(["a", "b"]);
    expect(model.series[0].area).toBe(true);
    // Only the first is filled: two overlapping fills from zero cannot be
    // read against each other.
    expect(model.series[1].area).toBeFalsy();
  });

  it("stops each path at its own payoff month and marks it there", () => {
    expect(model.xMax).toBe(24);
    expect(model.series[0].points.at(-1)).toEqual({ period: 12, value: 0 });
    expect(model.series[1].points.at(-1)).toEqual({ period: 24, value: 0 });
    expect(model.markers.map((m) => m.period)).toEqual([12, 24]);
    expect(model.markers[0].label).toContain("12 tháng");
  });

  it("blanks a table cell past a path's own horizon", () => {
    const months = model.table.rows.map((r) =>
      typeof r[0] === "object" && r[0] !== null && r[0].kind === "count"
        ? r[0].value
        : Number.NaN,
    );
    expect(months).toContain(12);
    expect(months).toContain(24);
    const past = model.table.rows.find(
      (r) =>
        typeof r[0] === "object" &&
        r[0] !== null &&
        r[0].kind === "count" &&
        r[0].value > 12,
    )!;
    // The shorter path has ended: a placeholder, never a 0 balance that
    // reads as a loan still running.
    expect(past[1]).toBeNull();
    expect(isMoneyCell(past[2])).toBe(true);
  });

  it("agrees with its own table at every tabulated month", () => {
    for (const row of model.table.rows) {
      const month =
        typeof row[0] === "object" && row[0] !== null && row[0].kind === "count"
          ? row[0].value
          : Number.NaN;
      model.series.forEach((series, index) => {
        const point = series.points.find((p) => p.period === month);
        const cell = row[index + 1];
        if (point === undefined) {
          expect(cell).toBeNull();
          return;
        }
        expect(isMoneyCell(cell)).toBe(true);
        if (isMoneyCell(cell)) {
          expect(Math.abs(cell.value - point.value)).toBeLessThan(1e-6);
        }
      });
    }
  });

  it("names both paths, both payoff months and the interest gap", () => {
    expect(model.summary).toContain("12 tháng");
    expect(model.summary).toContain("24 tháng");
    expect(model.summary).toContain(LABELS.nominalNote);
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
    expect(model.yAxis.label).not.toMatch(/\{[a-z]+\}/i);
  });

  it("uses the one-path sentence when only one path is given", () => {
    const one = debtPathsModel([shorter], 120_000_000, LABELS);
    expect(one.series).toHaveLength(1);
    expect(one.markers).toHaveLength(1);
    expect(one.summary).not.toMatch(/\{[a-z]+\}/i);
    expect(one.table.columns).toHaveLength(2);
  });

  it("bounds the drawn points on a long schedule", () => {
    const long = debtPathsModel(
      [pathOf("x", "300 tháng", 300), pathOf("y", "360 tháng", 360)],
      120_000_000,
      LABELS,
    );
    expect(long.xMax).toBe(360);
    for (const series of long.series) {
      expect(series.points.length).toBeLessThanOrEqual(
        MAX_DEBT_PATH_POINTS + 2,
      );
    }
    expect(long.table.rows.length).toBeLessThanOrEqual(15);
  });

  it("refuses more paths than it can tell apart without colour", () => {
    const four = [shorter, longer, pathOf("c", "36", 36), pathOf("d", "48", 48)];
    expect(four.length).toBeGreaterThan(MAX_DEBT_PATHS);
    const refused = debtPathsModel(four, 120_000_000, LABELS);
    expect(refused.series).toHaveLength(0);
    expect(refused.unavailable?.reason).toBe(LABELS.unavailableReason);
  });

  it("explains itself when there is nothing to draw", () => {
    for (const [paths, opening] of [
      [[], 120_000_000],
      [[shorter], 0],
      [[shorter], Number.NaN],
      [[{ ...shorter, balances: [] }], 120_000_000],
    ] as const) {
      const empty = debtPathsModel(paths, opening, LABELS);
      expect(empty.series).toHaveLength(0);
      expect(empty.table.rows).toHaveLength(0);
      expect(empty.unavailable?.recovery).toBe(LABELS.unavailableRecovery);
    }
  });

  it("takes an exact table and its own assumptions from a caller", () => {
    const table = {
      caption: "x",
      columns: [{ label: "a" }, { label: "b", numeric: true }],
      rows: [["Tổng lãi", "1 ₫"]],
    };
    const overridden = debtPathsModel([shorter, longer], 120_000_000, LABELS, {
      table,
      assumptions: ["một giả định"],
    });
    expect(overridden.table).toBe(table);
    expect(overridden.assumptions).toEqual(["một giả định"]);
    // And the override survives the empty state, so a broken hypothetical
    // still renders the article's own figures.
    expect(debtPathsModel([], 0, LABELS, { table }).table).toBe(table);
  });
});
