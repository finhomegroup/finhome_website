/**
 * Two debt paths over time, each marked where it ends.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `debt-path-chart.test.ts`.
 *
 * WHY A SHARED ADAPTER. Two education articles ask the same question of two
 * different engines: C07 puts a 240-month schedule beside a 300-month one
 * (original row "hai đường dư nợ và tổng lãi theo kỳ hạn"), and C10 puts a
 * schedule with an extra payment beside the same loan without one ("dư nợ
 * cơ bản/trả thêm; tổng chi và số tháng giảm"). Both are "two balances
 * falling at different speeds, each ending on its own month", so they are one
 * picture with two callers rather than two adapters.
 *
 * IT COMPUTES NOTHING FINANCIAL. A caller hands in balances it has already
 * read off a schedule — `computeLoan(...).schedule[i].balance` — and this
 * module chooses the axis, the sampling, the markers and the accessible
 * table. Mapping rows to points is reading, not arithmetic; there is no
 * amortization here and no second engine anywhere in the education
 * collection.
 *
 * MONTH 0 IS THE OPENING BALANCE. `amortize` pushes CLOSING balances, so a
 * path drawn from schedule rows alone starts one month in and understates
 * the debt at the start. The caller passes `openingBalance` and it is the
 * first point of every path, which is also what makes two paths on one loan
 * visibly start from the same place.
 */

