import { SERIES_FILL, STROKE_DASH } from "@/components/calc/chart/chart-figure";
import {
  PLOT_TWO_AXES as BOX,
  linePath,
  stackSegments,
  yForFraction,
} from "@/lib/calc/charts/geometry";
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
 * `aria-hidden` on the `<svg>` is deliberate and is `ChartFigure`'s contract,
 * not an oversight: the figure renders `model.summary` as visible prose and
 * the full data as a real table, so announcing the drawing would be a third,
 * worse copy of the same information.
 *
 * The x axis is labelled by a SUBSET of the columns. A tick under each of
 * twenty-four monthly columns collides at phone width, so `tickEvery` thins
 * them to at most six and always keeps the last one — the end of the loan is
 * the period a reader looks for.
 */
export function ColumnChart({ model }: { model: ColumnChartModel }) {
  const { columns, yMax, overlay, overlayMax } = model;
  if (columns.length === 0 || yMax <= 0) return null;

  const plotWidth = BOX.right - BOX.left;
  // A gap of a quarter of a slot keeps columns distinct at 20+ columns without
  // leaving them hairline-thin.
  const slot = plotWidth / columns.length;
  const barWidth = Math.max(1.5, slot * 0.72);

  const tickEvery = Math.max(1, Math.ceil(columns.length / 6));

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full"
      // See the docstring: the text equivalent lives in ChartFigure.
      aria-hidden="true"
      focusable="false"
    >
      {/* Value grid and left axis ticks. */}
      {model.yAxis.ticks.map((tick) => {
        const y = yForFraction(tick.at, BOX);
        return (
          <g key={`y-${tick.at}`}>
            <line
              x1={BOX.left}
              x2={BOX.right}
              y1={y}
              y2={y}
              className="stroke-ink-4/30"
              strokeWidth={0.5}
            />
            <text
              x={BOX.left - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-ink-3 text-[9px]"
            >
              {tick.label}
            </text>
          </g>
        );
      })}

      {/* Right axis ticks for the overlay. */}
      {model.overlayAxis?.ticks.map((tick) => (
        <text
          key={`o-${tick.at}`}
          x={BOX.right + 4}
          y={yForFraction(tick.at, BOX) + 3}
          textAnchor="start"
          className="fill-ink-3 text-[9px]"
        >
          {tick.label}
        </text>
      ))}

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
              return (
                <rect
                  key={segment.key}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  className={SERIES_FILL[segmentIndex % SERIES_FILL.length]}
                />
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

      {/* Period ticks, thinned. */}
      {columns.map((column, index) =>
        index % tickEvery === 0 || index === columns.length - 1 ? (
          <text
            key={`x-${column.period}`}
            x={BOX.left + slot * index + slot / 2}
            y={BOX.bottom + 12}
            textAnchor="middle"
            className="fill-ink-3 text-[9px]"
          >
            {column.period}
          </text>
        ) : null,
      )}
    </svg>
  );
}
