/**
 * The two debt paths for the card-payoff workspace — original rows 29/30's
 * "đường dư nợ theo hai mức trả" and "hai đường dư nợ + hai mốc hết nợ".
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `card-chart.test.ts`.
 *
 * THE CURVES AND THE DATES COME FROM THE SAME SCHEDULE. Each point is a row
 * of a `card-debt.ts` schedule and each marker is that schedule's own length
 * turned into a date by `planCardPayoff`. Nothing here divides a balance by a
 * payment to estimate a month, and nothing interpolates a date between two
 * drawn points: the two would drift apart on exactly the paths where the
 * difference matters, because a declining minimum is not linear.
 *
 * THE DRAWING IS BOUNDED. A minimum-payment schedule at a low floor runs for
 * years — 125 months on the acceptance fixture, up to the card module's own
 * 1.200-month ceiling — so the points are thinned to `MAX_CARD_POINTS` with
 * both payoff months kept whatever the stride works out to.
 */

import type { CardPath, CardPlanResult } from "@/lib/calc/card-plan";
import { formatDecimal } from "@/lib/calc/number";
import type { CalendarDate } from "@/lib/calc/dates";
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
  type LineChartModel,
  type SeriesPoint,
} from "@/lib/calc/charts/types";
import { countCell, moneyCell, type TableCell } from "@/lib/calc/table-cell";

/** Points one drawn balance path may carry. */
export const MAX_CARD_POINTS = 121;

/** Rows the accessible table may hold. */
const MAX_TABLE_ROWS = 13;

export type CardChartLabels = MoneyWords & {
  title: string;
  /** `{strategy}` substituted with the path's own name. */
  series: string;
  /** `{strategy}`, `{months}`, `{date}` substituted. */
  payoffMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{plan}`, `{planMonths}`, `{planDate}`, `{planInterest}` substituted. */
  summary: string;
  /**
   * Appended when there are two paths. `{comparison}`,
   * `{comparisonMonths}`, `{comparisonDate}`, `{monthsDifference}`,
   * `{interestDifference}` substituted.
   */
  comparisonNote: string;
  /** Appended instead when the other path has no schedule at all. */
  noComparisonNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  tableHint: string;
  monthColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
  /** One per `CardPathStrategy`, so a series says which rule it follows. */
  strategyFixed: string;
  strategyTarget: string;
  strategyMinimum: string;
  /** `{extra}` substituted, for a minimum path with an extra on top. */
  strategyMinimumPlus: string;
  /** `{payment}` substituted with the level the flat path holds. */
  strategyMinimumFlat: string;
};

/** A date as the page writes it: 15/7/2028. */
function showDate(date: CalendarDate): string {
  return `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;
}

/**
 * The reader-facing name of the rule a path actually follows.
 *
 * Takes the PATH, not the bare strategy, because two of the four names need
 * an amount to be true: "Chỉ trả mức tối thiểu" is the wrong name for a
 * minimum with 1 triệu on top, and the flat comparison is only meaningful
 * with the level it holds. Compact money, because this string is also a table
 * column heading.
 */
export function strategyName(
  path: Pick<CardPath, "strategy" | "extraPerMonth" | "levelPayment">,
  labels: CardChartLabels,
): string {
  if (path.strategy === "fixed") return labels.strategyFixed;
  if (path.strategy === "target") return labels.strategyTarget;
  if (path.strategy === "minimum") {
    return path.extraPerMonth > 0
      ? fill(labels.strategyMinimumPlus, {
          extra: compactMoney(path.extraPerMonth, labels),
        })
      : labels.strategyMinimum;
  }
  return fill(labels.strategyMinimumFlat, {
    payment:
      path.levelPayment === null
        ? ""
        : compactMoney(path.levelPayment, labels),
  });
}

/**
 * The balance a path owes at the end of a given month.
 *
 * Month 0 is the balance before any payment; past the path's own payoff month
 * there is nothing owed and nothing to draw, which is why the caller stops
 * each series at its own length rather than continuing it along zero.
 */
