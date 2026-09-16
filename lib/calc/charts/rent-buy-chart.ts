/**
 * The two net-cost trajectories and the named growth scenarios for
 * /cong-cu/thue-hay-mua/ and education article C08.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `rent-buy-chart.test.ts`.
 *
 * ORIGINAL ROW 8 asks for "hai đường chi phí ròng theo thời gian; dải kịch
 * bản tăng giá, không gọi là khoảng tin cậy", and those are two different
 * pictures, so this file has two adapters:
 *
 * 1. `rentBuyTrajectoryModel` — the reader's own assumptions, both net costs
 *    at every month, with the crossing marked. The endpoint verdict hides
 *    the crossing; this is where a reader sees that buying is behind for
 *    years and by how much.
 * 2. `rentBuyScenariosModel` — the SIGNED advantage (rent net cost − buy net
 *    cost) over time, one line per named house-growth assumption. Drawn as
 *    the difference rather than as six separate cost lines because the
 *    question a scenario view answers is "does the answer change", and the
 *    answer changing is this quantity crossing zero. Three lines of one
 *    quantity are readable; six lines of two are not.
 *
 * NEITHER IS A FORECAST OR AN INTERVAL. The scenario lines are the rates the
 * caller handed in, each labelled with the rate it assumed and with no
 * likelihood attached to any of them. The word used on the page is "kịch
 * bản", never "khoảng tin cậy".
 *
 * A NEGATIVE NET COST IS DRAWN, NOT CLAMPED. Under a strong growth assumption
 * the buyer's modelled gain exceeds everything they paid, so the net cost is
 * genuinely below zero — and the signed advantage is below zero whenever
 * renting is ahead, which is most of the first years. Both axes therefore
 * carry a real `yMin`, and `ChartFigure`'s reference line at 0 says where the
 * two sides are level. Clamping either to a positive-only axis would delete
 * the case the tool exists to show.
 *
 * Every figure comes from the result's own `trajectory`, which is built from
 * the same `positionsAt` the headline and the break-even scan use — so the
 * picture, the table and the verdict cannot disagree.
 */

import type {
  RentVsBuyResult,
  RentVsBuyScenario,
} from "@/lib/calc/rent-vs-buy";
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
  type ChartTable,
  type ChartTick,
  type LineChartModel,
  type SeriesPoint,
} from "@/lib/calc/charts/types";
import { formatDecimal, formatPercent } from "@/lib/calc/number";
import { countCell, moneyCell, type TableCell } from "@/lib/calc/table-cell";

/**
 * Points one drawn series may carry.
 *
 * The trajectory is one entry per month and the horizon is bounded at 1.200,
 * so a 100-year comparison would otherwise ask the browser for 1.201 path
 * segments per line. Same reasoning as `MAX_SERIES_POINTS` in
 * `savings-schedule.ts`; the number is smaller because two or three lines
 * share this plot.
 */
export const MAX_TRAJECTORY_POINTS = 121;

/** Rows the accessible table may hold. */
const MAX_TABLE_ROWS = 13;

/**
 * Scenario lines one plot may carry.
 *
 * `ChartSeries.stroke` has exactly three non-colour channels — solid, dashed,
 * dotted — and the suite's rule is that colour is never the only channel. A
 * fourth line would have to repeat one of the three, so two lines would then
 * be told apart by colour alone. `growthScenarioRates` returns at most three
 * for exactly this reason; a longer list is refused rather than drawn
 * ambiguously.
 */
export const MAX_SCENARIO_SERIES = 3;

