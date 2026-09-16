/**
 * Two value paths — with fees and without — to the date the money is needed.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `fund-fees-chart.test.ts`.
 *
 * Original row 27's visual, in the plan's own words: "hai đường giá trị
 * có/không phí", on a horizon anchored to "mốc cần mua nhà". Every number
 * comes from `computeFundFees`; this module chooses the labels, the marker and
 * the accessible table, and `value-paths-chart.ts` chooses the axis.
 *
 * THE LINE ENDS BEFORE THE EXIT FEE, AND THE FIGURE SAYS SO. `series` carries
 * the balance before the single exit charge, at every month including the
 * last — on the audit's 36-month fixture that is 743.356.975,93, while the
 * money the reader can actually take out is 739.640.191,05. Those are
 * different quantities and the difference is a real charge, so:
 *
 * - the drawn path ends at the BEFORE-exit balance, because that is what the
 *   account holds on that day;
 * - a marker at the horizon names the exit fee, so the drop is visible as an
 *   event rather than as a missing data point;
 * - the table lists both figures on their own rows, and the summary quotes
 *   the AFTER-exit one as the money received.
 *
 * Drawing the exit as a step down in the line was rejected: the fee is taken
 * when the reader sells, not during the month, and a line that falls on the
 * last segment implies a market movement that did not happen.
 *
 * THE DIFFERENCE IS STATED IN MONEY FIRST. The row asks for it explicitly —
 * "đặt chênh lệch sau phí trước thuật ngữ" — because the page used to lead
 * with a percentage of forgone profit, which is the more dramatic number and
 * the less usable one. The summary opens with đồng.
 *
 * AND THE GAP IS NOT THE FEES. On that fixture the fees charged total
 * 47.841.386,32 while the terminal wealth differs by 52.081.487,10: the
 * remainder is the growth the money taken as fees would have produced. Both
 * appear, labelled differently, because conflating them understates the cost.
 *
 * BUT THE GAP IS NOT ALWAYS LARGER, AND THE SENTENCE IS PICKED FROM THE
 * FIGURES. The note used to assert unconditionally that the gap exceeds the
 * fees, "phần dư ra là số lãi". An independent review reproduced the opposite
 * on the live page: 500 triệu, no contributions, 12 months at −50% gross with
 * a 20% entry fee charges 100 triệu of fees for a 50 triệu gap, because the
 * money taken as a fee would have LOST half its value too. At a zero return
 * the two coincide, and with every fee at zero both are zero. So the note
 * states the two quantities and then says which way this scenario fell —
 * three sentences in the content file, chosen here.
 */

import { compactMoney, fill, fullMoney } from "@/lib/calc/charts/labels";
import type { LineChartModel } from "@/lib/calc/charts/types";
import {
  valuePathsModel,
  type ValuePathsLabels,
} from "@/lib/calc/charts/value-paths-chart";
import { moneyCell } from "@/lib/calc/table-cell";
import type { FundFeesResult } from "@/lib/calc/fund-fees";

export type FundFeesChartLabels = ValuePathsLabels & {
  /** Legend/series name for the fee-free path. */
  grossPath: string;
  /** Legend/series name for the path that pays the fees. */
  netPath: string;
  /** Marker at the horizon. `{fee}` substituted. */
  exitMarker: string;
  /** Marker at the horizon when no exit fee was entered. */
  exitMarkerNone: string;
  /** `{months}`, `{gross}`, `{net}`, `{gap}` substituted. Money first. */
  summary: string;
  /**
   * Always appended: the two quantities, stated without ranking them.
   * `{fees}`, `{gap}` substituted.
   */
  gapNote: string;
  /** Appended when the gap EXCEEDS the fees — the usual, growing case. */
  gapAboveFees: string;
  /** Appended when the fees exceed the gap, which needs a falling market. */
  gapBelowFees: string;
  /** Appended when the two are the same figure. */
  gapEqualsFees: string;
  /** Appended when an exit fee applies. `{beforeExit}`, `{afterExit}`. */
  exitNote: string;
  /** Appended when no fee of any kind was entered. */
  noFeeNote: string;
  itemColumn: string;
  amountColumn: string;
  paidRow: string;
  grossRow: string;
  beforeExitRow: string;
  exitFeeRow: string;
  afterExitRow: string;
  gapRow: string;
  feesRow: string;
};

