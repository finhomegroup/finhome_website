import { useId } from "react";
import { SERIES_FILL, STROKE_DASH } from "@/components/calc/chart/chart-figure";
import {
  TextureDefs,
  textureFill,
} from "@/components/calc/chart/chart-texture";
import {
  PLOT_TWO_AXES as BOX,
  linePath,
  stackSegments,
  yForFraction,
} from "@/lib/calc/charts/geometry";
import {
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
} from "@/lib/calc/charts/palette";
import type { ColumnChartModel } from "@/lib/calc/charts/types";

/**
 * Stacked columns over periods, with an overlay line on its own right-hand
 * axis. The amortization shape.
 *
 * Computes nothing: every number, label and tick arrives resolved on the
 * model, and the geometry comes from the tested helpers in
 * `lib/calc/charts/geometry.ts`. If this file did arithmetic, no test in this
 * environment could see it.
 *
 * COLOUR IS NOT THE ONLY CHANNEL on the stacked segments: each carries its
 * SERIES' texture from `chart-texture.tsx`, mirrored in the legend's mark,
 * after an independent visual review found a stacked segment identifiable by
 * fill colour alone. Both channels come from the segment's KEY, which is what
 * makes them agree with the legend on a column that omits a segment — and the
 * texture reads the UNWRAPPED index, so it does not repeat where the
 * four-colour palette repeats.
 *
 * `aria-hidden` on the `<svg>` is deliberate and is `ChartFigure`'s contract,
 * not an oversight: the figure renders `model.summary` as visible prose and
 * the full data as a real table, so announcing the drawing would be a third,
 * worse copy of the same information.
 *
 * The x axis is labelled by a SUBSET of the columns. A tick under each of
 * twenty-four monthly columns collides at phone width, so `columnTicks` thins
 * them to at most six on a stride PLUS the last one, which is not always on
 * the stride — the end of the loan is the period a reader looks for. (The
 * ceiling is therefore seven, not six; the old comment here said six.) It
 * lives here rather than in the model
 * because it is a drawing decision about collision, not a figure; `ChartFigure`
 * calls it to build the HTML tick row.
 */
export function columnTicks(
  model: ColumnChartModel,
): { at: number; label: string }[] {
  const n = model.columns.length;
  if (n === 0) return [];
  const every = Math.max(1, Math.ceil(n / 6));
  return model.columns.flatMap((column, index) =>
    index % every === 0 || index === n - 1
      ? // The centre of the column, as a fraction of the plot's width.
        [{ at: (index + 0.5) / n, label: String(column.period) }]
      : [],
  );
}

export function ColumnChart({ model }: { model: ColumnChartModel }) {
  const { columns, yMax, overlay, overlayMax } = model;
  // Before the early return: a hook cannot sit behind a condition. It
  // namespaces this drawing's texture ids — see `TextureDefs`.
  const prefix = useId();
  if (columns.length === 0 || yMax <= 0) return null;

  // BY KEY, from the model's own legend order — not by position inside each
  // column. A column that omits an earlier segment (a fee that is not
  // charged in every year, a period with no principal) shifted every later
  // segment into the wrong slot, which is the legend-drift defect
  // `lib/calc/charts/palette.ts` documents for `BarChart`. The same map is
  // what `ChartFigure`'s swatches read, so the two cannot disagree.
  const paletteSlots = paletteIndexByKey({
    legend: model.legend,
    segmentKeys: columns.flatMap((column) =>
      column.segments.map((segment) => segment.key),
    ),
  });

  const plotWidth = BOX.right - BOX.left;
  // A gap of a quarter of a slot keeps columns distinct at 20+ columns without
  // leaving them hairline-thin.
  const slot = plotWidth / columns.length;
  const barWidth = Math.max(1.5, slot * 0.72);

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full"
      // See the docstring: the text equivalent lives in ChartFigure.
      aria-hidden="true"
      focusable="false"
    >
      {/* The non-colour channel for the stacked fills. The tile is in this
          box's units, where the plot is a few hundred wide. */}
      <TextureDefs prefix={prefix} tile={6} />

      {/* Value grid. Both axes' labels are HTML, in `PlotFrame`. */}
      {model.yAxis.ticks.map((tick) => {
        const y = yForFraction(tick.at, BOX);
        return (
          <line
            key={`y-${tick.at}`}
            x1={BOX.left}
            x2={BOX.right}
            y1={y}
            y2={y}
            className="stroke-ink-4/30"
            strokeWidth={0.5}
          />
        );
      })}

      {/* The columns. Segments are drawn in model order, bottom up, so the
          legend's order is the stack's order. */}
      {columns.map((column, columnIndex) => {
        const x = BOX.left + slot * columnIndex + (slot - barWidth) / 2;
        const stacked = stackSegments(
          column.segments.map((segment) => segment.value),
          yMax,
        );
        const stackTop =
          BOX.bottom -
          (stacked.length > 0
            ? (stacked[stacked.length - 1].offset +
                stacked[stacked.length - 1].size) *
              (BOX.bottom - BOX.top)
            : 0);
        return (
          <g key={column.period}>
            {/* The examined period, as an OUTLINE: a shape, not a colour, so
                the highlight survives monochrome print and low contrast. The
                figure's summary and table name the period too, so this is
                never the only place the selection appears. */}
            {column.emphasis ? (
              <rect
                x={x - 1.5}
                y={stackTop - 2}
                width={barWidth + 3}
                height={BOX.bottom - stackTop + 2}
                fill="none"
                className="stroke-ink"
                strokeWidth={1}
              />
            ) : null}
            {column.segments.map((segment, segmentIndex) => {
              const { offset, size } = stacked[segmentIndex];
              const height = size * (BOX.bottom - BOX.top);
              if (height <= 0) return null;
              const y =
                BOX.bottom - (offset + size) * (BOX.bottom - BOX.top);
              const slot = paletteSlot(
                paletteSlots,
                segment.key,
                segmentIndex,
              );
              // Unwrapped index for the texture, wrapped slot for the colour
              // — see `chart-texture.tsx`.
              const texture = textureFill(
                prefix,
                seriesIndex(paletteSlots, segment.key, segmentIndex),
              );
              return (
                <g key={segment.key}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    className={SERIES_FILL[slot]}
                  />
                  {/* The texture over the colour, as in `BarChart`. */}
                  {texture ? (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill={texture}
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* The balance line, against its own maximum.
          Points are remapped to index + 0,5 against a count-wide axis, which
          `xFor` turns into exactly the centre of each column — a balance point
          drawn at `period / lastPeriod` would sit half a slot to the right of
          the column it belongs to. */}
      {overlay && overlayMax > 0 ? (
        <path
          d={linePath(
            overlay.points.map((point, index) => ({
              period: index + 0.5,
              value: point.value,
            })),
            columns.length,
            overlayMax,
            BOX,
            false,
          )}
          fill="none"
          strokeDasharray={STROKE_DASH[overlay.stroke]}
          className="stroke-ink"
          strokeWidth={1.5}
        />
      ) : null}

      {/* Baseline, drawn last so the columns sit on it. */}
      <line
        x1={BOX.left}
        x2={BOX.right}
        y1={BOX.bottom}
        y2={BOX.bottom}
        className="stroke-ink-4"
        strokeWidth={0.75}
      />
    </svg>
  );
}
