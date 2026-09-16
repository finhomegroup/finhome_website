/**
 * The accumulation chart for /cong-cu/muc-tieu-tiet-kiem/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `savings-chart.test.ts`.
 *
 * Two series over the horizon: what the saver has put IN, and what the balance
 * actually is. The gap between them is the assumed interest, and drawing it as
 * a gap rather than as a single "total" line is the whole educational point —
 * the part of the outcome the saver controls is the lower line.
 *
 * EVERY MONTH, BALANCE AND TOTAL COMES FROM `projectSavings`. The chart does
 * not iterate the annuity relationship itself and does not round anything of
 * its own: the marker, the axis bound, the series and the accessible table all
 * read the one discrete schedule the page's headline reads. That is what stops
 * the previous state of this file, where the points were whole months but the
 * marker and the summary sat at a fractional month — three horizons on one
 * figure.
 *
 * THE DRAWING IS BOUNDED. This used to loop once per month to
 * `ceil(result.months)` with no ceiling, so a 1 ₫ monthly contribution toward
 * a 500 triệu goal asked the browser for 500 million points. The schedule caps
 * both the search and the point count; see `savings-schedule.ts`.
 *
 * NO EXTRAPOLATED SUCCESS. A plan with no answer — already funded, frozen, or
 * not fundable inside the supported horizon — comes back `unavailable` with the
 * reason and what to change, and draws nothing.
 */

import type {
  SavingsGoalMode,
  SavingsGoalResult,
} from "@/lib/calc/savings-goal";
import {
  balanceAfter,
  savingsScheduleFor,
  type SavingsSchedule,
} from "@/lib/calc/savings-schedule";
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
  type ChartTable,
  type LineChartModel,
  type SeriesPoint,
} from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";

