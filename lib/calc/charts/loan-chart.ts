/**
 * The mortgage chart for /cong-cu/vay-mua-nha/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `loan-chart.test.ts`.
 *
 * Stacked columns of interest and principal per period, with the outstanding
 * balance drawn over them on its own axis. Every figure comes from the SAME
 * `LoanResult.schedule` the headline and the yearly table are built from —
 * this module aggregates and labels it and computes nothing financial.
 *
 * TWO GRANULARITIES, both bounded on purpose:
 *
 * - `"year"` collapses the schedule with `yearlySummary`, giving 20–30
 *   columns for a Vietnamese mortgage. This is the default and it matches the
 *   table the page already shows.
 * - `"firstMonths"` shows the opening months one at a time, capped at 24. A
 *   borrower inspecting the split wants the first two years, not month 197,
 *   and 240 monthly rows in an accessible table is not an alternative to a
 *   picture — it is a worse picture.
 * - `"window"` shows the same 24-month span, but positioned anywhere in the
 *   term. ORIGINAL ROW 6 asks `/cong-cu/phan-tich-khoan-vay/` to let a reader
 *   examine an arbitrary month, and a chart permanently stuck on months 1–24
 *   cannot answer a question about month 152. The mortgage page's two modes
 *   are unchanged; the window is used only where that examination happens.
 *
 * The cap is why the summary states the window: a chart of 24 months that did
 * not say which 24 would read as the whole loan.
 */