import {
  axisTickLabel,
  axisUnit,
  compactMoney,
  fill,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import {
  linearTicks,
  niceMax,
  type ChartSeries,
  type ChartTable,
  type LineChartModel,
  type SeriesPoint,
} from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { countCell, moneyCell, type TableCell } from "@/lib/calc/table-cell";

/** Points one drawn path may carry, for the reason in `savings-schedule.ts`. */
export const MAX_DEBT_PATH_POINTS = 121;

/** Rows the default accessible table may hold. */
const MAX_TABLE_ROWS = 13;

/**
 * Paths one plot may carry.
 *
 * Three, because `ChartSeries.stroke` has exactly three non-colour channels
 * and colour is never the only channel in this suite. Both callers pass two.
 */
export const MAX_DEBT_PATHS = 3;

/** One debt path, already read off a schedule by the caller. */
export type DebtPath = {
  key: string;
  /** e.g. "20 năm" or "Trả thêm 2 triệu". */
  label: string;
  /**
   * Closing balance for month 1, 2, 3 … in order, ending at 0 on the month
   * the debt is cleared. The opening balance is supplied separately.
   */
  balances: readonly number[];
  /** Interest over this path's whole life, for the summary. */
  totalInterest: number;
};

export type DebtPathLabels = MoneyWords & {
  title: string;
  /** `{label}` substituted, so a series says which path it is. */
  series: string;
  /** `{label}` and `{month}` substituted. */
  payoffMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /**
   * `{first}`, `{firstMonths}`, `{firstInterest}`, `{second}`,
   * `{secondMonths}`, `{secondInterest}`, `{interestGap}`, `{monthGap}`
   * substituted. Used when there are exactly two paths.
   */
  summary: string;
  /** Used instead when only one path could be drawn. `{first}` etc. */
  summaryOnePath: string;
  /** Always appended: the interest figures are nominal, not discounted. */
  nominalNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  tableHint: string;
  monthColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

function empty(labels: DebtPathLabels, table?: ChartTable): LineChartModel {
  return {
    kind: "lines",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    series: [],
    markers: [],
    references: [],
    xAxis: { label: labels.xAxis, ticks: [] },
    yAxis: { label: fill(labels.yAxis, { unit: labels.currency }), ticks: [] },
    xMax: 0,
    yMin: 0,
    yMax: 0,
    step: false,
    table:
      table ?? {
        caption: labels.tableCaption,
        columns: [{ label: labels.monthColumn, numeric: true, nowrap: true }],
        rows: [],
      },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/** The months to draw, with every path's own payoff month kept. */
function sampledMonths(
  xMax: number,
  keep: readonly number[],
  limit: number,
): number[] {
  const wanted = new Set<number>([0, xMax]);
  const stride = Math.max(1, Math.ceil((xMax + 1) / limit));
  for (let month = 0; month <= xMax; month += stride) wanted.add(month);
  for (const month of keep) {
    if (Number.isInteger(month) && month >= 0 && month <= xMax) {
      wanted.add(month);
    }
  }
  return [...wanted].sort((a, b) => a - b);
}

/**
 * The balance a path owes at the end of `month`.
 *
 * Null past the path's own last month: a debt that is gone has no balance to
 * report, and drawing it along zero would suggest the loan is still running.
 * Month 0 is the shared opening balance.
 */
function balanceAt(
  path: DebtPath,
  openingBalance: number,
  month: number,
): number | null {
  if (month === 0) return openingBalance;
  const balance = path.balances[month - 1];
  return balance === undefined ? null : balance;
}

/**
 * Two (or three) debt paths, each ending on its own month.
 *
 * `options.table` lets a caller supply an exact reading of its own — the
 * education articles hand in their endpoint comparison, the same override
 * C08 and C09 use — and `options.assumptions` travels with it, because the
 * default list describes the per-month table this one replaces.
 */
export function debtPathsModel(
  paths: readonly DebtPath[],
  openingBalance: number,
  labels: DebtPathLabels,
  options?: { table?: ChartTable; assumptions?: readonly string[] },
): LineChartModel {
  const assumptions = options?.assumptions ?? labels.assumptions;
  const withAssumptions = { ...labels, assumptions };
  const drawable = paths.filter((path) => path.balances.length > 0);
  if (
    drawable.length === 0 ||
    drawable.length > MAX_DEBT_PATHS ||
    !Number.isFinite(openingBalance) ||
    openingBalance <= 0
  ) {
    return empty(withAssumptions, options?.table);
  }

  const payoffMonths = drawable.map((path) => path.balances.length);
  const xMax = Math.max(...payoffMonths);
  const months = sampledMonths(xMax, payoffMonths, MAX_DEBT_PATH_POINTS);

  const series: ChartSeries[] = drawable.map((path, index) => ({
    key: path.key,
    label: fill(labels.series, { label: path.label }),
    stroke: (["solid", "dashed", "dotted"] as const)[index],
    // Filled under the FIRST path only: two overlapping fills cannot be read,
    // and `ChartSeries.area` fills from zero.
    area: index === 0,
    points: months.flatMap((month): SeriesPoint[] => {
      const balance = balanceAt(path, openingBalance, month);
      return balance === null ? [] : [{ period: month, value: balance }];
    }),
  }));

  const yMax = niceMax(openingBalance);

  const [first, second] = drawable;
  const summary =
    second === undefined
      ? fill(labels.summaryOnePath, {
          first: first.label,
          firstMonths: formatDecimal(payoffMonths[0], 0),
          firstInterest: compactMoney(first.totalInterest, labels),
        })
      : fill(labels.summary, {
          first: first.label,
          firstMonths: formatDecimal(payoffMonths[0], 0),
          firstInterest: compactMoney(first.totalInterest, labels),
          second: second.label,
          secondMonths: formatDecimal(payoffMonths[1], 0),
          secondInterest: compactMoney(second.totalInterest, labels),
          interestGap: compactMoney(
            Math.abs(second.totalInterest - first.totalInterest),
            labels,
          ),
          monthGap: formatDecimal(
            Math.abs(payoffMonths[1] - payoffMonths[0]),
            0,
          ),
        });

  return {
    kind: "lines",
    title: labels.title,
    summary: `${summary} ${labels.nominalNote}`,
    assumptions,
    series,
    // One marker per path, at the month its own debt reaches zero.
    markers: drawable.map((path, index) => ({
      period: payoffMonths[index],
      label: fill(labels.payoffMarker, {
        label: path.label,
        month: formatDecimal(payoffMonths[index], 0),
      }),
    })),
    references: [],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit: axisUnit(yMax, labels) }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMin: 0,
    yMax,
    step: false,
    table:
      options?.table ?? {
        caption: labels.tableCaption,
        hint: labels.tableHint,
        columns: [
          { label: labels.monthColumn, numeric: true, nowrap: true },
          ...drawable.map((path) => ({ label: path.label, numeric: true })),
        ],
        rows: sampledMonths(xMax, payoffMonths, MAX_TABLE_ROWS).map(
          (month): TableCell[] => [
            countCell(month),
            ...drawable.map((path) => {
              const balance = balanceAt(path, openingBalance, month);
              return balance === null ? null : moneyCell(balance);
            }),
          ],
        ),
      },
    unavailable: null,
  };
}
