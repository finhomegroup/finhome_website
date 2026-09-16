import { SERIES_FILL } from "@/components/calc/chart/chart-figure";
import {
  PLOT as BOX,
  stackedAreaPaths,
  xFor,
  yForFraction,
} from "@/lib/calc/charts/geometry";
import type { AreaChartModel } from "@/lib/calc/charts/types";

/**
 * Stacked areas over time: a composition that changes as the periods run.
 *
 * Original row 16's shape. The bands are DISJOINT — each is drawn between the
 * cumulative total below it and its own cumulative total, by
 * `stackedAreaPaths` — so their heights can be read off the picture and they
 * sum to the top edge. Three filled lines would each fill from zero instead,
 * overlap, and tell the reader nothing about any single band.
 *
 * Every band is also outlined, and the bands are ORDERED, so the picture still
 * separates in monochrome or at low contrast: colour is never the only channel
 * here either.
 *
 * The x axis carries REAL elapsed time from the model, which may be
 * fractional. Computes nothing: `aria-hidden` is `ChartFigure`'s contract.
 */
export function AreaChart({ model }: { model: AreaChartModel }) {
  const { bands, xMax, yMax } = model;
  if (bands.length === 0 || yMax <= 0 || xMax <= 0) return null;

  const paths = stackedAreaPaths(bands, xMax, yMax, BOX);

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Value grid and ticks. */}
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

      {/* The bands, bottom first, each with its own outline. */}
      {paths.map((path, index) => (
        <path
          key={bands[index].key}
          d={path}
          className={SERIES_FILL[index % SERIES_FILL.length]}
          fill="currentColor"
          fillOpacity={0.55}
          stroke="currentColor"
          strokeWidth={0.75}
        />
      ))}

      {/* Vertical markers — the end of the credited term, say. */}
      {model.markers.map((marker) => (
        <line
          key={`${marker.period}-${marker.label}`}
          x1={xFor(marker.period, xMax, BOX)}
          x2={xFor(marker.period, xMax, BOX)}
          y1={BOX.top}
          y2={BOX.bottom}
          className="stroke-ink-4"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      ))}

      <line
        x1={BOX.left}
        x2={BOX.right}
        y1={BOX.bottom}
        y2={BOX.bottom}
        className="stroke-ink-4"
        strokeWidth={0.75}
      />

      {/* Period ticks. */}
      {model.xAxis.ticks.map((tick) => (
        <text
          key={`x-${tick.at}`}
          x={BOX.left + tick.at * (BOX.right - BOX.left)}
          y={BOX.bottom + 12}
          textAnchor={tick.at === 0 ? "start" : tick.at === 1 ? "end" : "middle"}
          className="fill-ink-3 text-[9px]"
        >
          {tick.label}
        </text>
      ))}
    </svg>
  );
}
