/**
 * The shapes a calculator chart is allowed to be.
 *
 * Pure module: no React, no I/O, no DOM. Types only — the adapters that build
 * these models live beside this file and are each unit-tested.
 *
 * WHY A MODEL LAYER AT ALL, rather than SVG that reads a result directly.
 *
 * The suite's rule is that every figure on a page comes from the same pure
 * result as the headline. A chart drawn inline in JSX breaks that rule
 * quietly: it needs maxima, tick positions, stack offsets and labels, and each
 * of those is a small calculation that would then live in a `.tsx` file where
 * — with no jsdom in this environment — nothing can test it. docs §6 records
 * that three of the suite's five worst defects were invisible to a green test
 * run for exactly that reason.
 *
 * So the split is: adapters here turn a calculator result into a fully
 * resolved model — every number, every label, every tick, and the accessible
 * table — and the components draw it without computing anything. A chart that
 * disagreed with its own table would have to be a bug in one of these
 * adapters, where a test can see it.
 *
 * EVERY MODEL CARRIES ITS OWN TEXT EQUIVALENT. `summary` is the sentence a
 * screen reader hears in place of the picture, `assumptions` are the caveats
 * the picture rests on, and `table` is the same data as rows. None of the
 * three is optional, because a chart without them is not shippable here.
 *
 * COLOUR IS NEVER THE ONLY CHANNEL. Series carry a `stroke` pattern and bar
 * segments are ordered and labelled, so the chart still reads without colour
 * vision, in monochrome print, or at low contrast.
 */

import type { TableCell } from "@/lib/calc/table-cell";

/** A cell-for-cell alternative to the picture. */
export type ChartTable = {
  caption: string;
  /** Optional tool-specific reading instruction above its table. */
  hint?: string;
  /**
   * Render one block per row below `md`, for a table too wide to read at
   * 390 px even compacted.
   *
   * The same mechanism `ResultTable` already owns for the floating tool's
   * six-column phase table (docs §3). Exactly one of the two presentations is
   * in the accessibility tree at any width and both are built from these same
   * cells, so it is a presentation choice and not a second table. Set it on a
   * chart table of five or more columns; four fit.
   */
  mobileCards?: boolean;
  columns: { label: string; numeric?: boolean; nowrap?: boolean }[];
  /**
   * Typed cells, not pre-formatted strings, for every figure that came out of
   * an engine.
   *
   * The table this feeds shows amounts at two precisions — compact in one
   * stated unit, and exact đồng — and it can only do that from the RAW number.
   * Formatting here and rescaling there would mean parsing localized text back
   * into a number, which is the 1000× defect class in §4 of the suite doc. See
   * `lib/calc/table-cell.ts`.
   *
   * A plain `string` is still a valid cell, for a label or a figure whose unit
   * this layer does not model.
   */
  rows: TableCell[][];
};

/** One labelled tick. `at` is a fraction of the axis, 0 at the origin. */
export type ChartTick = { at: number; label: string };

export type ChartAxis = {
  /** Title including the unit, e.g. "Số tiền (triệu ₫)". */
  label: string;
  ticks: ChartTick[];
};

/**
 * Why a chart has nothing to draw.
 *
 * Not an error state: "your goal cannot be reached at a 0% rate" is a real
 * answer. `reason` says what happened and `recovery` says what to change, so
 * an empty plot is never a blank rectangle with no explanation. When this is
 * set the model's series/bars are empty and the component must render the two
 * sentences instead of an axis.
 */
export type ChartUnavailable = { reason: string; recovery: string };

/** Fields every model shares. */
type ChartBase = {
  /** Heading for the figure. */
  title: string;
  /** One sentence that replaces the picture for a non-visual reader. */
  summary: string;
  /** What the picture assumes. Rendered as visible text, not a tooltip. */
  assumptions: readonly string[];
  table: ChartTable;
  /** Set when there is nothing to draw; see `ChartUnavailable`. */
  unavailable: ChartUnavailable | null;
};

/** One segment of a stacked bar. */
export type BarSegment = {
  key: string;
  label: string;
  value: number;
  /** Pre-formatted, with its unit. */
  valueLabel: string;
};

