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
 * reader's own font size. Tick labels are HTML too, in `PlotFrame`, for the
 * same reason — see that component and `geometry.ts`.
 *
 * Computes nothing financial. `aria-hidden` is `ChartFigure`'s contract.
 */
export function LineChart({ model }: { model: LineChartModel }) {
  const { series, xMax, yMin, yMax, step } = model;
  if (series.length === 0 || yMax <= yMin || xMax <= 0) return null;
  const bands = model.bands ?? [];

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* The span a plan does not pay for. The MEANING is a solid rail in the
          status ink just under the baseline, on the plot's white ground
          (≥ 3:1 against white; a 35%-opacity hatch behind the lines was not),
          plus the toned marker and the figure's text note. The faint tint
          behind the lines is decoration only and carries nothing alone. */}
      {bands.map((band) => {
        const x1 = xFor(band.from, xMax, BOX);
        const x2 = xFor(band.to, xMax, BOX);
        if (!(x2 > x1)) return null;
        return (
          <g key={`band-${band.from}-${band.to}`} data-chart-band={band.tone}>
            <rect
              x={x1}
              y={BOX.top}
              width={x2 - x1}
              height={BOX.bottom - BOX.top}
              className="fill-status-shortfall"
              fillOpacity={0.06}
            />
            <rect
              x={x1}
              y={BOX.bottom + 3}
              width={x2 - x1}
              height={4}
              className="fill-status-shortfall"
            />
          </g>
        );
      })}

      {/* Value grid. The labels are HTML, in `PlotFrame`. */}
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
          // The shortfall marker — the age the money runs out — is the one
          // rule that is part of the ANSWER, so it is drawn in the shortfall
          // ink with its own dash, and listed in words by `ChartFigure`.
          className={
            marker.tone === "shortfall" ? "stroke-status-shortfall" : "stroke-ink-4"
          }
          strokeWidth={marker.tone === "shortfall" ? 1.5 : 1}
          strokeDasharray={marker.tone === "shortfall" ? "5 2" : "2 3"}
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
    </svg>
  );
}
