import { useId } from "react";
import { SERIES_FILL } from "@/components/calc/chart/chart-figure";
import {
  TextureDefs,
  textureFill,
} from "@/components/calc/chart/chart-texture";
import {
  PLOT as BOX,
  stackedAreaPaths,
  xFor,
  yForFraction,
} from "@/lib/calc/charts/geometry";
import {
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
} from "@/lib/calc/charts/palette";
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
 * Every band is also outlined, and the bands are ORDERED, so the picture
 * separates in monochrome or at low contrast. An independent visual review
 * nonetheless found the stacked fills across this suite identifiable by colour
 * alone — an outline says where a band ENDS, not which quantity it is — so
 * each band now also carries its SERIES' texture from `chart-texture.tsx`,
 * the same one the legend's mark draws — keyed to the unwrapped series index,
 * so band 5 does not inherit band 1's encoding when the palette wraps.
 *
 * The x axis carries REAL elapsed time from the model, which may be
 * fractional. Computes nothing: `aria-hidden` is `ChartFigure`'s contract.
 */
export function AreaChart({ model }: { model: AreaChartModel }) {
  const { bands, xMax, yMax } = model;
  // Before the early return: a hook cannot sit behind a condition.
  const prefix = useId();
  if (bands.length === 0 || yMax <= 0 || xMax <= 0) return null;

  // Bands are a fixed set in the model's own order, which IS the legend's
  // order, so a slot per index is already stable here — this goes through the
  // shared map anyway, so the one rule holds in all three stacked renderers.
  const paletteSlots = paletteIndexByKey({
    legend: model.legend,
    segmentKeys: bands.map((band) => band.key),
  });

  const paths = stackedAreaPaths(bands, xMax, yMax, BOX);

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* The non-colour channel for the bands. */}
      <TextureDefs prefix={prefix} tile={6} />

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

      {/* The bands, bottom first, each with its own outline and its slot's
          texture. The texture is a SECOND path over the same shape: the fill
          here is `currentColor` through a Tailwind class, and a pattern
          cannot resolve `currentColor` from the element referencing it. */}
      {paths.map((path, index) => {
        const slot = paletteSlot(paletteSlots, bands[index].key, index);
        // Colour wraps at four slots; the texture reads the unwrapped index.
        const texture = textureFill(
          prefix,
          seriesIndex(paletteSlots, bands[index].key, index),
        );
        return (
          <g key={bands[index].key}>
            <path
              d={path}
              className={SERIES_FILL[slot]}
              fill="currentColor"
              fillOpacity={0.55}
              stroke="currentColor"
              strokeWidth={0.75}
            />
            {texture ? <path d={path} fill={texture} stroke="none" /> : null}
          </g>
        );
      })}

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
    </svg>
  );
}
