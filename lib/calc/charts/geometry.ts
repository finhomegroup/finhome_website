/**
 * Turning chart models into SVG coordinates.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `geometry.test.ts`.
 *
 * This is the arithmetic that would otherwise sit inline in a `.tsx` file
 * where nothing can test it — the path builder in particular, whose step mode
 * is the difference between drawing a payment that jumps at a rate reset and
 * drawing one that drifts up over a year.
 *
 * One coordinate system for all three chart components: a fixed `viewBox` that
 * the browser scales to whatever width the container has. Chosen mobile-first
 * at 360 units wide, so at a phone's 340-ish CSS pixels the scale is about 1:1
 * and the 9-unit tick text renders at roughly 9px — small but legible — while
 * on a 700px desktop column everything doubles.
 *
 * Axis TITLES and legends are deliberately NOT in the SVG: they are HTML in
 * `ChartFigure`, where they reflow, wrap, and scale with the reader's own font
 * size. Only tick numbers live inside, because only they need to be positioned
 * against the plot.
 */

import type { SeriesPoint } from "@/lib/calc/charts/types";

/** The shared plot box, in viewBox units. */
export type PlotBox = {
  /** Full viewBox width and height. */
  width: number;
  height: number;
  /** Inner plot edges. */
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/**
 * The default box: room on the left for value ticks and below for period
 * ticks, with the plot filling the rest.
 */
export const PLOT: PlotBox = {
  width: 360,
  height: 196,
  left: 42,
  right: 352,
  top: 10,
  bottom: 168,
};

/**
 * The box for a chart with a SECOND value axis on the right, which the
 * mortgage chart needs for its balance line.
 */
export const PLOT_TWO_AXES: PlotBox = { ...PLOT, right: 310 };

/** Horizontal position of a period. */
export function xFor(period: number, xMax: number, box: PlotBox): number {
  if (!(xMax > 0)) return box.left;
  const span = box.right - box.left;
  // Clamped: a marker at a fractional month past the last drawn point (a goal
  // reached at month 47,06 on a 48-month axis) must stay inside the plot.
  const fraction = Math.min(1, Math.max(0, period / xMax));
  return box.left + fraction * span;
}

/** Vertical position of a value. Larger values are HIGHER, so y decreases. */
export function yFor(value: number, yMax: number, box: PlotBox, yMin = 0): number {
  if (!(yMax > yMin)) return box.bottom;
  const span = box.bottom - box.top;
  const fraction = Math.min(1, Math.max(0, (value - yMin) / (yMax - yMin)));
  return box.bottom - fraction * span;
}

/** A fraction of an axis (0 at the origin) to a y coordinate. */
export function yForFraction(fraction: number, box: PlotBox): number {
  return box.bottom - fraction * (box.bottom - box.top);
}

/**
 * An SVG path through a series.
 *
 * `step` draws each value as a horizontal run followed by a vertical jump —
 * "step after" — which is what an instalment that holds and then resets
 * actually does. Without it the chart would draw a diagonal between two
 * payment levels, implying a gradual change that never happens to the
 * borrower.
 *
 * Returns an empty string for a series with no points, which SVG renders as
 * nothing rather than as a malformed path.
 */
export function linePath(
  points: readonly SeriesPoint[],
  xMax: number,
  yMax: number,
  box: PlotBox,
  step: boolean,
  yMin = 0,
): string {
  if (points.length === 0) return "";

  const parts: string[] = [];
  points.forEach((point, index) => {
    const x = xFor(point.period, xMax, box);
    const y = yFor(point.value, yMax, box, yMin);
    if (index === 0) {
      parts.push(`M ${round(x)} ${round(y)}`);
      return;
    }
    if (step) {
      // Hold the PREVIOUS value across to this period, then jump.
      const previousY = yFor(points[index - 1].value, yMax, box, yMin);
      parts.push(`L ${round(x)} ${round(previousY)}`);
      parts.push(`L ${round(x)} ${round(y)}`);
    } else {
      parts.push(`L ${round(x)} ${round(y)}`);
    }
  });
  return parts.join(" ");
}

/**
 * The same path, closed down to the baseline — for a filled accumulation.
 *
 * Empty when the line is empty, so a fill never appears without its line.
 */
export function areaPath(
  points: readonly SeriesPoint[],
  xMax: number,
  yMax: number,
  box: PlotBox,
  step: boolean,
  yMin = 0,
): string {
  const line = linePath(points, xMax, yMax, box, step, yMin);
  if (line === "") return "";
  const firstX = xFor(points[0].period, xMax, box);
  const lastX = xFor(points[points.length - 1].period, xMax, box);
  const baseline = yFor(0, yMax, box, yMin);
  return `${line} L ${round(lastX)} ${round(baseline)} L ${round(firstX)} ${round(baseline)} Z`;
}

/**
 * Round a coordinate to two decimals.
 *
 * Not cosmetic: unrounded float coordinates put 17 digits per number into the
 * prerendered HTML of every chart, and the server-rendered string has to
 * hydrate byte-identically to the client's.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * One closed SVG path per band of a STACKED area.
 *
 * Each band is drawn between the cumulative total below it and its own
 * cumulative total: the top edge left-to-right, then the bottom edge
 * right-to-left, closed. That is what makes the bands disjoint — three filled
 * lines would each fill from zero, so their heights could not be read off the
 * picture and they would overlap rather than stack.
 *
 * Bands must share the same periods, bottom band first. A band whose points
 * are missing at some index is treated as 0 there rather than shifting the
 * stack.
 *
 * Returns one string per band, empty for a band with nothing to draw.
 */
export function stackedAreaPaths(
  bands: readonly { points: readonly SeriesPoint[] }[],
  xMax: number,
  yMax: number,
  box: PlotBox,
): string[] {
  const length = Math.max(0, ...bands.map((band) => band.points.length));
  if (length === 0) return bands.map(() => "");

  /** Cumulative total under each band, per point index. */
  const below = new Array(length).fill(0) as number[];
  return bands.map((band) => {
    if (band.points.length === 0) return "";
    const top: string[] = [];
    const bottom: string[] = [];
    band.points.forEach((point, index) => {
      const x = xFor(point.period, xMax, box);
      const under = below[index] ?? 0;
      const over = under + point.value;
      top.push(`${round(x)} ${round(yFor(over, yMax, box))}`);
      bottom.push(`${round(x)} ${round(yFor(under, yMax, box))}`);
      below[index] = over;
    });
    return `M ${top.join(" L ")} L ${bottom.reverse().join(" L ")} Z`;
  });
}

/**
 * Geometry for one stacked column or bar segment.
 *
 * Offsets accumulate as the caller walks the segments in order, so a segment
 * never has to know its own position in the stack.
 */
export function stackSegments(
  values: readonly number[],
  total: number,
): { offset: number; size: number }[] {
  if (!(total > 0)) return values.map(() => ({ offset: 0, size: 0 }));
  let offset = 0;
  return values.map((value) => {
    const size = Math.max(0, value) / total;
    const result = { offset, size };
    offset += size;
    return result;
  });
}
