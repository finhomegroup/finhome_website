import { CHART_UI as C } from "@/content/calculators/chart-ui";
import { columnTicks } from "@/components/calc/chart/column-chart";
import {
  TextureMarks,
  textureKind,
} from "@/components/calc/chart/chart-texture";
import { PlotFrame } from "@/components/calc/chart/plot-frame";
import { ResultTable } from "@/components/calc/result-table";
import { PLOT, PLOT_TWO_AXES } from "@/lib/calc/charts/geometry";
import { cn } from "@/lib/cn";
import {
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
} from "@/lib/calc/charts/palette";
import type { ChartModel, ChartSeries } from "@/lib/calc/charts/types";

/**
 * The frame every calculator chart sits in.
 *
 * It owns the contracts a hand-written chart would drop, the same way
 * `CalculatorPage` owns the disclaimer:
 *
 * - **A text equivalent that is always present.** `model.summary` is rendered
 *   as VISIBLE prose, not hidden in an `aria-label`. A sighted reader gets the
 *   sentence too, and there is no second copy of the text to drift. The `<svg>`
 *   is therefore `aria-hidden` and `focusable="false"`: announcing the drawing
 *   as well would read the same information twice, the second time worse.
 * - **The assumptions, visibly.** A picture of a 20-year projection that does
 *   not say what it assumed is the thing the audit objected to. They are text
 *   under the chart, not a tooltip — there is no hover on a phone.
 * - **The data as a real table**, inside a native `<details>`. No JavaScript
 *   is needed to open it, it is keyboard-operable for free, and it is OUTSIDE
 *   any live region (docs §4: never put a table in one).
 * - **An empty state that explains itself.** `model.unavailable` renders the
 *   reason and what to change instead of an axis with nothing on it.
 *
 * NO ANIMATION AT ALL, which is how `prefers-reduced-motion` is respected
 * here: there is no transition to suppress. The chart redraws when its inputs
 * change because React re-renders it, not because anything tweens.
 *
 * `children` is the plot itself — one of the three chart components — and is
 * only rendered when there is something to draw.
 */