export type RentBuyTrajectoryLabels = MoneyWords & {
  title: string;
  buySeries: string;
  rentSeries: string;
  /** The horizontal rule at 0. */
  zeroReference: string;
  /** `{month}` substituted. */
  horizonMarker: string;
  /** `{month}` substituted. */
  breakEvenMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{months}`, `{buy}`, `{rent}`, `{advantage}`, `{winner}` substituted. */
  summary: string;
  /** Replaces `summary` when the two net costs are the same figure. */
  summaryTie: string;
  winnerBuy: string;
  winnerRent: string;
  /** `{month}` and `{previous}` substituted. For a durable crossing. */
  breakEvenNote: string;
  /** Used instead when the crossing is month 1 and there is no earlier one. */
  breakEvenFirstMonthNote: string;
  /** Appended when buying is never ahead at any month of the horizon. */
  noBreakEvenNote: string;
  /**
   * Appended instead when buying WAS ahead at some months but not through
   * the horizon. `{first}` and `{last}` substituted.
   *
   * A separate sentence because `noBreakEvenNote` would be false here, and
   * false in the reader's favour: a lead that existed and was reversed is not
   * the same answer as a lead that never existed.
   */
  reversedNote: string;
  /** Appended when any drawn net cost is below zero. */
  negativeNote: string;
  /** Appended with it when the BUY line goes below zero. */
  negativeBuyNote: string;
  /** Appended with it when the RENT line goes below zero. */
  negativeRentNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  tableHint: string;
  monthColumn: string;
  buyColumn: string;
  rentColumn: string;
  advantageColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

export type RentBuyScenarioLabels = MoneyWords & {
  title: string;
  /** `{rate}` substituted: "Giá nhà {rate}/năm". */
  scenarioSeries: string;
  zeroReference: string;
  /** `{rate}` and `{month}` substituted. */
  scenarioMarker: string;
  /** `{rate}` substituted. Only when a scenario is never ahead at all. */
  scenarioNoMarker: string;
  /**
   * `{rate}`, `{first}` and `{last}` substituted. For a scenario that WAS
   * ahead for a stretch and lost it before the horizon.
   *
   * The same two meanings the trajectory figure distinguishes. Using one
   * sentence for both made the second figure contradict the first one on the
   * same page.
   */
  scenarioReversedNote: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{months}`, `{lowest}`, `{highest}`, `{spread}` substituted. */
  summary: string;
  /** Always appended: these are assumptions, not a forecast or an interval. */
  scenarioNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  tableHint: string;
  monthColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
  /** Used when more scenarios are handed in than can be told apart. */
  tooManyReason: string;
  tooManyRecovery: string;
};

/** A line model with nothing to draw: the reason, and what to change. */
function empty(
  labels: {
    title: string;
    xAxis: string;
    yAxis: string;
    currency: string;
    assumptions: readonly string[];
    tableCaption: string;
    monthColumn: string;
  },
  reason: string,
  recovery: string,
  table?: ChartTable,
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
    table:
      table ?? {
        caption: labels.tableCaption,
        columns: [{ label: labels.monthColumn, numeric: true, nowrap: true }],
        rows: [],
      },
    unavailable: { reason, recovery },
  };
}

/**
 * Axis bounds for a quantity that may be negative.
 *
 * Zero is always inside the plot, because zero is where the two sides are
 * level and the reference line has to sit somewhere real. Each end is lifted
 * to a readable rung independently, so an all-positive series keeps the whole
 * plot height rather than losing half of it to an empty negative band.
 */
function signedBounds(values: readonly number[]): {
  yMin: number;
  yMax: number;
} {
  const highest = Math.max(0, ...values);
  const lowest = Math.min(0, ...values);
  const yMax = highest > 0 ? niceMax(highest) : 0;
  const yMin = lowest < 0 ? -niceMax(-lowest) : 0;
  // A flat zero series — a cash purchase at a 0% growth and 0% return — still
  // needs a span, or `LineChart` refuses to draw and the reader gets nothing.
  if (yMax === 0 && yMin === 0) return { yMin: 0, yMax: 1 };
  return { yMin, yMax };
}

/** Five ticks across a signed axis, all read in one unit. */
function signedTicks(
  yMin: number,
  yMax: number,
  words: MoneyWords,
): { ticks: ChartTick[]; unit: string } {
  const magnitude = Math.max(Math.abs(yMin), Math.abs(yMax));
  const ticks: ChartTick[] = [];
  for (let index = 0; index <= 4; index += 1) {
    const at = index / 4;
    ticks.push({
      at,
      label: axisTickLabel(yMin + at * (yMax - yMin), magnitude),
    });
  }
  return { ticks, unit: axisUnit(magnitude, words) };
}

/**
 * The months to draw or tabulate: an even stride, plus the months that carry
 * the answer.
 *
 * A checkpoint the headline names is never thinned away — a table that
 * skipped the break-even month would send a reader looking for a figure that
 * is not there — so the result can be one or two entries longer than `limit`.
 */
