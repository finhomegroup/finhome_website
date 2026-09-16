/**
 * The accumulation chart for /cong-cu/lai-kep/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `compound-chart.test.ts`.
 *
 * ORIGINAL ROW 16 asks for one shape: "diện tích chồng vốn gốc, góp thêm và
 * lãi" — STACKED AREAS over time, splitting the balance into the money that
 * was there at the START, the money added AFTERWARDS, and the part the assumed
 * rate produced. A single balance curve answers "how much" and hides the only
 * part of the outcome the saver controls, which is the middle band.
 *
 * THE BANDS ARE DISJOINT AND THEY SUM TO THE BALANCE:
 *
 *   initial       = the starting balance, flat across the term
 *   contributions = contributed − initial (cumulative, by construction)
 *   interest      = balance − contributed
 *
 * Three overlapping filled LINES would not be this: each of those fills from
 * zero, so no band's own height can be read off the picture. The stacking
 * geometry is in `geometry.ts`, where a test can see it.
 *
 * TIME IS REAL ELAPSED TIME, NOT A YEAR INDEX. `compound.ts` credits only
 * COMPLETED compounding periods, so 1,5 năm ghép lãi nửa năm credits three
 * periods and the last snapshot sits at 1,5 years. Plotting that at 2, or
 * labelling it "Năm 2", claims a year of compounding that never happened —
 * which is exactly what an independent review found in this module's first
 * draft. Positions come from `elapsedYears` and the partial row says so.
 *
 * AND THE TIME UNIT MOVES WITH THE HORIZON. Positions stay in years, but the
 * LABELS are read in years, months or days, whichever the credited span
 * actually needs. A fixed year label with one decimal flattened three days of
 * daily compounding to "0,0 năm" on the summary, the marker, every table row
 * and every tick, beside a perfectly valid balance. See `timeScaleFor`.
 *
 * BOUNDED BY ITS SOURCE. `compound.ts` refuses a term past
 * `MAX_COMPOUND_YEARS`, so the snapshots are at most 100 rows and this module
 * needs no cap of its own. The accessible table is thinned separately, because
 * 100 rows is a worse picture rather than a better one.
 */

import type { CompoundResult } from "@/lib/calc/compound";
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
  type AreaBand,
  type AreaChartModel,
} from "@/lib/calc/charts/types";
import { moneyCell } from "@/lib/calc/table-cell";
import { formatDecimal } from "@/lib/calc/number";

