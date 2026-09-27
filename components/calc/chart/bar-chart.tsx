import { useId } from "react";
import { SERIES_FILL } from "@/components/calc/chart/chart-figure";
import {
  TextureDefs,
  textureFill,
} from "@/components/calc/chart/chart-texture";
import { StatusIcon, TONE_INK } from "@/components/calc/status-tone";
import { stackSegments } from "@/lib/calc/charts/geometry";
import {
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
} from "@/lib/calc/charts/palette";
import type { BarChartModel } from "@/lib/calc/charts/types";
import { cn } from "@/lib/cn";

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
 * EVERY PIECE OF TEXT HERE IS HTML, NOT SVG TEXT. A fixed 10-unit `<text>`
 * inside a 360-unit viewBox scales with the box, so at a 300 px plot on a
 * phone it renders around 8 px — the review measured exactly that and called
 * the labels and the nine-digit totals visibly tiny. HTML reflows, wraps and
 * respects the reader's own font size, and is why the axis TITLES already live
 * outside the SVG (see `geometry.ts`).
 *
 * The TICK NUMBERS were the last ones left inside, on the argument that only
 * they must line up with the plot. They do not have to be SVG to do that: a
 * bar's track spans the full container width, so a tick at fraction `at` is at
 * `at`% of it, which is exactly how `PlotFrame` positions the axis labels on
 * every line and column chart. Their old `text-[9px]` was 9 USER UNITS, so it
 * rendered near 9 px on a phone and near 15 px on a wide desktop column —
 * smaller than the body text where reading is hardest and larger where it is
 * easiest. As HTML they are `text-xs` everywhere, like every other axis in the
 * suite.
 *
 * COLOUR IS NOT THE ONLY CHANNEL ANY MORE. Each segment also carries its
 * SERIES' texture from `chart-texture.tsx`, mirrored in the legend's mark. The
 * texture is keyed to the UNWRAPPED series index, not to the four-colour slot:
 * a second review measured the six-segment allocation bar at 390 px, where the
 * wrapped version gave series 0/4 the same grey plain fill and series 1/5 the
 * same green hatch. An independent visual review before that had found a
 * segment identifiable by fill colour alone, with two of the four fills being
 * greens a reader may not be able to separate. The
 * patterns are tiled, so a segment's length — the thing that carries the data
 * — is untouched, and the model's own summary and table are still where the
 * numbers are read.
 *
 * Computes nothing financial: the model arrives resolved and the stacking
 * comes from the tested `stackSegments`. `aria-hidden` is `ChartFigure`'s
 * contract — see its docstring.
 */
