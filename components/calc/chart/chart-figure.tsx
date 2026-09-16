import { CHART_UI as C } from "@/content/calculators/chart-ui";
import { ResultTable } from "@/components/calc/result-table";
import { cn } from "@/lib/cn";
import {
  paletteIndexByKey,
  paletteSlot,
} from "@/lib/calc/charts/palette";
import type { ChartModel } from "@/lib/calc/charts/types";

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
  const seriesLegend =
    model.kind === "lines"
      ? model.series.map((s) => ({ key: s.key, label: s.label }))
      : [];

  const entries = [...legend, ...seriesLegend].filter(
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

          <div className="mt-4">{children}</div>

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
                    <span
                      aria-hidden
                      className={cn(
                        "size-2.5 shrink-0 rounded-sm",
                        // By KEY, from the shared map — not by position here.
                        // The two happen to coincide for the legend (it is
                        // what defines the order), and going through the map
                        // is what guarantees the plot agrees.
                        SWATCHES[paletteSlot(paletteSlots, entry.key, index)],
                      )}
                    />
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
          <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green">
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
 * Swatch classes, in the order the legend and the plots consume them.
 *
 * Restrained: two greens and two neutrals, which is the FinHome palette rather
 * than a categorical chart scheme. Shared with the plot components through
 * `SERIES_FILL`/`SERIES_STROKE` below so a legend swatch and the thing it
 * labels cannot come from two different lists.
 */
const SWATCHES = [
  "bg-ink-3",
  "bg-brand-green",
  "bg-brand-softgreen",
  "bg-ink-4",
];

/** Fill classes for stacked segments, index-aligned with `SWATCHES`. */
export const SERIES_FILL = [
  "fill-ink-3",
  "fill-brand-green",
  "fill-brand-softgreen",
  "fill-ink-4",
];

/** Stroke classes for line series, index-aligned with `SWATCHES`. */
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