export function ChartFigure({
  model,
  className,
  children,
}: {
  model: ChartModel;
  className?: string;
  children: React.ReactNode;
}) {
  const legend = model.kind === "lines" ? [] : model.legend;
  const markers =
    model.kind === "lines" || model.kind === "areas" ? model.markers : [];
  const references = model.kind === "lines" ? model.references : [];

  /**
   * The axis titles, as HTML.
   *
   * They are NOT svg text: a 9-unit `<text>` label rotated up the side of a
   * phone-width chart is unreadable, and it does not scale with the reader's
   * own font size. Only the tick NUMBERS live inside the drawing, because only
   * they need to be positioned against the plot.
   *
   * Each title carries its unit — "Gốc và lãi mỗi kỳ (triệu)" — which is the
   * whole reason the adapter resolves one magnitude for the whole axis. A
   * chart whose numbers are in triệu and whose axis says nothing is a chart
   * that can be read off by a factor of a million.
   */
  const axes: { key: string; label: string }[] =
    model.kind === "bars"
      ? [{ key: "value", label: model.axis.label }]
      : model.kind === "lines" || model.kind === "areas"
        ? [
            { key: "y", label: model.yAxis.label },
            { key: "x", label: model.xAxis.label },
          ]
        : [
            { key: "y", label: model.yAxis.label },
            ...(model.overlayAxis
              ? [{ key: "overlay", label: model.overlayAxis.label }]
              : []),
            { key: "x", label: model.xAxis.label },
          ];
  // Line charts label their series rather than their segments, so the legend
  // is built from the series themselves.
  //
  // `stroke` IS CARRIED, and that is the point. It used to be dropped here, so
  // the plot told two series apart by colour AND dash while the legend told
  // them apart by colour alone. See the swatch below for what that cost.
  const seriesLegend =
    model.kind === "lines"
      ? model.series.map((s) => ({
          key: s.key,
          label: s.label,
          stroke: s.stroke,
        }))
      : [];

  const entries: {
    key: string;
    label: string;
    /** Set for a LINE series only; a bar/area segment is a fill, not a stroke. */
    stroke?: ChartSeries["stroke"];
  }[] = [...legend, ...seriesLegend].filter(
    // A legend key can repeat across a stacked model (the fee segment is not
    // on every bar); the first occurrence is the one that carries the label.
    (entry, index, all) => all.findIndex((e) => e.key === entry.key) === index,
  );

  /**
   * Which palette slot each key owns, from the MODEL.
   *
   * The plot components build the same map from the same model, so a swatch
   * here and the fill it labels cannot disagree — which they did, because the
   * plot used to colour by a segment's position inside its own bar. See
   * `lib/calc/charts/palette.ts`.
   */
  const paletteSlots = paletteIndexByKey({
    legend: entries,
    segmentKeys: [],
  });

  /**
   * The tick labels, as HTML around the plot.
   *
   * Built here rather than in each plot component because the frame is this
   * component's job and because one call site cannot drift from another. Only
   * the three plotted kinds get it — `bars` is `BarChart`, which lays its own
   * labels out per bar and already renders them as HTML.
   */
  const frame =
    model.kind === "lines" || model.kind === "areas"
      ? {
          box: PLOT,
          yTicks: model.yAxis.ticks,
          xTicks: model.xAxis.ticks,
          overlayTicks: undefined,
        }
      : model.kind === "columns"
        ? {
            box: PLOT_TWO_AXES,
            yTicks: model.yAxis.ticks,
            xTicks: columnTicks(model),
            overlayTicks: model.overlayAxis?.ticks,
          }
        : null;

  return (
    <figure className={cn("mt-8", className)}>
      <figcaption className="font-display text-base font-medium text-ink">
        {model.title}
      </figcaption>

      {model.unavailable ? (
        <div className="mt-3 rounded-2xl bg-bg-soft p-4">
          <p className="text-sm leading-relaxed text-ink-2">
            {model.unavailable.reason}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-3">
            {model.unavailable.recovery}
          </p>
        </div>
      ) : (
        <>
          {/* The text equivalent. Visible, and the only place the summary
              appears — see the docstring. */}
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {model.summary}
          </p>

          {/* Worked arithmetic about the figure, labelled. A caveat never goes
              here — those are `assumptions`, below, and stay visible. */}
          {model.detail ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
                {model.detail.title}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">
                {model.detail.body}
              </p>
            </details>
          ) : null}

          <div className="mt-4">
            {frame ? (
              <PlotFrame
                box={frame.box}
                yTicks={frame.yTicks}
                xTicks={frame.xTicks}
                overlayTicks={frame.overlayTicks}
              >
                {children}
              </PlotFrame>
            ) : (
              children
            )}
          </div>

          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {axes.map((axis) => (
              <li key={axis.key} className="text-xs text-ink-3">
                {axis.label}
              </li>
            ))}
          </ul>

          {entries.length > 0 ? (
            <div className="mt-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
                {C.legendTitle}
              </h4>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {entries.map((entry, index) => (
                  <li
                    key={entry.key}
                    className="flex items-center gap-1.5 text-sm text-ink-2"
                  >
                    {entry.stroke ? (
                      /*
                       * A LINE SERIES IS A STROKE, SO ITS MARK IS A STROKE.
                       *
                       * The plot distinguishes line series on two channels —
                       * colour and `STROKE_DASH` — and this swatch used to be
                       * a solid block, which threw the second one away. That
                       * is the "colour is never the only channel" rule holding
                       * on the drawing and breaking in the key that explains
                       * it, which is the worse of the two places to break it.
                       *
                       * Measured on `/blog/lai-co-dinh-hay-tha-noi/` at a
                       * verified 390 px: three series drew as ink-3 solid,
                       * brand-green dashed and brand-softgreen dotted, and the
                       * legend showed three solid dots — two of them greens
                       * 1,75:1 apart from each other. A reader who cannot
                       * separate those hues could tell the LINES apart and
                       * still not know which line each label named.
                       *
                       * Dash values are reused from `STROKE_DASH` rather than
                       * restated for this size, for the same reason the fills
                       * are: two lists cannot drift when there is one list.
                       * The viewBox is 1 unit per rendered px, so "6 4" and
                       * "1.5 3" read as a dash and a dot at 18 px.
                       */
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 18 10"
                        className="h-2.5 w-[18px] shrink-0"
                      >
                        <line
                          x1="0"
                          y1="5"
                          x2="18"
                          y2="5"
                          strokeDasharray={STROKE_DASH[entry.stroke]}
                          strokeWidth={2}
                          className={
                            SERIES_STROKE[
                              paletteSlot(paletteSlots, entry.key, index)
                            ]
                          }
                        />
                      </svg>
                    ) : (
                      /*
                       * A STACKED SEGMENT IS A FILL, SO ITS MARK IS A FILLED
                       * SHAPE — with the same TEXTURE the segment carries.
                       *
                       * This was a coloured dot, which is the fill half of the
                       * defect the stroke branch above fixed for lines: the
                       * palette is two greens and two neutrals, so a reader
                       * who cannot separate the greens had nothing else to
                       * match a segment to its label with. The plot now draws
                       * each segment with its SERIES' texture
                       * (`chart-texture.tsx`) and this draws the same kind, at
                       * swatch size, from the same `textureKind` — one list,
                       * two scales, no drift.
                       *
                       * The texture reads `seriesIndex` (unwrapped) while the
                       * colour reads `paletteSlot` (wrapped at four). A second
                       * review measured the six-entry allocation legend at
                       * 390 px, where both channels wrapped together and the
                       * fifth and sixth keys were pixel-identical to the first
                       * and second.
                       *
                       * An `<svg>` rather than a `<span>` because the marks
                       * are lines and dots. It keeps the dot's own size and
                       * rounded corner, so nothing about the legend's layout
                       * moves.
                       */
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 10 10"
                        className="size-2.5 shrink-0"
                      >
                        <rect
                          x={0}
                          y={0}
                          width={10}
                          height={10}
                          rx={1.5}
                          // By KEY, from the shared map — not by position
                          // here. The two happen to coincide for the legend
                          // (it is what defines the order), and going through
                          // the map is what guarantees the plot agrees.
                          className={
                            SERIES_FILL[
                              paletteSlot(paletteSlots, entry.key, index)
                            ]
                          }
                        />
                        <TextureMarks
                          kind={textureKind(
                            seriesIndex(paletteSlots, entry.key, index),
                          )}
                          size={10}
                        />
                      </svg>
                    )}
                    {entry.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {markers.length > 0 ? (
            <div className="mt-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
                {C.markersTitle}
              </h4>
              <ul className="mt-1 space-y-0.5">
                {markers.map((marker) => (
                  <li
                    key={`${marker.period}-${marker.label}`}
                    className="text-sm text-ink-2"
                  >
                    {marker.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {references.length > 0 ? (
            <div className="mt-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
                {C.referencesTitle}
              </h4>
              <ul className="mt-1 space-y-0.5">
                {references.map((reference) => (
                  <li key={reference.label} className="text-sm text-ink-2">
                    {reference.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {model.assumptions.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
            {C.assumptionsTitle}
          </h4>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {model.assumptions.map((assumption) => (
              <li key={assumption} className="text-sm leading-relaxed text-ink-3">
                {assumption}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {model.table.rows.length > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
            {C.tableToggle}
          </summary>
          {model.table.hint ? <p className="mt-3 text-sm leading-relaxed text-ink-3">{model.table.hint}</p> : null}
          <ResultTable
            className="mt-3"
            caption={model.table.caption}
            columns={[...model.table.columns]}
            rows={model.table.rows}
            // A five-column chart table does not read at 390 px even
            // compacted; the adapter says when to fall back to blocks.
            mobileCards={model.table.mobileCards ?? false}
          />
        </details>
      ) : null}
    </figure>
  );
}

/**
 * The palette, in the order the legend and the plots consume it.
 *
 * Restrained: two greens and two neutrals, which is the FinHome palette rather
 * than a categorical chart scheme. Every consumer reads these same lists, so a
 * legend mark and the thing it labels cannot come from two different ones.
 *
 * `TEXTURE_KINDS` in `chart-texture.tsx` is LONGER than this list and is NOT
 * index-aligned with it: four colours wrap at four, and a fifth or sixth
 * simultaneous series has to be a new texture on a repeated colour. Both
 * channels are still derived from the one `paletteIndexByKey` map, so a
 * series' colour and its texture travel together for that series.
 *
 * The legend's own `bg-*` swatch classes are GONE: its mark is now a filled
 * `<svg>` shape reading `SERIES_FILL`, because it has to carry the texture
 * too and a background colour cannot.
 */

/** Fill classes for stacked segments and legend marks. */
export const SERIES_FILL = [
  "fill-ink-3",
  "fill-brand-green",
  "fill-brand-softgreen",
  "fill-ink-4",
];

/** Stroke classes for line series, index-aligned with `SERIES_FILL`. */
export const SERIES_STROKE = [
  "stroke-ink-3",
  "stroke-brand-green",
  "stroke-brand-softgreen",
  "stroke-ink-4",
];

/** Dash arrays for the non-colour channel on line series. */
export const STROKE_DASH: Record<"solid" | "dashed" | "dotted", string | undefined> =
  {
    solid: undefined,
    dashed: "6 4",
    dotted: "1.5 3",
  };
