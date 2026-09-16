/**
 * Building a `BarChartModel` — the generic part, shared by every bar adapter.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `bars.test.ts`.
 *
 * These four helpers were written inside `affordability-chart.ts` and were
 * about to be written a third and fourth time for the vehicle-budget, the
 * fund-allocation and the commute comparisons, all of which are the same
 * shape: a few labelled totals, each made of named segments. Nothing here is
 * financial — it is segment filtering, summing, axis bounds and the accessible
 * table — which is exactly the part that should exist once.
 *
 * Two rules the helpers keep, and the reason each exists:
 *
 * - **A zero segment is not drawn and not tabulated.** A 0 ₫ "phí" segment is
 *   a legend entry and a table row claiming a charge that was not made.
 * - **The table is the chart cell for cell.** Every segment of every bar, then
 *   the bar's own total, in RAW đồng via `moneyCell` — so the table can restate
 *   the figures in one compact unit and behind the exact-đồng checkbox without
 *   ever parsing a formatted string back into a number (docs §4).
 */

import {
  axisTickLabel,
  axisUnit,
  fill,
  fullMoney,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import {
  linearTicks,
  niceMax,
  type BarChartModel,
  type BarSegment,
  type StackedBar,
} from "@/lib/calc/charts/types";
import { moneyCell } from "@/lib/calc/table-cell";

/**
 * The smallest ledger difference this layer treats as money.
 *
 * Half a đồng, the smallest unit anybody transacts in. Used only to decide
 * whether a remainder EXISTS; nothing is rounded by it.
 */
export const LEDGER_RESIDUE_DONG = 0.5;

/** The words every bar model needs regardless of what it is about. */
export type BarFrameLabels = MoneyWords & {
  title: string;
  /** `{unit}` substituted. */
  axis: string;
  assumptions: readonly string[];
  tableCaption: string;
  itemColumn: string;
  amountColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/**
 * A bar model with nothing to draw, carrying its own reason and recovery.
 *
 * Not an error state: "you have not said what your essential costs are" is a
 * real answer, and `ChartFigure` renders the two sentences in place of an axis.
 */
export function emptyBars(labels: BarFrameLabels): BarChartModel {
  return {
    kind: "bars",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    bars: [],
    max: 0,
    axis: { label: fill(labels.axis, { unit: labels.currency }), ticks: [] },
    legend: [],
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.itemColumn },
        { label: labels.amountColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/** A segment, skipped entirely when it is zero or negative. */
export function segment(
  key: string,
  label: string,
  value: number,
  words: MoneyWords,
): BarSegment | null {
  if (!(value > 0)) return null;
  return { key, label, value, valueLabel: fullMoney(value, words) };
}

/** One bar from its segments, nulls dropped and the total summed from what is left. */
export function barOf(
  key: string,
  label: string,
  segments: (BarSegment | null)[],
  words: MoneyWords,
  emphasis?: boolean,
): StackedBar {
  const kept = segments.filter((s): s is BarSegment => s !== null);
  const total = kept.reduce((sum, s) => sum + s.value, 0);
  return {
    key,
    label,
    total,
    totalLabel: fullMoney(total, words),
    segments: kept,
    emphasis,
  };
}

/** Finish a bar model: axis bounds and the table, from the bars themselves. */
export function finishBars(
  bars: StackedBar[],
  legend: { key: string; label: string }[],
  axisTemplate: string,
  words: MoneyWords,
  common: {
    title: string;
    summary: string;
    assumptions: readonly string[];
    tableCaption: string;
    itemColumn: string;
    amountColumn: string;
  },
): BarChartModel {
  const max = niceMax(Math.max(...bars.map((bar) => bar.total), 0));
  return {
    kind: "bars",
    title: common.title,
    summary: common.summary,
    assumptions: common.assumptions,
    bars,
    max,
    axis: {
      label: fill(axisTemplate, { unit: axisUnit(max, words) }),
      ticks: linearTicks(max, 4, (value) => axisTickLabel(value, max)),
    },
    legend,
    table: {
      caption: common.tableCaption,
      columns: [
        { label: common.itemColumn },
        { label: common.amountColumn, numeric: true },
      ],
      // Every segment of every bar, then the bar's own total: the table is the
      // chart cell for cell, not a summary of it. Raw đồng, not the segment's
      // `valueLabel`, so the table can restate them in one compact unit.
      //
      // The item column deliberately does NOT get `nowrap`: these labels are
      // prose ("Giá nhà — Tiền của bạn") and holding them on one line would
      // force the table wider than a phone.
      rows: bars.flatMap((bar) => [
        ...bar.segments.map((s) => [
          `${bar.label} — ${s.label}`,
          moneyCell(s.value),
        ]),
        [bar.label, moneyCell(bar.total)],
      ]),
    },
    unavailable: null,
  };
}
