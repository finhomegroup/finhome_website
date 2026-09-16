/**
 * Two (or three) value paths over time, each with its own meaning.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `value-paths-chart.test.ts`.
 *
 * WHY A SHARED ADAPTER, exactly as `debt-path-chart.ts` argues for debt.
 * Three original plan rows ask for the same picture from three different
 * engines:
 *
 * - Row 27 `phi-quy-dau-tu` — "hai đường giá trị có/không phí".
 * - Row 26 `thu-nhap-dau-tu` — "đường số dư và sức mua dưới kịch bản".
 * - Row 25 `tiet-kiem-hoc-phi` — "hai đường quỹ học phí và nhu cầu dự kiến".
 *
 * Each is "a few labelled quantities in đồng, read at the same instants,
 * where the GAP between them is the lesson". That is one plot shape with
 * three callers, not three adapters — and the alternative was three copies of
 * the same axis, sampling and table code, which is how two of them would have
 * drifted apart.
 *
 * IT COMPUTES NOTHING FINANCIAL. Callers hand in points their own engine
 * already produced — `computeFundFees(...).series`, the withdrawal
 * projection, the education-fund projection — and this module chooses the
 * axis, the sampling, the markers and the accessible table. Choosing which
 * months to draw is reading, not arithmetic.
 *
 * TWO RULES IT ENFORCES, both from defects this suite has already shipped:
 *
 * - **A path is drawn only where it exists.** A series that ends early stops;
 *   it is not continued along zero, which would read as a real balance of
 *   nothing. `debt-path-chart` learned this on a cleared loan.
 * - **And it is drawn all the way to where it ends.** The sample set is
 *   global — one stride over the whole horizon — so a path that stops before
 *   `xMax` has no point at its own last period unless the stride happens to
 *   land there. An independent review ran two paths, 0..179 and 0..1200: the
 *   short one was drawn to 170 and its 179 row was missing from the table,
 *   nine months of a drawdown deleted at exactly the end, where the lesson
 *   is. Every path's OWN first and last period is therefore mandatory, beside
 *   the caller's markers. Not a fake continuation: the endpoint is a real
 *   point the caller computed.
 * - **The axis holds every drawn point.** `niceMax` is taken over all paths,
 *   so the taller one is not clipped — and a caller whose quantity can go
 *   NEGATIVE (a fund that runs out mid-plan is not one of these, but a
 *   shortfall reading is) passes `allowNegative`, which lifts the floor to
 *   its own rung and keeps zero inside the plot. Clamping a negative to the
 *   baseline deletes the case the comparison exists to show, which is the
 *   lesson `rent-buy-chart.ts` records.
 */