function balanceAt(path: CardPath, month: number): number | null {
  if (month === 0) return path.startingBalance;
  const row = path.result.schedule[month - 1];
  return row === undefined ? null : row.balance;
}

/** The months to draw, with both payoff months kept. */
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

function empty(
  labels: CardChartLabels,
  reason: string,
  recovery: string,
): LineChartModel {
  return {
    kind: "lines",
    title: labels.title,
    summary: reason,
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
    table: {
      caption: labels.tableCaption,
      columns: [{ label: labels.monthColumn, numeric: true, nowrap: true }],
      rows: [],
    },
    unavailable: { reason, recovery },
  };
}

/**
 * Both debt paths over time, each marked at its own payoff month and date.
 *
 * `unavailable` — with the reason and what to change — whenever there is no
 * plan to draw. A plan whose COMPARISON could not be built still draws: one
 * real path is a real answer, and the summary says the other one has none.
 */
export function cardPathsModel(
  plan: CardPlanResult | null,
  labels: CardChartLabels,
): LineChartModel {
  if (plan === null || plan.plan.result.schedule.length === 0) {
    return empty(labels, labels.unavailableReason, labels.unavailableRecovery);
  }

  const paths: CardPath[] = [plan.plan];
  if (plan.comparison !== null) paths.push(plan.comparison);

  const xMax = Math.max(...paths.map((path) => path.months));
  const months = sampledMonths(
    xMax,
    paths.map((path) => path.months),
    MAX_CARD_POINTS,
  );

  const series = paths.map((path, index) => ({
    key: path.strategy,
    label: fill(labels.series, {
      strategy: strategyName(path, labels),
    }),
    stroke: (index === 0 ? "solid" : "dashed") as "solid" | "dashed",
    area: index === 0,
    points: months.flatMap((month): SeriesPoint[] => {
      const balance = balanceAt(path, month);
      // A PATH THAT HAS ENDED HAS NO BALANCE TO DRAW. The faster path stops
      // at its own payoff month rather than running along zero, which is
      // also where its marker sits.
      return balance === null ? [] : [{ period: month, value: balance }];
    }),
  }));

  const yMax = niceMax(
    Math.max(...series.flatMap((line) => line.points.map((p) => p.value))),
  );
  const unit = axisUnit(yMax, labels);

  let summary = fill(labels.summary, {
    plan: strategyName(plan.plan, labels),
    planMonths: formatDecimal(plan.plan.months, 0),
    planDate: showDate(plan.plan.payoffDate),
    planInterest: compactMoney(plan.plan.result.totalInterest, labels),
  });
  summary +=
    plan.comparison === null || plan.monthsDifference === null
      ? ` ${labels.noComparisonNote}`
      : ` ${fill(labels.comparisonNote, {
          comparison: strategyName(plan.comparison, labels),
          comparisonMonths: formatDecimal(plan.comparison.months, 0),
          comparisonDate: showDate(plan.comparison.payoffDate),
          monthsDifference: formatDecimal(
            Math.abs(plan.monthsDifference),
            0,
          ),
          interestDifference: compactMoney(
            Math.abs(plan.interestDifference ?? 0),
            labels,
          ),
        })}`;

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series,
    markers: paths.map((path) => ({
      period: path.months,
      label: fill(labels.payoffMarker, {
        strategy: strategyName(path, labels),
        months: formatDecimal(path.months, 0),
        date: showDate(path.payoffDate),
      }),
    })),
    references: [],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMin: 0,
    yMax,
    step: false,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      columns: [
        { label: labels.monthColumn, numeric: true, nowrap: true },
        ...paths.map((path) => ({
          label: strategyName(path, labels),
          numeric: true,
        })),
      ],
      rows: sampledMonths(
        xMax,
        paths.map((path) => path.months),
        MAX_TABLE_ROWS,
      ).map((month): TableCell[] => [
        countCell(month),
        ...paths.map((path) => {
          const balance = balanceAt(path, month);
          return balance === null ? null : moneyCell(balance);
        }),
      ]),
    },
    unavailable: null,
  };
}