function sampledMonths(
  xMax: number,
  keep: readonly (number | null)[],
  limit: number,
): number[] {
  const wanted = new Set<number>([0, xMax]);
  const stride = Math.max(1, Math.ceil((xMax + 1) / limit));
  for (let month = 0; month <= xMax; month += stride) wanted.add(month);
  for (const month of keep) {
    if (month === null) continue;
    if (Number.isInteger(month) && month >= 0 && month <= xMax) {
      wanted.add(month);
    }
  }
  return [...wanted].sort((a, b) => a - b);
}

/** The trajectory as a month-keyed lookup, so no index arithmetic is assumed. */
function byMonth(result: RentVsBuyResult) {
  return new Map(result.trajectory.map((point) => [point.month, point]));
}

/**
 * Both net costs at every month, with the crossing marked.
 *
 * Null result, or a trajectory too short to be a line, comes back
 * `unavailable` with the reason and what to change — never an empty axis.
 */
export function rentBuyTrajectoryModel(
  result: RentVsBuyResult | null,
  labels: RentBuyTrajectoryLabels,
): LineChartModel {
  if (result === null || result.trajectory.length < 2) {
    return empty(labels, labels.unavailableReason, labels.unavailableRecovery);
  }

  const points = byMonth(result);
  const xMax = Math.max(...points.keys());
  if (!(xMax > 0)) {
    return empty(labels, labels.unavailableReason, labels.unavailableRecovery);
  }

  const months = sampledMonths(
    xMax,
    [result.breakEvenMonth],
    MAX_TRAJECTORY_POINTS,
  );
  const buy: SeriesPoint[] = [];
  const rent: SeriesPoint[] = [];
  for (const month of months) {
    const point = points.get(month);
    if (point === undefined) continue;
    buy.push({ period: month, value: point.buyNetCost });
    rent.push({ period: month, value: point.rentNetCost });
  }

  const { yMin, yMax } = signedBounds([
    ...buy.map((point) => point.value),
    ...rent.map((point) => point.value),
  ]);
  const { ticks, unit } = signedTicks(yMin, yMax, labels);

  // A TIE IS NOT A WIN. `buyingWins` is `advantage > 0`, so the general
  // sentence would name renting as the cheaper option by 0 ₫.
  let summary = result.tied
    ? fill(labels.summaryTie, {
        months: formatDecimal(xMax, 0),
        buy: compactMoney(result.buy.netCost, labels),
        rent: compactMoney(result.rent.netCost, labels),
      })
    : fill(labels.summary, {
        months: formatDecimal(xMax, 0),
        buy: compactMoney(result.buy.netCost, labels),
        rent: compactMoney(result.rent.netCost, labels),
        advantage: compactMoney(Math.abs(result.advantageOfBuying), labels),
        winner: result.buyingWins ? labels.winnerBuy : labels.winnerRent,
      });
  if (result.breakEvenMonth !== null) {
    // ONE MONTH IS ESTABLISHED BY THE SCAN, NOT ALL THE EARLIER ONES. The
    // backward search stops at the first month that is NOT ahead, so the
    // month before the reported one is known to be behind — and nothing is
    // known about the months before that without reading the lines.
    summary +=
      result.breakEvenMonth <= 1
        ? ` ${labels.breakEvenFirstMonthNote}`
        : ` ${fill(labels.breakEvenNote, {
            month: formatDecimal(result.breakEvenMonth, 0),
            previous: formatDecimal(result.breakEvenMonth - 1, 0),
          })}`;
  } else {
    // NULL HAS TWO MEANINGS. Buying may have been ahead for a stretch and
    // then been overtaken again before the horizon, and saying it was never
    // ahead would be false — see `breakEvenMonth`'s own docstring.
    const ahead = result.trajectory.filter(
      (point) => point.month > 0 && point.advantageOfBuying > 0,
    );
    summary +=
      ahead.length === 0
        ? ` ${labels.noBreakEvenNote}`
        : ` ${fill(labels.reversedNote, {
            first: formatDecimal(ahead[0].month, 0),
            last: formatDecimal(ahead[ahead.length - 1].month, 0),
          })}`;
  }
  // WHOSE MONEY MADE IT NEGATIVE. The buyer's line goes below zero on
  // assumed house-price growth; the renter's goes below zero on assumed
  // investment gain, which is their own cash and not a house they do not
  // own. One sentence for both attributed everything to appreciation.
  if (yMin < 0) {
    const lowest = (points: readonly SeriesPoint[]) =>
      Math.min(...points.map((point) => point.value));
    summary += ` ${labels.negativeNote}`;
    if (lowest(buy) < 0) summary += ` ${labels.negativeBuyNote}`;
    if (lowest(rent) < 0) summary += ` ${labels.negativeRentNote}`;
  }

  const markers = [
    {
      period: xMax,
      label: fill(labels.horizonMarker, { month: formatDecimal(xMax, 0) }),
    },
  ];
  if (result.breakEvenMonth !== null) {
    markers.push({
      period: result.breakEvenMonth,
      label: fill(labels.breakEvenMarker, {
        month: formatDecimal(result.breakEvenMonth, 0),
      }),
    });
  }

  const tableMonths = sampledMonths(
    xMax,
    [result.breakEvenMonth],
    MAX_TABLE_ROWS,
  );

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series: [
      { key: "buy", label: labels.buySeries, stroke: "solid", points: buy },
      { key: "rent", label: labels.rentSeries, stroke: "dashed", points: rent },
    ],
    markers,
    references: [{ value: 0, label: labels.zeroReference }],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: { label: fill(labels.yAxis, { unit }), ticks },
    xMax,
    yMin,
    yMax,
    step: false,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      columns: [
        { label: labels.monthColumn, numeric: true, nowrap: true },
        { label: labels.buyColumn, numeric: true },
        { label: labels.rentColumn, numeric: true },
        { label: labels.advantageColumn, numeric: true },
      ],
      rows: tableMonths.map((month): TableCell[] => {
        const point = points.get(month)!;
        return [
          countCell(month),
          moneyCell(point.buyNetCost),
          moneyCell(point.rentNetCost),
          moneyCell(point.advantageOfBuying),
        ];
      }),
    },
    unavailable: null,
  };
}

