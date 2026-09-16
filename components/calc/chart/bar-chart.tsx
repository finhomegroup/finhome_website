import { SERIES_FILL } from "@/components/calc/chart/chart-figure";
import { PLOT, stackSegments } from "@/lib/calc/charts/geometry";
import {
  paletteIndexByKey,
  paletteSlot,
} from "@/lib/calc/charts/palette";
import type { BarChartModel } from "@/lib/calc/charts/types";

/**
 * Horizontal stacked bars: composition, and comparison across a few items.
 *
 * HORIZONTAL rather than vertical because the labels are Vietnamese phrases —
 * "Giới hạn tổng nợ", "Thu nhập thực nhận" — and a phrase under a vertical
 * column either rotates, truncates or collides. Beside a horizontal bar it
 * simply reads.
 *
 * The height grows with the number of bars instead of being fixed, so two bars
 * do not leave a half-empty box and five do not squeeze.
 *
 * COLOUR COMES FROM THE SEGMENT'S KEY, not its position in its own bar. The
 * positional version disagreed with the legend on any model where a bar omits
 * an earlier segment — see `lib/calc/charts/palette.ts` for the defect an
 * independent review found on the vehicle-budget figure.
 *
 * THE BAR LABELS AND TOTALS ARE HTML, NOT SVG TEXT. A fixed 10-unit `<text>`
 * inside a 360-unit viewBox scales with the box, so at a 300 px plot on a
 * phone it renders around 8 px — the review measured exactly that and called
 * the labels and the nine-digit totals visibly tiny. HTML above each bar
 * reflows, wraps, respects the reader's own font size, and is why the axis
 * TITLES already live outside the SVG (see `geometry.ts`). Only the tick
 * numbers stay inside, because only they must line up with the plot.
 *
 * Computes nothing financial: the model arrives resolved and the stacking
 * comes from the tested `stackSegments`. `aria-hidden` is `ChartFigure`'s
 * contract — see its docstring.
 */
export function BarChart({ model }: { model: BarChartModel }) {
  const { bars, max } = model;
  if (bars.length === 0 || max <= 0) return null;

  // One map for the whole model, in the legend's order, with any unlisted
  // drawn key appended — so this and `ChartFigure`'s swatches agree.
  const paletteSlots = paletteIndexByKey({
    legend: model.legend,
    segmentKeys: bars.flatMap((bar) => bar.segments.map((s) => s.key)),
  });

  // Only the tick row is still positioned in viewBox units. The bars and
  // their labels are laid out by CSS now — no per-bar row arithmetic, and no
  // total SVG height to keep in step with the number of bars.
  const left = 2;
  const width = PLOT.width - 2 - left;

  return (
    <div>
      {/* Labels and totals as real text, one block per bar, above its own
          track. Readable at 390 px and scalable with the reader's settings. */}
      <ul className="space-y-3">
        {bars.map((bar) => (
          <li key={bar.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span
                className={
                  bar.emphasis
                    ? "text-sm font-medium text-ink"
                    : "text-sm text-ink-2"
                }
              >
                {bar.label}
              </span>
              <span
                className={
                  bar.emphasis
                    ? "text-sm font-medium tabular-nums text-ink"
                    : "text-sm tabular-nums text-ink-2"
                }
              >
                {bar.totalLabel}
              </span>
            </div>
            <BarTrack
              bar={bar}
              max={max}
              paletteSlots={paletteSlots}
              className="mt-1.5"
            />
          </li>
        ))}
      </ul>

      {/* The axis, drawn once under the last bar. */}
      <svg
        viewBox={`0 0 ${PLOT.width} 16`}
        className="mt-1 h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {model.axis.ticks.map((tick) => (
          <text
            key={`tick-${tick.at}`}
            x={left + tick.at * width}
            y={11}
            textAnchor={
              tick.at === 0 ? "start" : tick.at === 1 ? "end" : "middle"
            }
            className="fill-ink-3 text-[9px]"
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * One bar's track and its stacked segments.
 *
 * Its own small SVG so the bar scales to the container width while the text
 * above it does not. `preserveAspectRatio="none"` lets a 6-unit-tall box
 * stretch to the CSS height without distorting anything meaningful — there is
 * no text and no circle inside, only rectangles whose WIDTHS carry the data.
 */
function BarTrack({
  bar,
  max,
  paletteSlots,
  className,
}: {
  bar: BarChartModel["bars"][number];
  max: number;
  paletteSlots: Map<string, number>;
  className?: string;
}) {
  const stacked = stackSegments(
    bar.segments.map((segment) => segment.value),
    max,
  );

  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      className={`h-5 w-full ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x={0} y={0} width={100} height={6} rx={1} className="fill-bg-soft" />
      {bar.segments.map((segment, segmentIndex) => {
        const { offset, size } = stacked[segmentIndex];
        if (size <= 0) return null;
        return (
          <rect
            key={segment.key}
            x={offset * 100}
            y={0}
            width={size * 100}
            height={6}
            className={
              SERIES_FILL[
                paletteSlot(paletteSlots, segment.key, segmentIndex)
              ]
            }
          />
        );
      })}
      {bar.emphasis ? (
        <rect
          x={0.15}
          y={0.15}
          width={99.7}
          height={5.7}
          rx={1}
          fill="none"
          className="stroke-ink"
          strokeWidth={0.3}
        />
      ) : null}
    </svg>
  );
}