export type StackedBar = {
  key: string;
  label: string;
  /** Sum of the segments. */
  total: number;
  totalLabel: string;
  segments: BarSegment[];
  /** Marks the bar the page is recommending attention to, if any. */
  emphasis?: boolean;
};

/**
 * Horizontal stacked bars: composition, and comparison between a few items.
 *
 * Used where the question is "what is this made of" or "which of these is
 * bigger" — never for change over time, which is what the line and column
 * models are for.
 */
export type BarChartModel = ChartBase & {
  kind: "bars";
  bars: StackedBar[];
  /** The value the axis runs to. Never 0 when there is anything to draw. */
  max: number;
  axis: ChartAxis;
  legend: { key: string; label: string }[];
};

/** A point in a period series. Period 0 may carry an initial balance or fee. */
export type SeriesPoint = { period: number; value: number };

export type ChartSeries = {
  key: string;
  label: string;
  points: SeriesPoint[];
  /** The non-colour channel. */
  stroke: "solid" | "dashed" | "dotted";
  /** Fill under the line — for an accumulation, not for a payment level. */
  area?: boolean;
};

/**
 * One or more series over periods.
 *
 * `step` switches to step-after interpolation, which is the correct shape for
 * an instalment that holds flat and then jumps at a rate reset: joining those
 * two levels with a diagonal would draw a gradual rise that does not happen.
 */