export type SavingsChartLabels = MoneyWords & {
  title: string;
  balanceSeries: string;
  contributedSeries: string;
  targetReference: string;
  /** `{n}` substituted: "Tháng {n}". */
  goalMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{target}`, `{contributed}`, `{interest}`, `{months}` substituted. */
  summary: string;
  /** Appended always: the rate is an assumption, not a promise. */
  rateNote: string;
  /** Appended when the rate is 0, where the two lines coincide. */
  zeroRateNote: string;
  /** Appended when the line is sampled rather than drawn month by month. */
  sampledNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  monthColumn: string;
  contributedColumn: string;
  balanceColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
  /** Used when the goal is not fundable inside the supported horizon. */
  unavailableBeyondLimit: string;
  /** `{limit}` substituted with the supported horizon in months. */
  unavailableBeyondLimitRecovery: string;
  /** Used when a FIELD cannot be read, which is not an unattainable plan. */
  unavailableInvalidInput: string;
  unavailableInvalidInputRecovery: string;
};

/** How many rows the accessible table may hold. */
const MAX_TABLE_ROWS = 13;

/**
 * Labels for the two-contribution comparison below.
 *
 * A separate block from `SavingsChartLabels` because it is a different
 * picture: two accumulation PATHS against one target, with a marker on each
 * path's first funded cycle.
 */
export type SavingsPathsLabels = MoneyWords & {
  title: string;
  targetReference: string;
  /** `{n}` and `{label}` substituted: "Mức hiện tại: đủ ở kỳ {n}". */
  pathMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{base}`, `{increased}`, `{earlier}` substituted. */
  summary: string;
  /**
   * Used in place of `summary` when EVERY drawn path runs at a 0% rate.
   *
   * The positive-rate sentence says the faster path is bought by the extra
   * contributions and the interest they earn, and that the two cannot be
   * separated. At a zero rate there is no interest at all, so only the
   * contributions explain it — and the general sentence would be describing
   * an effect the figures do not contain.
   */
  summaryZeroRate: string;
  /** Used in place of `summary` when only one path funds. */
  summaryOneLeg: string;
  rateNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  monthColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** One contribution level to draw, already projected. */
export type SavingsPath = {
  key: string;
  /** e.g. "Mức hiện tại". */
  label: string;
  schedule: SavingsSchedule;
  /** The three figures the schedule ran on, so a table month off the
   * bounded sample is evaluated from the same closed form rather than
   * interpolated between two drawn points. */
  initial: number;
  contribution: number;
  monthlyRate: number;
};

/** The comparison with nothing to draw: the reason, and what to change. */
function emptyPaths(
  labels: SavingsPathsLabels,
  table?: ChartTable,
): LineChartModel {
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

/**
 * Two accumulation paths against one target, each with its attainment marker.
 *
 * ORIGINAL ROW 19 asks what changes if the saver puts more in every month, and
 * C09 teaches the same comparison. A table of two month numbers answers it
 * arithmetically; the PATHS show why the second one is not proportionally
 * shorter — which is that article's whole point.
 *
 * Every point, marker and table row comes from the `SavingsSchedule` objects
 * passed in, so the picture cannot disagree with the page that computed them.
 * No projection happens here.
 *
 * `table` may be overridden by a caller that already has an exact accessible
 * reading of the same comparison — C09's figures table, which this chart
 * replaces as the VISUAL without replacing as the DATA. A caller that
 * overrides the table must usually override `assumptions` too: the shared
 * list explains what the tool's per-month table does past an attainment
 * month, and C09's table has no month rows at all.
 */
export function savingsPathsModel(
  paths: readonly SavingsPath[],
  target: number,
  labels: SavingsPathsLabels,
  options?: { table?: ChartTable; assumptions?: readonly string[] },
): LineChartModel {
  const drawable = paths.filter(
    (path) =>
      path.schedule.months > 0 &&
      path.schedule.status !== "invalid" &&
      path.schedule.points.length > 1,
  );
  if (drawable.length === 0 || !Number.isFinite(target) || target <= 0) {
    return emptyPaths(labels, options?.table);
  }

  // The x axis runs to the LONGEST path, so the slower plan is not cut off at
  // the faster one's funded month.
  const xMax = Math.max(...drawable.map((path) => path.schedule.months));
  const yMax = niceMax(
    Math.max(target, ...drawable.map((path) => path.schedule.balance)),
  );
  const unit = axisUnit(yMax, labels);

  const funded = drawable.map((path) => path.schedule.fundedMonth);
  const both = funded.length > 1 && funded.every((month) => month !== null);
  // At a zero rate there is no interest to attribute anything to, so the
  // general sentence — which credits the extra contributions AND the interest
  // they earn — would describe an effect these figures do not contain.
  const zeroRate = drawable.every((path) => path.monthlyRate === 0);
  const summary = both
    ? fill(zeroRate ? labels.summaryZeroRate : labels.summary, {
        base: formatDecimal(funded[0]!, 0),
        increased: formatDecimal(funded[1]!, 0),
        earlier: formatDecimal(funded[0]! - funded[1]!, 0),
      })
    : labels.summaryOneLeg;

  // One row per checkpoint, with a column per path: the same months on both
  // sides, so the two curves can be read against each other.
  //
  // EVERY ATTAINMENT MONTH IS A CHECKPOINT, whatever the thinning stride
  // works out to. A table that skipped the month the headline names would
  // send a reader looking for a figure that is not there.
  const step = Math.max(1, Math.ceil(xMax / (MAX_TABLE_ROWS - 1)));
  const checkpoints = new Set<number>([xMax]);
  for (let month = 0; month < xMax; month += step) checkpoints.add(month);
  for (const path of drawable) {
    if (path.schedule.fundedMonth !== null) {
      checkpoints.add(path.schedule.fundedMonth);
    }
  }
  const months = [...checkpoints].sort((a, b) => a - b);

  return {
    kind: "lines",
    title: labels.title,
    summary: `${summary} ${labels.rateNote}`,
    assumptions: options?.assumptions ?? labels.assumptions,
    series: drawable.map((path, index) => ({
      key: path.key,
      label: path.label,
      stroke: index === 0 ? "solid" : "dashed",
      area: index === 0,
      points: path.schedule.points.map((point) => ({
        period: point.period,
        value: point.balance,
      })),
    })),
    markers: drawable.flatMap((path) =>
      path.schedule.fundedMonth === null
        ? []
        : [
            {
              period: path.schedule.fundedMonth,
              label: fill(labels.pathMarker, {
                n: formatDecimal(path.schedule.fundedMonth, 0),
                label: path.label,
              }),
            },
          ],
    ),
    references: [
      {
        value: target,
        label: `${labels.targetReference}: ${fullMoney(target, labels)}`,
      },
    ],
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
    table:
      options?.table ?? {
        caption: labels.tableCaption,
        columns: [
          { label: labels.monthColumn, numeric: true, nowrap: true },
          ...drawable.map((path) => ({ label: path.label, numeric: true })),
        ],
        rows: months.map((month) => [
          countCell(month),
          ...drawable.map((path) =>
            // A PATH THAT HAS ENDED HAS NO BALANCE TO REPORT. Each schedule
            // stops at its own horizon — the faster plan stops when it is
            // funded — and evaluating the closed form past that point would
            // keep contributing money the plan says is no longer needed. The
            // drawn line stops there, so the table stops there too: a cell
            // beyond a path's horizon is the placeholder, not an
            // extrapolation that looks precise in full-money mode.
            month > path.schedule.months
              ? null
              : moneyCell(
                  balanceAfter(
                    month,
                    path.initial,
                    path.contribution,
                    path.monthlyRate,
                  ),
                ),
          ),
        ]),
      },
    unavailable: null,
  };
}

function empty(
  labels: SavingsChartLabels,
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
      columns: [
        // A month number, right-aligned with the figures beside it and never
        // scaled: month 360 is 360 in both display modes.
        { label: labels.monthColumn, numeric: true, nowrap: true },
        { label: labels.contributedColumn, numeric: true },
        { label: labels.balanceColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: { reason, recovery },
  };
}

/**
 * Balance and contributed total at one month, read off the schedule.
 *
 * The schedule's `points` are a bounded SAMPLE, so a month the table wants may
 * not be among them. Interpolating between samples would invent a figure, so
 * the row is built from the same two closed forms the schedule uses — via the
 * schedule's own endpoints where they land, which is what the identity test
 * checks.
 */
function rowAt(
  month: number,
  initial: number,
  contribution: number,
  monthlyRate: number,
): { contributed: number; balance: number } {
  const contributed = initial + contribution * month;
  const balance =
    monthlyRate === 0
      ? contributed
      : initial * (1 + monthlyRate) ** month +
        contribution * (((1 + monthlyRate) ** month - 1) / monthlyRate);
  return { contributed, balance };
}

export function savingsChartModel(
  result: SavingsGoalResult | null,
  annualRatePercent: number,
  labels: SavingsChartLabels,
  mode: SavingsGoalMode = "contribution",
  /**
   * True when a FIELD could not be read, as distinct from a valid-but-
   * unanswerable combination. The recovery sentence is different: one asks
   * the reader to fix a typo, the other to change the plan.
   */
  fieldsInvalid = false,
): LineChartModel {
  if (fieldsInvalid) {
    return empty(
      labels,
      labels.unavailableInvalidInput,
      labels.unavailableInvalidInputRecovery,
    );
  }
  const schedule: SavingsSchedule | null = savingsScheduleFor(
    result,
    annualRatePercent,
    mode,
  );
  if (result === null || schedule === null) {
    return empty(labels, labels.unavailableReason, labels.unavailableRecovery);
  }
  if (schedule.status === "beyondLimit") {
    return empty(
      labels,
      labels.unavailableBeyondLimit,
      fill(labels.unavailableBeyondLimitRecovery, {
        limit: formatDecimal(schedule.limitMonths, 0),
      }),
    );
  }
  if (
    schedule.status === "invalid" ||
    schedule.status === "unattainable" ||
    !(schedule.months > 0)
  ) {
    return empty(labels, labels.unavailableReason, labels.unavailableRecovery);
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const months = schedule.months;

  const balance: SeriesPoint[] = schedule.points.map((point) => ({
    period: point.period,
    value: point.balance,
  }));
  const contributed: SeriesPoint[] = schedule.points.map((point) => ({
    period: point.period,
    value: point.contributed,
  }));

  // The reference line is the goal in the two goal-seeking modes and the
  // achieved balance in "what will I have"; either way it must sit inside the
  // plot, so the bound covers both it and the curve.
  const yMax = niceMax(Math.max(result.target, schedule.balance));
  const unit = axisUnit(yMax, labels);

  // The month a reader should plan around: the first whole contribution cycle
  // that covers the goal. Never the fractional estimate — that is in the
  // details, labelled as an estimate.
  const fundedMonth = schedule.fundedMonth;

  let summary = fill(labels.summary, {
    target: compactMoney(
      fundedMonth === null ? schedule.balance : result.target,
      labels,
    ),
    contributed: compactMoney(schedule.totalContributed, labels),
    interest: compactMoney(schedule.interest, labels),
    months: formatDecimal(fundedMonth === null ? months : fundedMonth, 0),
  });
  summary += ` ${labels.rateNote}`;
  if (annualRatePercent === 0) summary += ` ${labels.zeroRateNote}`;
  if (schedule.sampled) summary += ` ${labels.sampledNote}`;

  // Thin the table rather than shipping 360 rows into the page: a row per
  // month for a short goal, otherwise twelve evenly spaced checkpoints plus
  // the final month, which is always included because it is the answer.
  const step = Math.max(1, Math.ceil(months / (MAX_TABLE_ROWS - 1)));
  const tableMonths: number[] = [];
  for (let month = 0; month < months; month += step) tableMonths.push(month);
  tableMonths.push(months);

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series: [
      {
        key: "balance",
        label: labels.balanceSeries,
        stroke: "solid",
        area: true,
        points: balance,
      },
      {
        key: "contributed",
        label: labels.contributedSeries,
        stroke: "dashed",
        points: contributed,
      },
    ],
    markers:
      fundedMonth === null
        ? []
        : [
            {
              period: fundedMonth,
              label: fill(labels.goalMarker, {
                n: formatDecimal(fundedMonth, 0),
              }),
            },
          ],
    references: [
      {
        value: result.target,
        label: `${labels.targetReference}: ${fullMoney(result.target, labels)}`,
      },
    ],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(months, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax: months,
    yMin: 0,
    yMax,
    step: false,
    table: {
      caption: labels.tableCaption,
      columns: [
        // A month number, right-aligned with the figures beside it and never
        // scaled: month 360 is 360 in both display modes.
        { label: labels.monthColumn, numeric: true, nowrap: true },
        { label: labels.contributedColumn, numeric: true },
        { label: labels.balanceColumn, numeric: true },
      ],
      rows: tableMonths.map((month) => {
        const row = rowAt(month, result.initial, result.contribution, monthlyRate);
        return [
          countCell(month),
          moneyCell(row.contributed),
          moneyCell(row.balance),
        ];
      }),
    },
    unavailable: null,
  };
}