export function BarChart({ model }: { model: BarChartModel }) {
  const { bars, max } = model;
  // `useId` before the early return: a hook cannot sit behind a condition.
  // It namespaces this drawing's pattern ids, so two figures on one page
  // cannot define the same id — see `TextureDefs`.
  const prefix = useId();
  if (bars.length === 0 || max <= 0) return null;

  // One map for the whole model, in the legend's order, with any unlisted
  // drawn key appended — so this and `ChartFigure`'s swatches agree.
  const paletteSlots = paletteIndexByKey({
    legend: model.legend,
    segmentKeys: bars.flatMap((bar) => bar.segments.map((s) => s.key)),
  });

  return (
    <div>
      {/* The patterns, once for every bar's track. A paint server is resolved
          by document id, so it does not have to live in the `<svg>` that uses
          it — and each track is its own `<svg>`, so defining them per track
          would repeat the same ids. Zero-sized: this draws nothing itself.
          The tile is in the TRACK's units, where the box is 100 wide.

          Out of flow and zero-sized rather than `hidden`: a paint server
          inside a `display: none` subtree is not reliably resolvable, and an
          in-flow inline `<svg>` would still occupy a line box. The size is
          CSS, not `width`/`height` attributes — every `<svg>` in this suite is
          sized by CSS and `chart-render.test.ts` asserts that none carries a
          pixel attribute. */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute size-0"
      >
        <TextureDefs prefix={prefix} tile={2.6} />
      </svg>

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
              texturePrefix={prefix}
              className="mt-1.5"
            />
            {/* THE STATUS RAIL — a separate strip directly under the track,
                on the same 0..max axis, on a WHITE ground. The first version
                hatched the excess OVER the category segments, and red over
                the grey segment measured 1,37:1, over brand green 2,18:1 —
                below the 3:1 a meaningful graphic needs. On its own rail the
                adjacent pair is status ink against white (≥ 3:1, pinned in
                `result-status-contrast.test.ts`), and every segment keeps its
                category colour and texture untouched. */}
            {bar.marks && bar.marks.length > 0 ? (
              <svg
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                className="mt-1 h-1.5 w-full"
                aria-hidden="true"
                focusable="false"
                data-chart-rail="true"
              >
                <rect x={0} y={0} width={100} height={2} className="fill-white" />
                {bar.marks.map((mark) => {
                  const x = (mark.start / max) * 100;
                  const width = (mark.value / max) * 100;
                  if (!(width > 0) || !Number.isFinite(x)) return null;
                  return (
                    <rect
                      key={mark.key}
                      x={x}
                      y={0}
                      width={width}
                      height={2}
                      className={
                        mark.tone === "shortfall"
                          ? "fill-status-shortfall"
                          : "fill-status-met"
                      }
                    />
                  );
                })}
              </svg>
            ) : null}
            {/* The annotation IN WORDS, under its own bar: "Thiếu 1,50 triệu
                ₫". The status rail above is the picture of it; this is what
                a reader who cannot see the rail, or its colour, reads. */}
            {bar.marks && bar.marks.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {bar.marks.map((mark) => (
                  <li
                    key={mark.key}
                    data-chart-mark={mark.tone}
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      TONE_INK[mark.tone],
                    )}
                  >
                    <StatusIcon tone={mark.tone} className="size-3.5" />
                    <span>
                      {mark.label}: {mark.valueLabel}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      {/* The axis, once under the last bar. A row in the flow rather than an
          overlay, so its height comes from the layout and not from the bars —
          the same shape as `PlotFrame`'s x-axis row. */}
      <div aria-hidden="true" className="relative mt-1.5 h-4">
        {model.axis.ticks.map((tick) => (
          <span
            key={`tick-${tick.at}`}
            style={{ left: `${tick.at * 100}%` }}
            className={cn(
              "absolute top-0 whitespace-nowrap text-xs leading-none tabular-nums text-ink-3",
              // Anchored by POSITION: a label on an end of the axis is pulled
              // inside so it cannot overhang the figure.
              tick.at === 0
                ? ""
                : tick.at === 1
                  ? "-translate-x-full"
                  : "-translate-x-1/2",
            )}
          >
            {tick.label}
          </span>
        ))}
      </div>
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
  texturePrefix,
  className,
}: {
  bar: BarChartModel["bars"][number];
  max: number;
  paletteSlots: Map<string, number>;
  /** Namespace for the shared pattern ids — see `BarChart`. */
  texturePrefix: string;
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
        const slot = paletteSlot(paletteSlots, segment.key, segmentIndex);
        // The COLOUR wraps at four and the TEXTURE does not: a sixth segment
        // is the second colour but the sixth texture, which is what keeps it
        // tellable apart from the second segment. See `chart-texture.tsx`.
        const texture = textureFill(
          texturePrefix,
          seriesIndex(paletteSlots, segment.key, segmentIndex),
        );
        return (
          <g key={segment.key}>
            <rect
              x={offset * 100}
              y={0}
              width={size * 100}
              height={6}
              className={SERIES_FILL[slot]}
            />
            {/* The same rectangle again, carrying only the slot's texture:
                the colour is a Tailwind class and a pattern cannot resolve
                `currentColor` from the element referencing it. A segment
                whose slot is the plain one gets nothing drawn over it. */}
            {texture ? (
              <rect
                x={offset * 100}
                y={0}
                width={size * 100}
                height={6}
                fill={texture}
              />
            ) : null}
          </g>
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