/**
 * The band inside which "the gap" and "the fees" are the same figure.
 *
 * Absolute, in đồng, because the page renders whole đồng: a residue smaller
 * than the smallest unit shown is not a difference. Paired with a relative
 * term for the far end of the range, where a double's own spacing on a 1e15 ₫
 * balance is already larger than a đồng.
 */
const GAP_TIE_DONG = 1;
const GAP_TIE_RELATIVE = 1e-12;

/**
 * The two paths, the exit marker and the endpoint ledger.
 *
 * `unavailable` when there is no result. A result always has at least two
 * points, because `computeFundFees` refuses a zero month count.
 */
export function fundFeesChartModel(
  result: FundFeesResult | null,
  labels: FundFeesChartLabels,
): LineChartModel {
  if (result === null) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const months = result.series[result.series.length - 1].month;
  const beforeExit = result.series[result.series.length - 1].net;

  // The exact reading, money first. Typed cells so `ResultTable` states one
  // unit for the block and keeps the exact đồng behind its checkbox — the
  // figures here span 680 triệu to 3,7 triệu, which is the spread that makes
  // a compact unit worth choosing (docs §3).
  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    columns: [
      { label: labels.itemColumn },
      { label: labels.amountColumn, numeric: true },
    ],
    rows: [
      [labels.paidRow, moneyCell(result.totalContributed)],
      [labels.grossRow, moneyCell(result.grossValue)],
      [labels.beforeExitRow, moneyCell(beforeExit)],
      [labels.exitFeeRow, moneyCell(-result.exitFee)],
      [labels.afterExitRow, moneyCell(result.netValue)],
      [labels.gapRow, moneyCell(result.valueLost)],
      [labels.feesRow, moneyCell(result.totalFees)],
    ],
  };

  // MONEY FIRST, then the two things the money does not say on its own.
  let summary = fill(labels.summary, {
    months: String(months),
    gross: fullMoney(result.grossValue, labels),
    net: fullMoney(result.netValue, labels),
    gap: fullMoney(result.valueLost, labels),
  });
  summary += ` ${fill(labels.gapNote, {
    fees: fullMoney(result.totalFees, labels),
    gap: fullMoney(result.valueLost, labels),
  })}`;
  // Which way this scenario fell. Banded, because both sides are sums of
  // floats and at a zero return they are the same quantity computed two ways:
  // a bare `===` would take the equal case to one of the ranked sentences on
  // a rounding residue. One đồng, or the relative residue at this magnitude,
  // whichever is larger — the figures are rendered as whole đồng, so a
  // difference under that is not a difference the reader can see.
  const tie = Math.max(
    GAP_TIE_DONG,
    Math.abs(result.valueLost) * GAP_TIE_RELATIVE,
  );
  const gapOverFees = result.valueLost - result.totalFees;
  if (Math.abs(gapOverFees) <= tie) {
    summary += ` ${labels.gapEqualsFees}`;
  } else if (gapOverFees > 0) {
    summary += ` ${labels.gapAboveFees}`;
  } else {
    summary += ` ${labels.gapBelowFees}`;
  }
  if (result.exitFee > 0) {
    summary += ` ${fill(labels.exitNote, {
      beforeExit: fullMoney(beforeExit, labels),
      afterExit: fullMoney(result.netValue, labels),
    })}`;
  }
  if (result.totalFees === 0) summary += ` ${labels.noFeeNote}`;

  return valuePathsModel(
    [
      {
        key: "gross",
        label: labels.grossPath,
        points: result.series.map((p) => ({ period: p.month, value: p.gross })),
        area: true,
      },
      {
        key: "net",
        label: labels.netPath,
        points: result.series.map((p) => ({ period: p.month, value: p.net })),
      },
    ],
    labels,
    {
      summary,
      // The horizon is marked whether or not a fee is charged there: it is the
      // date the reader chose, and the plan row is about anchoring to it.
      markers: [
        {
          period: months,
          label:
            result.exitFee > 0
              ? fill(labels.exitMarker, {
                  fee: compactMoney(result.exitFee, labels),
                })
              : labels.exitMarkerNone,
        },
      ],
      table,
    },
  );
}