export type CompoundChartLabels = MoneyWords & {
  title: string;
  /** The three bands, in stacking order. */
  initial: string;
  contributions: string;
  interest: string;
  /** `{n}` substituted with a whole year: "Năm {n}". */
  yearTick: string;
  /** `{n}` substituted with a figure already in the axis's own unit. */
  partialTick: string;
  monthsTick: string;
  daysTick: string;
  /** `{time}` substituted: the marker on the last credited moment. */
  endMarker: string;
  /** One axis title per time unit; the model picks from the credited span. */
  xAxis: string;
  xAxisMonths: string;
  xAxisDays: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /**
   * `{time}` (the credited span with its unit word), `{periods}`,
   * `{balance}`, `{initial}`, `{contributions}`, `{interest}` and
   * `{interestShare}` substituted.
   */
  summary: string;
  /** Appended always: the rate is an assumption, not a promise. */
  rateNote: string;
  /** Appended when there are no later contributions, where the band is absent. */
  noContributionNote: string;
  /**
   * Appended when the last checkpoint is not a whole YEAR — which says
   * nothing about whether a compounding period was left uncredited.
   */
  partialNote: string;
  /**
   * Appended only when the entered term really did ask for a period it never
   * completed. `{periods}` substituted with what was left uncredited.
   */
  uncreditedNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  periodColumn: string;
  balanceColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** How many rows the accessible table may hold. */
const MAX_TABLE_ROWS = 13;

/** Decimal places for a fractional time label: 1,5 năm, not 1,50 năm. */
const TIME_DP = 1;

/** Months and days in a year, for reading a fraction of one as time. */
const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;

/**
 * The unit a time axis is read in, chosen from the credited span.
 *
 * A FIXED "năm" with one decimal erases any horizon shorter than about six
 * weeks: three days of daily compounding is 0,008 năm, and the summary, the
 * marker, every table row and every non-zero tick all rendered "0,0 năm" — a
 * valid 130.054.255 ₫ answer with its time axis flattened to zero. An
 * independent review reproduced exactly that. So the SCALE moves and the axis
 * title says which unit it is in; the credited-period arithmetic is untouched.
 */
type TimeScale = "years" | "months" | "days";

function timeScaleFor(creditedYears: number): TimeScale {
  if (!Number.isFinite(creditedYears) || creditedYears <= 0) return "years";
  if (creditedYears >= 1) return "years";
  if (creditedYears >= 1 / MONTHS_PER_YEAR) return "months";
  return "days";
}

/**
 * Relative band for reading a float time as the whole number it is.
 *
 * Three days is stored as 3/365 of a year, and multiplying that back by 365
 * gives 2.9999999999999996 — which would print "3,0 ngày" and put the axis
 * ticks at 0,7 and 2,2 instead of 0,8 and 2,3. Same reasoning as
 * `compound.ts`'s `PERIOD_SNAP_BAND`, far tighter than any fraction a reader
 * can express.
 */
const TIME_SNAP_BAND = 1e-9;

function snapTime(value: number): number {
  const nearest = Math.round(value);
  return Math.abs(value - nearest) <=
    TIME_SNAP_BAND * Math.max(1, Math.abs(nearest))
    ? nearest
    : value;
}

/** A span in years, converted into the scale's own unit. */
function inScale(years: number, scale: TimeScale): number {
  if (scale === "months") return snapTime(years * MONTHS_PER_YEAR);
  if (scale === "days") return snapTime(years * DAYS_PER_YEAR);
  return snapTime(years);
}

/** Whole numbers plainly, anything else to one place. Never "0,0". */
function formatTime(value: number): string {
  const snapped = snapTime(value);
  return formatDecimal(snapped, Number.isInteger(snapped) ? 0 : TIME_DP);
}

function unavailable(labels: CompoundChartLabels): AreaChartModel {
  return {
    kind: "areas",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    bands: [],
    legend: [],
    markers: [],
    xAxis: { label: labels.xAxis, ticks: [] },
    yAxis: { label: fill(labels.yAxis, { unit: labels.currency }), ticks: [] },
    xMax: 0,
    yMax: 0,
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.periodColumn, nowrap: true },
        { label: labels.initial, numeric: true },
        { label: labels.contributions, numeric: true },
        { label: labels.interest, numeric: true },
        { label: labels.balanceColumn, numeric: true },
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
 * Build the compound-interest chart model.
 *
 * `result` may be null — an invalid form clears the chart rather than leaving
 * the previous one on screen beside new inputs.
 */
export function compoundChartModel(
  result: CompoundResult | null,
  /** The starting balance, which the result does not carry back. */
  initial: number,
  labels: CompoundChartLabels,
): AreaChartModel {
  if (
    result === null ||
    result.yearlyBalances.length === 0 ||
    !Number.isFinite(initial) ||
    initial < 0
  ) {
    return unavailable(labels);
  }

  /** Time 0 plus one point per snapshot, each at its real elapsed time. */
  const points = [
    {
      years: 0,
      periods: 0,
      partial: false,
      initial,
      contributions: 0,
      interest: 0,
      balance: initial,
    },
    ...result.yearlyBalances.map((year) => ({
      years: year.elapsedYears,
      periods: year.elapsedPeriods,
      partial: year.partial,
      initial,
      // `contributed` is initial + every contribution made by then, so the
      // later-contributions band is the difference. Clamped at 0 so a float
      // residue cannot draw a negative band.
      contributions: Math.max(0, year.contributed - initial),
      interest: Math.max(0, year.interest),
      balance: year.balance,
    })),
  ];

  const anyContribution = points.some((point) => point.contributions > 0);

  const band = (
    key: "initial" | "contributions" | "interest",
    label: string,
  ): AreaBand => ({
    key,
    label,
    points: points.map((point) => ({ period: point.years, value: point[key] })),
  });

  const bands: AreaBand[] = [band("initial", labels.initial)];
  // A band that is always zero is left out of the stack AND the legend: an
  // empty band with a label invites a reader to look for it.
  if (anyContribution) bands.push(band("contributions", labels.contributions));
  bands.push(band("interest", labels.interest));

  const last = points[points.length - 1];
  const xMax = last.years;
  const yMax = niceMax(Math.max(...points.map((point) => point.balance)));
  const unit = axisUnit(yMax, labels);

  /**
   * The unit the time axis, the labels and the summary all read in.
   *
   * One decision for the whole figure, so a tick, a table row and the
   * sentence cannot be in different units.
   */
  const scale = timeScaleFor(result.creditedYears);
  const timeTick =
    scale === "days"
      ? labels.daysTick
      : scale === "months"
        ? labels.monthsTick
        : labels.partialTick;

  /**
   * A checkpoint's label: a whole YEAR keeps its index ("Năm 3"), anything
   * else is named by its real elapsed time in the figure's own unit — never
   * "0,0 năm".
   */
  const periodLabel = (point: { years: number; partial: boolean }) =>
    point.partial || scale !== "years"
      ? fill(timeTick, { n: formatTime(inScale(point.years, scale)) })
      : fill(labels.yearTick, { n: formatTime(point.years) });

  /** The credited span, with its unit word, for the sentence and the marker. */
  const creditedTime = fill(timeTick, {
    n: formatTime(inScale(result.creditedYears, scale)),
  });
  const interestShare =
    last.balance > 0 ? (last.interest / last.balance) * 100 : 0;

  let summary = fill(labels.summary, {
    time: creditedTime,
    periods: formatDecimal(result.periods, 0),
    balance: compactMoney(last.balance, labels),
    initial: compactMoney(last.initial, labels),
    contributions: compactMoney(last.contributions, labels),
    interest: compactMoney(last.interest, labels),
    interestShare: Math.round(interestShare),
  });
  summary += ` ${labels.rateNote}`;
  if (!anyContribution) summary += ` ${labels.noContributionNote}`;
  // A non-whole YEAR and an uncredited PERIOD are different facts, and the
  // page used to report the first as the second: 1,5 năm ghép nửa năm is
  // exactly 3 periods with nothing left over.
  if (last.partial) summary += ` ${labels.partialNote}`;
  if (result.uncreditedPeriods > 0) {
    summary += ` ${fill(labels.uncreditedNote, {
      periods: formatTime(result.uncreditedPeriods),
    })}`;
  }

  // Thin the table rather than shipping 100 rows: a row per snapshot for a
  // short term, otherwise evenly spaced ones plus the LAST, which is always
  // included because it is the answer.
  const snapshots = points.slice(1);
  const step = Math.max(1, Math.ceil(snapshots.length / MAX_TABLE_ROWS));
  const shown = snapshots.filter(
    (point, index) => index % step === 0 || index === snapshots.length - 1,
  );

  return {
    kind: "areas",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    bands,
    legend: bands.map((entry) => ({ key: entry.key, label: entry.label })),
    // The end of the CREDITED term, which on a fractional term is not a year
    // boundary — so the picture says where the money actually stops working.
    markers: last.partial
      ? [
          {
            period: last.years,
            label: fill(labels.endMarker, { time: creditedTime }),
          },
        ]
      : [],
    xAxis: {
      label:
        scale === "days"
          ? labels.xAxisDays
          : scale === "months"
            ? labels.xAxisMonths
            : labels.xAxis,
      // Ticks carry FRACTIONS of the axis, so they are positioned the same
      // whatever unit they are read in — and labelling them off the SNAPPED
      // span keeps a three-day horizon at 0 / 0,8 / 1,5 / 2,3 / 3 rather than
      // five identical "0,0"s or a float-residue 0,7 / 2,2.
      ticks: linearTicks(inScale(xMax, scale), 4, formatTime),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMax,
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.periodColumn, nowrap: true },
        { label: labels.initial, numeric: true },
        { label: labels.contributions, numeric: true },
        { label: labels.interest, numeric: true },
        { label: labels.balanceColumn, numeric: true },
      ],
      // Raw đồng: the table shows these at two precisions and only the number
      // can be rescaled.
      rows: shown.map((point) => [
        periodLabel(point),
        moneyCell(point.initial),
        moneyCell(point.contributions),
        moneyCell(point.interest),
        moneyCell(point.balance),
      ]),
    },
    unavailable: null,
  };
}