/** The label a scenario carries, e.g. "Giá nhà 3%/năm". */
function scenarioLabel(
  labels: RentBuyScenarioLabels,
  priceGrowthPercent: number,
): string {
  return fill(labels.scenarioSeries, {
    // A whole-number rate reads as "3%", not "3,00%"; a typed 2,5 keeps its
    // decimal. Never rounded away: the label is what names the assumption.
    rate: formatPercent(
      priceGrowthPercent,
      Number.isInteger(priceGrowthPercent) ? 0 : 2,
    ),
  });
}

/**
 * The signed advantage over time, one line per named growth assumption.
 *
 * Positive means buying is ahead at that month under that assumption, so a
 * line crossing the zero reference is the answer changing. `options.table`
 * lets a caller — education article C08 — supply an exact endpoint reading in
 * place of the per-month one; a caller that does must usually supply
 * `options.assumptions` too, for the same reason C09's override does.
 */
export function rentBuyScenariosModel(
  scenarios: readonly RentVsBuyScenario[] | null,
  labels: RentBuyScenarioLabels,
  options?: { table?: ChartTable; assumptions?: readonly string[] },
): LineChartModel {
  const assumptions = options?.assumptions ?? labels.assumptions;
  const withAssumptions = { ...labels, assumptions };
  if (scenarios === null || scenarios.length === 0) {
    return empty(
      withAssumptions,
      labels.unavailableReason,
      labels.unavailableRecovery,
      options?.table,
    );
  }
  if (scenarios.length > MAX_SCENARIO_SERIES) {
    return empty(
      withAssumptions,
      labels.tooManyReason,
      labels.tooManyRecovery,
      options?.table,
    );
  }

  const drawable = scenarios.filter(
    (scenario) =>
      scenario.result !== null && scenario.result.trajectory.length > 1,
  );
  if (drawable.length === 0) {
    return empty(
      withAssumptions,
      labels.unavailableReason,
      labels.unavailableRecovery,
      options?.table,
    );
  }

  const lookups = drawable.map((scenario) => byMonth(scenario.result!));
  const xMax = Math.max(...lookups.flatMap((lookup) => [...lookup.keys()]));
  if (!(xMax > 0)) {
    return empty(
      withAssumptions,
      labels.unavailableReason,
      labels.unavailableRecovery,
      options?.table,
    );
  }

  const crossings = drawable.map((scenario) => scenario.result!.breakEvenMonth);
  const months = sampledMonths(xMax, crossings, MAX_TRAJECTORY_POINTS);
  const series = drawable.map((scenario, index) => ({
    key: `growth-${index}`,
    label: scenarioLabel(labels, scenario.priceGrowthPercent),
    stroke: (["solid", "dashed", "dotted"] as const)[index],
    points: months.flatMap((month): SeriesPoint[] => {
      const point = lookups[index].get(month);
      return point === undefined
        ? []
        : [{ period: month, value: point.advantageOfBuying }];
    }),
  }));

  const { yMin, yMax } = signedBounds(
    series.flatMap((line) => line.points.map((point) => point.value)),
  );
  const { ticks, unit } = signedTicks(yMin, yMax, labels);

  // The spread at the horizon, which is the point of the picture: the same
  // reader, the same horizon, one unknown assumption, this much difference.
  const endpoints = drawable.map(
    (scenario) => scenario.result!.advantageOfBuying,
  );
  const lowest = Math.min(...endpoints);
  const highest = Math.max(...endpoints);
  // A SCENARIO WITH NO CROSSING GETS A SENTENCE, NOT A MARKER. `markers` are
  // event rules on the plot, so putting a "there is no crossing" one at the
  // horizon draws a line where nothing happens. The fact still has to be
  // said, so it is said here.
  const missing = drawable.flatMap((scenario, index) => {
    if (crossings[index] !== null) return [];
    const rate = formatPercent(
      scenario.priceGrowthPercent,
      Number.isInteger(scenario.priceGrowthPercent) ? 0 : 2,
    );
    // NULL HAS THE SAME TWO MEANINGS HERE as on the trajectory figure, and
    // the two figures sit on one page: a scenario that was ahead from month
    // 90 to 302 must not be described as never ahead.
    const ahead = scenario.result!.trajectory.filter(
      (point) => point.month > 0 && point.advantageOfBuying > 0,
    );
    return [
      ahead.length === 0
        ? fill(labels.scenarioNoMarker, { rate })
        : fill(labels.scenarioReversedNote, {
            rate,
            first: formatDecimal(ahead[0].month, 0),
            last: formatDecimal(ahead[ahead.length - 1].month, 0),
          }),
    ];
  });
  const summary = [
    fill(labels.summary, {
      months: formatDecimal(xMax, 0),
      lowest: compactMoney(lowest, labels),
      highest: compactMoney(highest, labels),
      spread: compactMoney(highest - lowest, labels),
    }),
    ...missing,
    labels.scenarioNote,
  ].join(" ");

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions,
    series,
    // One marker per scenario that HAS a crossing, so the month is named per
    // assumption rather than read off a rule the reader has to attribute to a
    // line. A scenario without one is in the summary above, not on the plot.
    markers: drawable.flatMap((scenario, index) => {
      const crossing = crossings[index];
      return crossing === null
        ? []
        : [
            {
              period: crossing,
              label: fill(labels.scenarioMarker, {
                rate: formatPercent(
                  scenario.priceGrowthPercent,
                  Number.isInteger(scenario.priceGrowthPercent) ? 0 : 2,
                ),
                month: formatDecimal(crossing, 0),
              }),
            },
          ];
    }),
    references: [{ value: 0, label: labels.zeroReference }],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: { label: fill(labels.yAxis, { unit }), ticks },
    xMax,
    yMin,
    yMax,
    step: false,
    table:
      options?.table ?? {
        caption: labels.tableCaption,
        hint: labels.tableHint,
        columns: [
          { label: labels.monthColumn, numeric: true, nowrap: true },
          ...drawable.map((scenario) => ({
            label: scenarioLabel(labels, scenario.priceGrowthPercent),
            numeric: true,
          })),
        ],
        rows: sampledMonths(xMax, crossings, MAX_TABLE_ROWS).map(
          (month): TableCell[] => [
            countCell(month),
            ...lookups.map((lookup) => {
              const point = lookup.get(month);
              // A scenario whose own horizon stops short has no figure at
              // this month; the placeholder, never an extrapolation.
              return point === undefined
                ? null
                : moneyCell(point.advantageOfBuying);
            }),
          ],
        ),
      },
    unavailable: null,
  };
}
