import type { RefinanceResult } from "@/lib/calc/refinance";
import { axisTickLabel, axisUnit, compactMoney, fill, type MoneyWords } from "@/lib/calc/charts/labels";
import { niceMax, type LineChartModel } from "@/lib/calc/charts/types";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { formatDecimal } from "@/lib/calc/number";

export type RefinanceChartLabels = MoneyWords & {
  title: string; series: string; xAxis: string; yAxis: string;
  zeroReference: string; horizonMarker: string; breakEvenMarker: string;
  summary: string; assumptions: readonly string[];
  tableCaption: string; tableHint: string; monthColumn: string; savingColumn: string;
  oldDebtColumn: string; newDebtColumn: string;
  unavailableReason: string; unavailableRecovery: string;
  /**
   * The SECOND line: money already spent, before any account is taken of the
   * debt still owed.
   *
   * Two distinct measures need two distinct lines, two distinct markers and
   * two distinct labels. A reader who sees one "break-even" cannot know which
   * of the two it is, and on the same fixture they are months apart — 14 and
   * 18 on the education article's, and 14 and 10 once the new term is
   * stretched, which is the case where cash-flow relief arrives FIRST and the
   * economics arrive later.
   */
  cashSeries: string;
  /** `{month}` substituted. The cash-flow crossing, never the cost one. */
  cashBreakEvenMarker: string;
  /** `{cash}` substituted. Appended so the two measures cannot be merged. */
  cashNote: string;
  /** `{cost}`, `{cash}` substituted. Appended when the two crossings differ. */
  breakEvenGapNote: string;
  cashColumn: string;
};

/**
 * Projection adapter only: never reconstructs a loan or cash-flow ledger.
 *
 * TWO LINES, TWO MARKERS, TWO LABELS. `costSaving` counts the debt still
 * owed; `cashFlowSaving` counts only money already handed over. They are
 * different questions with different answers — original row 2 and C12 both
 * turn on not confusing them — and both are already in `result.timeline`, so
 * drawing the second one adds no arithmetic.
 */
export function refinanceChartModel(result: RefinanceResult | null, labels: RefinanceChartLabels): LineChartModel {
  const columns = [
    { label: labels.monthColumn, numeric: true },
    { label: labels.savingColumn, numeric: true },
    { label: labels.cashColumn, numeric: true },
    { label: labels.oldDebtColumn, numeric: true },
    { label: labels.newDebtColumn, numeric: true },
  ];
  const model: LineChartModel = {
    kind: "lines", title: labels.title, summary: "", assumptions: labels.assumptions,
    series: [], markers: [], references: [], xAxis: { label: labels.xAxis, ticks: [] },
    yAxis: { label: fill(labels.yAxis, { unit: labels.currency }), ticks: [] },
    xMax: 0, yMin: 0, yMax: 0, step: false,
    // Five columns do not read at 390 px even compacted, so below `md` the
    // same cells render as one block per month.
    table: { caption: labels.tableCaption, hint: labels.tableHint, mobileCards: true, columns, rows: [] },
    unavailable: { reason: labels.unavailableReason, recovery: labels.unavailableRecovery },
  };
  if (!result) return model;
  const points = result.timeline.map((r) => ({ period: r.month, value: r.costSaving }));
  const cashPoints = result.timeline.map((r) => ({ period: r.month, value: r.cashFlowSaving }));
  const magnitude = niceMax(Math.max(1, ...[...points, ...cashPoints].map((p) => Math.abs(p.value))));
  // Symmetric signed axis keeps zero explicit and supports all-negative and
  // all-zero scenarios. No negative value is clamped to the baseline.
  model.yMin = -magnitude;
  model.yMax = magnitude;
  model.xMax = Math.max(1, result.horizonMonths);
  model.yAxis = { label: fill(labels.yAxis, { unit: `${axisUnit(magnitude, labels)}${magnitude >= 1e6 ? ` ${labels.currency}` : ""}` }),
    ticks: [-1, -0.5, 0, 0.5, 1].map((n) => ({ at: (n + 1) / 2, label: axisTickLabel(n * magnitude, magnitude) })) };
  const tickMonths = [...new Set([0, Math.round(result.horizonMonths / 2), result.horizonMonths])];
  model.xAxis.ticks = tickMonths.map((month) => ({ at: month / model.xMax, label: formatDecimal(month, 0) }));
  model.series = [
    { key: "cost-saving", label: labels.series, stroke: "solid", points },
    { key: "cash-saving", label: labels.cashSeries, stroke: "dashed", points: cashPoints },
  ];
  model.references = [{ value: 0, label: labels.zeroReference }];
  model.markers = [{ period: result.horizonMonths, label: fill(labels.horizonMarker, { month: result.horizonMonths }) }];
  // Each measure gets its OWN marker and its own words. They routinely land
  // on different months, and which one arrives first depends on the term:
  // a stretched new term relieves cash flow before it pays for itself.
  if (result.breakEvenMonths !== null) model.markers.push({ period: result.breakEvenMonths, label: fill(labels.breakEvenMarker, { month: result.breakEvenMonths }) });
  if (result.cashFlowBreakEvenMonths !== null) model.markers.push({ period: result.cashFlowBreakEvenMonths, label: fill(labels.cashBreakEvenMarker, { month: result.cashFlowBreakEvenMonths }) });
  model.summary = fill(labels.summary, { month: result.horizonMonths,
    saving: compactMoney(result.horizonCostSaving, labels), oldDebt: compactMoney(result.horizon.currentBalance, labels), newDebt: compactMoney(result.horizon.newBalance, labels) });
  model.summary += ` ${fill(labels.cashNote, { cash: compactMoney(result.horizonCashFlowSaving, labels) })}`;
  if (result.breakEvenMonths !== null && result.cashFlowBreakEvenMonths !== null
    && result.breakEvenMonths !== result.cashFlowBreakEvenMonths) {
    model.summary += ` ${fill(labels.breakEvenGapNote, {
      cost: formatDecimal(result.breakEvenMonths, 0), cash: formatDecimal(result.cashFlowBreakEvenMonths, 0) })}`;
  }
  const checkpoints = new Set([0, result.horizonMonths]);
  const stride = Math.max(1, Math.ceil(result.horizonMonths / 6));
  for (let month = stride; month < result.horizonMonths; month += stride) checkpoints.add(month);
  if (result.breakEvenMonths !== null) checkpoints.add(result.breakEvenMonths);
  if (result.cashFlowBreakEvenMonths !== null) checkpoints.add(result.cashFlowBreakEvenMonths);
  model.table.rows = [...checkpoints].sort((a, b) => a - b).map((month) => {
    const r = result.timeline[month];
    return [countCell(month), moneyCell(r.costSaving), moneyCell(r.cashFlowSaving), moneyCell(r.currentBalance), moneyCell(r.newBalance)];
  });
  model.unavailable = null;
  return model;
}