export type LineChartModel = ChartBase & {
  kind: "lines";
  series: ChartSeries[];
  /** Vertical rules — a rate reset, the month a goal is reached. */
  markers: { period: number; label: string }[];
  /** Horizontal rules — a target balance, a budget the user supplied. */
  references: { value: number; label: string }[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  /** Plot bounds. Signed cost differences can have a negative yMin. */
  xMax: number;
  yMin: number;
  yMax: number;
  step: boolean;
};

/** One stacked column of a period series. */
export type ChartColumn = {
  period: number;
  /** e.g. "Năm 3". */
  label: string;
  segments: BarSegment[];
  total: number;
  /**
   * Marks the period the page is examining, if any.
   *
   * Drawn as an OUTLINE rather than a different fill, so the highlight is a
   * shape and not a colour — the same non-colour rule the series strokes
   * follow. The model's own summary and table still name the period, so the
   * outline is never the only place the selection appears.
   */
  emphasis?: boolean;
};

/**
 * Stacked columns over periods, with an optional overlay line.
 *
 * The amortization shape: how each period's payment splits between interest
 * and principal, with the outstanding balance drawn over it on its own axis.
 */
export type ColumnChartModel = ChartBase & {
  kind: "columns";
  columns: ChartColumn[];
  legend: { key: string; label: string }[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  yMax: number;
  /** Drawn against `overlayAxis`, not `yAxis`. */
  overlay: ChartSeries | null;
  overlayAxis: ChartAxis | null;
  overlayMax: number;
};

/** One band of a stacked area. */
export type AreaBand = {
  key: string;
  label: string;
  /**
   * The band's OWN amount at each period — not the cumulative top edge.
   *
   * The component stacks them, so a band never has to know what is under it
   * and the bands cannot disagree about where a boundary sits. Every band
   * carries the same periods, in the same order.
   */
  points: SeriesPoint[];
};

/**
 * Stacked areas over periods: a composition that CHANGES over time.
 *
 * The shape original row 16 asks for — a balance split into the money that
 * was there at the start, the money added afterwards and the interest, drawn
 * as three disjoint bands summing to the balance. Three overlapping filled
 * LINES would not be that: each of those fills from zero, so the reader
 * cannot read a band's own height off the picture.
 *
 * `period` is REAL elapsed time, so it may be fractional — 1,5 years of
 * semiannual compounding is 1,5 on this axis and not 2.
 */
export type AreaChartModel = ChartBase & {
  kind: "areas";
  /** Bottom band first. */
  bands: AreaBand[];
  legend: { key: string; label: string }[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  xMax: number;
  yMax: number;
  /** Vertical rules — the end of the credited term, say. */
  markers: { period: number; label: string }[];
};

export type ChartModel =
  | BarChartModel
  | LineChartModel
  | ColumnChartModel
  | AreaChartModel;

/**
 * The mantissas an axis bound may take, per power of ten.
 *
 * A coarse 1 / 2 / 5 / 10 ladder is the textbook choice and it wastes too
 * much plot here: yearly payments on a 2 tỷ mortgage top out near 2,08e8, and
 * the next rung up a coarse ladder is 5e8 — so the tallest column would fill
 * 42% of the chart and every column below it would be shorter still. This
 * ladder puts the worst case at 1/1.5, i.e. a tallest column filling at least
 * two thirds of the plot.
 *
 * Every rung still divides into four intervals with at most one decimal place
 * per tick, which is the constraint that rules out 7 and 9.
 */
const NICE_MANTISSAS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Round a maximum up to something a tick label can say.
 *
 * An axis that ends at 17.356.465 has a top tick nobody can read. This lifts
 * the bound to the next rung of `NICE_MANTISSAS` times a power of ten.
 *
 * Returns 0 for a non-positive or non-finite input, which callers surface as
 * "nothing to draw" rather than dividing by it.
 */
export function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const power = 10 ** exponent;
  const scaled = value / power;
  // A float residue can push an exact power of ten just over its own rung —
  // log10(1000) is not bit-exactly 3 for every input — so the comparison gets
  // a relative band rather than a bare `<=`. The band is 1e-12, nine orders
  // below the smallest gap between two rungs (0,5), so it cannot promote a
  // value that genuinely belongs on the next rung up.
  const mantissa =
    NICE_MANTISSAS.find((rung) => scaled <= rung * (1 + 1e-12)) ?? 10;
  return mantissa * power;
}

/**
 * Evenly spaced ticks from 0 to `max`, inclusive of both ends.
 *
 * `count` is the number of INTERVALS, so `count: 4` yields five ticks. The
 * caller formats each value; positions are fractions of the axis so a
 * component never has to know the scale.
 */
export function linearTicks(
  max: number,
  count: number,
  format: (value: number) => string,
): ChartTick[] {
  if (!Number.isFinite(max) || max <= 0 || count < 1) return [];
  const ticks: ChartTick[] = [];
  for (let index = 0; index <= count; index += 1) {
    const fraction = index / count;
    ticks.push({ at: fraction, label: format(max * fraction) });
  }
  return ticks;
}

/**
 * Ticks for an axis of COUNTS — months, years, periods.
 *
 * `linearTicks` divides the axis into equal intervals and lets the caller
 * format whatever value lands there, which is right for money and WRONG for a
 * count: on a three-year plan its five ticks fall at 0, 0,75, 1,5, 2,25 and 3,
 * and a formatter that rounds prints "0, 1, 2, 2, 3" — the label 2 drawn twice
 * at two different dates, with year 1 missing. An independent review found
 * exactly that on a four-year course starting today.
 *
 * So this chooses the VALUES first — whole counts, on a stride wide enough to
 * stay under `maxTicks` — and positions each one at `value / max`, which is
 * where that count actually is. The last count is always kept, so the axis
 * ends where the data does. A non-integer `max` keeps its own final tick
 * rather than being floored away; the caller's formatter decides how to write
 * it, and only it ever receives a fractional value.
 *
 * `maxTicks` is a CEILING on ticks, not a count of intervals — the opposite
 * of `linearTicks`'s `count`, because here the spacing follows the data.
 */
export function countTicks(
  max: number,
  maxTicks: number,
  format: (value: number) => string,
): ChartTick[] {
  if (!Number.isFinite(max) || max <= 0 || maxTicks < 2) return [];
  // A float residue must not drop a whole period NOR add a fractional tick
  // beside it: 37 arriving as 36,999999999999996 would floor to 36 and lose
  // the endpoint, and snapping only the floor would then emit both 37 and
  // 36,99999999999999. The same band decides both, so the two cannot
  // disagree.
  const SNAP = 1e-9;
  const whole = Math.floor(max + SNAP);
  const fractionalEnd = Math.abs(max - whole) > SNAP;
  const stride = Math.max(1, Math.ceil(whole / (maxTicks - 1)));
  const values: number[] = [];
  for (let value = 0; value <= whole; value += stride) values.push(value);
  if (values[values.length - 1] !== whole) values.push(whole);
  if (fractionalEnd) values.push(max);
  const seen = new Set<number>();
  return values
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    })
    .map((value) => ({ at: value / max, label: format(value) }));
}