import type { LoanResult } from "@/lib/calc/loan";
import { yearlySummary } from "@/lib/calc/loan";
import {
  axisTickLabel,
  axisUnit,
  compactMoney,
  fill,
  fullMoney,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import {
  linearTicks,
  niceMax,
  type BarSegment,
  type ChartColumn,
  type ColumnChartModel,
} from "@/lib/calc/charts/types";
import { moneyCell } from "@/lib/calc/table-cell";

/** How finely the chart splits the schedule, and where. */
export type LoanChartGranularity = "year" | "firstMonths" | "window";

/** The most months `"firstMonths"` will ever draw. */
export const FIRST_MONTHS_WINDOW = 24;

export type LoanChartLabels = MoneyWords & {
  title: string;
  interest: string;
  principal: string;
  balance: string;
  /** `{n}` is substituted: "Năm {n}". */
  yearTick: string;
  /** `{n}` is substituted: "Tháng {n}". */
  monthTick: string;
  xAxisYear: string;
  xAxisMonth: string;
  /** `{unit}` is substituted with the magnitude word. */
  yAxis: string;
  overlayAxis: string;
  /** `{interest}`, `{principal}`, `{periods}` substituted. */
  summaryYear: string;
  /** `{window}`, `{interest}`, `{principal}` substituted. */
  summaryMonths: string;
  /**
   * `"window"` mode only: `{from}`, `{to}`, `{month}`, `{interest}`,
   * `{principal}` substituted.
   *
   * Optional, so the mortgage page's label block is unchanged. A caller that
   * asks for `"window"` without it falls back to `summaryMonths`, which states
   * the length of the window but not where it sits.
   */
  summaryWindow?: string;
  /** Appended when an extra payment is in the schedule. */
  extraNote: string;
  /** Named after the repayment method in force. */
  methodAnnuity: string;
  methodFlatPrincipal: string;
  assumptions: readonly string[];
  tableCaption: string;
  periodColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** An empty model, so a caller never has to handle `null`. */
function unavailable(labels: LoanChartLabels): ColumnChartModel {
  return {
    kind: "columns",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    columns: [],
    legend: [],
    xAxis: { label: labels.xAxisYear, ticks: [] },
    yAxis: { label: fill(labels.yAxis, { unit: labels.currency }), ticks: [] },
    yMax: 0,
    overlay: null,
    overlayAxis: null,
    overlayMax: 0,
    table: {
      caption: labels.tableCaption,
      columns: [
        // "Năm 1" is one token: the founder's screenshot had it broken across
        // two lines beside a figure that ran into the next column.
        { label: labels.periodColumn, nowrap: true },
        { label: labels.interest, numeric: true },
        { label: labels.principal, numeric: true },
        { label: labels.balance, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/**
 * Build the mortgage chart model.
 *
 * `result` may be null — an invalid form clears the chart rather than leaving
 * the previous one on screen next to new inputs, which is the stale-result
 * failure the flow contract (F03) names.
 */
export function loanChartModel(
  result: LoanResult | null,
  granularity: LoanChartGranularity,
  labels: LoanChartLabels,
  options?: {
    /**
     * `"window"` mode: the month the reader is examining, 1-based.
     *
     * The 24-month window is positioned to CONTAIN it — starting at that month
     * where the schedule allows, and sliding back from the end where it does
     * not, so the last months of a loan are reachable too. The column for this
     * month carries `emphasis`.
     */
    examineMonth?: number;
  },
): ColumnChartModel {
  if (result === null || result.schedule.length === 0) {
    return unavailable(labels);
  }

  const byYear = granularity === "year";
  const schedule = result.schedule;

  /** Where a monthly window starts, 1-based and clamped into the schedule. */
  let windowStart = 1;
  let examineMonth: number | null = null;
  if (granularity === "window") {
    const asked = options?.examineMonth;
    if (asked !== undefined && Number.isInteger(asked)) {
      examineMonth = Math.min(Math.max(asked, 1), schedule.length);
    }
    const last = Math.max(1, schedule.length - FIRST_MONTHS_WINDOW + 1);
    windowStart = Math.min(examineMonth ?? 1, last);
  }

  // One row per column, in whichever granularity was asked for.
  const rows = byYear
    ? yearlySummary(schedule).map((year) => ({
        period: year.year,
        interest: year.interest,
        principal: year.principal,
        balance: year.balance,
      }))
    : schedule
        .slice(windowStart - 1, windowStart - 1 + FIRST_MONTHS_WINDOW)
        .map((row) => ({
          period: row.period,
          interest: row.interest,
          principal: row.principal,
          balance: row.balance,
        }));

  const columns: ChartColumn[] = rows.map((row) => {
    const segments: BarSegment[] = [
      {
        key: "interest",
        label: labels.interest,
        value: row.interest,
        valueLabel: fullMoney(row.interest, labels),
      },
      {
        key: "principal",
        label: labels.principal,
        value: row.principal,
        valueLabel: fullMoney(row.principal, labels),
      },
    ];
    return {
      period: row.period,
      label: fill(byYear ? labels.yearTick : labels.monthTick, {
        n: row.period,
      }),
      segments,
      total: row.interest + row.principal,
      emphasis: examineMonth !== null && row.period === examineMonth,
    };
  });

  const yMax = niceMax(Math.max(...columns.map((column) => column.total)));
  // The balance axis is its own: the opening balance dwarfs any single
  // period's payment, and sharing one axis would flatten the columns to
  // nothing. Two axes means two titles, both stated.
  const overlayMax = niceMax(rows[0].balance + rows[0].principal);

  const unit = axisUnit(yMax, labels);
  const overlayUnit = axisUnit(overlayMax, labels);

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);

  const methodNote =
    result.method === "flatPrincipal"
      ? labels.methodFlatPrincipal
      : labels.methodAnnuity;
  let window: string;
  if (byYear) {
    window = fill(labels.summaryYear, {
      periods: rows.length,
      interest: compactMoney(totalInterest, labels),
      principal: compactMoney(totalPrincipal, labels),
    });
  } else if (granularity === "window" && labels.summaryWindow !== undefined) {
    // Which 24 months, and which one of them is being examined. A window that
    // did not say where it sits would read as the whole loan.
    window = fill(labels.summaryWindow, {
      from: rows[0].period,
      to: rows[rows.length - 1].period,
      month: examineMonth ?? rows[0].period,
      interest: compactMoney(totalInterest, labels),
      principal: compactMoney(totalPrincipal, labels),
    });
  } else {
    window = fill(labels.summaryMonths, {
      window: rows.length,
      interest: compactMoney(totalInterest, labels),
      principal: compactMoney(totalPrincipal, labels),
    });
  }
  const summary =
    window +
    ` ${methodNote}` +
    (result.monthlyExtra > 0 ? ` ${labels.extraNote}` : "");

  return {
    kind: "columns",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    columns,
    legend: [
      { key: "interest", label: labels.interest },
      { key: "principal", label: labels.principal },
    ],
    xAxis: {
      label: byYear ? labels.xAxisYear : labels.xAxisMonth,
      // Columns carry their own labels; the axis title is enough here and a
      // tick per column would collide at 30 columns.
      ticks: [],
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    yMax,
    overlay: {
      key: "balance",
      label: labels.balance,
      stroke: "dashed",
      points: rows.map((row) => ({ period: row.period, value: row.balance })),
    },
    overlayAxis: {
      label: fill(labels.overlayAxis, { unit: overlayUnit }),
      ticks: linearTicks(overlayMax, 4, (value) =>
        axisTickLabel(value, overlayMax),
      ),
    },
    overlayMax,
    table: {
      caption: labels.tableCaption,
      columns: [
        // "Năm 1" is one token: the founder's screenshot had it broken across
        // two lines beside a figure that ran into the next column.
        { label: labels.periodColumn, nowrap: true },
        { label: labels.interest, numeric: true },
        { label: labels.principal, numeric: true },
        { label: labels.balance, numeric: true },
      ],
      // Raw đồng, not the segments' own `valueLabel` strings: the table shows
      // these at two precisions and only the number can be rescaled.
      rows: columns.map((column, index) => [
        column.label,
        moneyCell(column.segments[0].value),
        moneyCell(column.segments[1].value),
        moneyCell(rows[index].balance),
      ]),
    },
    unavailable: null,
  };
}