import {
  axisTickLabel,
  axisUnit,
  compactMoney,
  fill,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import { formatDecimal } from "@/lib/calc/number";
import {
  countTicks,
  linearTicks,
  niceMax,
  type ChartSeries,
  type ChartTable,
  type LineChartModel,
  type SeriesPoint,
} from "@/lib/calc/charts/types";

/**
 * Points one drawn path may carry.
 *
 * 121, the same cap `debt-path-chart` uses, for the reason
 * `savings-schedule.ts` gives: a 1.200-month plan drawn point-per-month is
 * 1.200 path commands nobody can see, and the accessible table is where the
 * exact reading lives.
 */
export const MAX_VALUE_PATH_POINTS = 121;

/**
 * Paths one plot may carry.
 *
 * Three, because `ChartSeries.stroke` has exactly three non-colour channels
 * and colour is never the only channel in this suite.
 */
export const MAX_VALUE_PATHS = 3;

/** One path, already computed by the caller's own engine. */
export type ValuePath = {
  key: string;
  /** e.g. "Không phí" or "Sức mua theo giá hôm nay". */
  label: string;
  /**
   * The path's own points, in period order, starting at the period the
   * caller considers its opening position. Periods are whole numbers of the
   * caller's unit — months for the fee and withdrawal rows, years for the
   * education fund — and `labels.xAxis` is what names the unit.
   */
  points: readonly SeriesPoint[];
  /** Fill under this path. At most one path should ask for it. */
  area?: boolean;
};

export type ValuePathsLabels = MoneyWords & {
  title: string;
  /** `{label}` substituted, so a series says which quantity it is. */
  series: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  assumptions: readonly string[];
  tableCaption: string;
  tableHint: string;
  /** Heading of the default table's first column — the period. */
  periodColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

export type ValuePathsOptions = {
  /**
   * The summary sentence, already assembled by the caller.
   *
   * Passed in rather than templated here because each of the three rows says
   * a different thing about its own gap, and a shared template would end up
   * with one placeholder per caller.
   */
  summary: string;
  /** Vertical rules — the exit month, the month the fund runs out, arrival. */
  markers?: readonly { period: number; label: string }[];
  /**
   * Horizontal rules — a target balance the reader typed.
   *
   * A goal is an AMOUNT, so it is a reference and not a marker: drawing it as
   * a vertical rule at the month it happens to be reached would say the goal
   * was a date. The axis is raised to hold it, because a target above every
   * drawn point is exactly the case worth seeing.
   */
  references?: readonly { value: number; label: string }[];
  /** An exact reading of the caller's own choosing. */
  table?: ChartTable;
  /** Replaces `labels.assumptions` when the caller's table needs its own. */
  assumptions?: readonly string[];
  /** Keep zero inside the plot and allow points below it. */
  allowNegative?: boolean;
  /**
   * Replaces the shared empty-state text for a case the caller can name.
   *
   * `ChartFigure` renders `unavailable.reason` and `.recovery` INSTEAD of the
   * summary, so a caller that knows why there is nothing to draw — a goal
   * already met today has no span — has to say it here or not at all.
   */
  unavailable?: { reason: string; recovery: string };
};

function empty(
  labels: ValuePathsLabels,
  options?: ValuePathsOptions,
): LineChartModel {
  return {
    kind: "lines",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: options?.assumptions ?? labels.assumptions,
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
      options?.table ?? {
        caption: labels.tableCaption,
        columns: [{ label: labels.periodColumn, numeric: true, nowrap: true }],
        rows: [],
      },
    unavailable: options?.unavailable ?? {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/**
 * The periods to draw.
 *
 * `mandatory` is every period that must survive the stride: each path's own
 * first and last, and every marker the caller placed. The stride then fills
 * in between them up to `limit`. A period outside `[0, xMax]` or non-finite
 * is dropped rather than drawn at an edge it does not belong to.
 */
function sampledPeriods(
  xMax: number,
  mandatory: readonly number[],
  limit: number,
): number[] {
  const wanted = new Set<number>([0, xMax]);
  const stride = Math.max(1, Math.ceil((xMax + 1) / limit));
  for (let period = 0; period <= xMax; period += stride) wanted.add(period);
  for (const period of mandatory) {
    if (Number.isFinite(period) && period >= 0 && period <= xMax) {
      wanted.add(period);
    }
  }
  return [...wanted].sort((a, b) => a - b);
}

/**
 * Draw the paths.
 *
 * `unavailable` when there is nothing to draw: no path with at least two
 * points, more paths than the stroke channels can distinguish, or a
 * non-finite value anywhere. A non-finite point is refused here rather than
 * in a component, because an SVG given NaN renders an invisible broken path
 * instead of failing.
 */
export function valuePathsModel(
  paths: readonly ValuePath[],
  labels: ValuePathsLabels,
  options: ValuePathsOptions,
): LineChartModel {
  const drawable = paths.filter((path) => path.points.length >= 2);
  if (drawable.length === 0 || drawable.length > MAX_VALUE_PATHS) {
    // A summary the caller assembled is discarded here: `ChartFigure` renders
    // the reason and the recovery in place of it. `options.unavailable` is
    // where a caller names its own case.
    return empty(labels, options);
  }
  const everyValue = drawable.flatMap((path) =>
    path.points.flatMap((point) => [point.period, point.value]),
  );
  if (everyValue.some((value) => !Number.isFinite(value))) {
    return empty(labels, options);
  }

  const xMax = Math.max(
    ...drawable.map((path) => path.points[path.points.length - 1].period),
  );
  if (!(xMax > 0)) return empty(labels, options);

  // Every path's own endpoints are mandatory, not just the global ones: see
  // the 179-against-1200 case in this module's header.
  const mandatory = [
    ...drawable.flatMap((path) => [
      path.points[0].period,
      path.points[path.points.length - 1].period,
    ]),
    ...(options.markers ?? []).map((m) => m.period),
  ];
  const periods = sampledPeriods(xMax, mandatory, MAX_VALUE_PATH_POINTS);

  // One lookup per path, so a path that stops early simply has no entry at
  // the later periods and contributes no point there.
  const series: ChartSeries[] = drawable.map((path, index) => {
    const byPeriod = new Map(path.points.map((p) => [p.period, p.value]));
    return {
      key: path.key,
      label: fill(labels.series, { label: path.label }),
      stroke: (["solid", "dashed", "dotted"] as const)[index],
      area: path.area === true,
      points: periods.flatMap((period): SeriesPoint[] => {
        const value = byPeriod.get(period);
        return value === undefined ? [] : [{ period, value }];
      }),
    };
  });

  // A reference line is inside the axis, not clipped by it: a target the
  // plan does not reach is the case a goal line exists to show.
  const referenceValues = (options.references ?? [])
    .map((reference) => reference.value)
    .filter((value) => Number.isFinite(value));
  const values = [
    ...drawable.flatMap((path) => path.points.map((p) => p.value)),
    ...referenceValues,
  ];
  const highest = Math.max(...values, 0);
  const lowest = Math.min(...values, 0);
  const yMax = niceMax(highest);
  // A SIGNED axis is not a positive one with minus signs on it: each end gets
  // its own rung and zero stays inside the plot. See `rent-buy-chart.ts`.
  const yMin =
    options.allowNegative && lowest < 0 ? -niceMax(Math.abs(lowest)) : 0;

  return {
    kind: "lines",
    title: labels.title,
    summary: options.summary,
    assumptions: options.assumptions ?? labels.assumptions,
    series,
    markers: [...(options.markers ?? [])],
    references: [...(options.references ?? [])],
    xAxis: {
      label: labels.xAxis,
      // `countTicks`, NOT `linearTicks`: this axis carries whole periods, and
      // equal intervals with a rounding formatter drew "0, 1, 2, 2, 3" on a
      // three-year plan. See `countTicks` in `types.ts`.
      ticks: countTicks(xMax, 5, (value) =>
        Number.isInteger(value)
          ? formatDecimal(value, 0)
          : formatDecimal(value, 1),
      ),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit: axisUnit(yMax, labels) }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMin,
    yMax,
    step: false,
    table:
      options.table ?? {
        caption: labels.tableCaption,
        hint: labels.tableHint,
        columns: [
          { label: labels.periodColumn, numeric: true, nowrap: true },
          ...drawable.map((path) => ({ label: path.label, numeric: true })),
        ],
        rows: periods.map((period) => [
          String(period),
          ...drawable.map((path) => {
            const value = path.points.find((p) => p.period === period)?.value;
            return value === undefined ? "" : compactMoney(value, labels);
          }),
        ]),
      },
    unavailable: null,
  };
}
