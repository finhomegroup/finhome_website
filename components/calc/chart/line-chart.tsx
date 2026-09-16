import {
  SERIES_STROKE,
  STROKE_DASH,
} from "@/components/calc/chart/chart-figure";
import {
  PLOT as BOX,
  areaPath,
  linePath,
  xFor,
  yFor,
  yForFraction,
} from "@/lib/calc/charts/geometry";
import type { LineChartModel } from "@/lib/calc/charts/types";

/**
 * One or more series over periods, with vertical markers and horizontal
 * reference lines.
 *
 * Carries all three of the suite's period charts: the floating-rate payment
 * timeline (stepped), the savings accumulation (smooth, filled) and the loan
 * comparison's instalment levels (stepped).
 *
 * `model.step` decides the interpolation, and it matters: an instalment that
 * resets in month 13 must be drawn as a hold and a jump, not as a diagonal
 * climb across the year. The logic is in `linePath`, where a test can see it.
 *
 * Markers and reference lines are drawn as rules only. Their TEXT is rendered
 * by `ChartFigure` as an HTML list, because rotated 9px labels inside a
 * phone-width SVG are unreadable and because that list reflows with the
 * reader's own font size.
 *
 * Computes nothing financial. `aria-hidden` is `ChartFigure`'s contract.
 */
export function LineChart({ model }: { model: LineChartModel }) {
  const { series, xMax, yMin, yMax, step } = model;
  if (series.length === 0 || yMax <= yMin || xMax <= 0) return null;

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

      {/* Horizontal reference lines — a target balance, a budget the user
          typed. Dashed and darker than the grid so they read as data. */}
      {model.references.map((reference) => (
        <line
          key={reference.label}
          x1={BOX.left}
          x2={BOX.right}
          y1={yFor(reference.value, yMax, BOX, yMin)}
          y2={yFor(reference.value, yMax, BOX, yMin)}
          className="stroke-ink-2"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      ))}

      {/* Vertical markers — a rate reset, the month a goal lands. */}
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

      {/* Filled areas first, so a line is never hidden under a later fill. */}
      {series.map((line, index) =>
        line.area ? (
          <path
            key={`area-${line.key}`}
            d={areaPath(line.points, xMax, yMax, BOX, step, yMin)}
            className={SERIES_STROKE[index % SERIES_STROKE.length]}
            fill="currentColor"
            fillOpacity={0.12}
            stroke="none"
          />
        ) : null,
      )}

      {series.map((line, index) => (
        <path
          key={line.key}
          d={linePath(line.points, xMax, yMax, BOX, step, yMin)}
          fill="none"
          strokeDasharray={STROKE_DASH[line.stroke]}
          className={SERIES_STROKE[index % SERIES_STROKE.length]}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
      ))}

      {series.map((line, index) => line.points.length === 1 ? (
        <circle key={`point-${line.key}`} cx={xFor(line.points[0].period, xMax, BOX)}
          cy={yFor(line.points[0].value, yMax, BOX, yMin)} r={2.5}
          className={SERIES_STROKE[index % SERIES_STROKE.length]} fill="none" strokeWidth={1.75} />
      ) : null)}

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
