import { yForFraction, type PlotBox } from "@/lib/calc/charts/geometry";
import { cn } from "@/lib/cn";

/**
 * One tick: where on its axis (0..1), and what it says.
 *
 * `crowded` is `ChartTick.crowded` — a period label whose neighbour is close
 * enough to overlap it at phone width. It is hidden below `sm` and shown from
 * there up; nothing about its position changes, which is the point.
 */
export type FrameTick = { at: number; label: string; crowded?: boolean };

/**
 * Axis tick labels as HTML, positioned over and under the plot.
 *
 * WHY. A `<text>` inside a scaling `viewBox` cannot be a readable constant
 * size: 9 units rendered at 9px on a 390 px viewport and at ~18px on a 700px
 * desktop column, and a browser pass flagged the small end. `BarChart` already
 * moved its bar labels out for exactly this reason. These labels are real text
 * at `text-xs`, so they are 12px everywhere, they respect the reader's own font
 * size, and they never need the box to reserve glyph room.
 *
 * Positions are percentages derived from the SAME `PlotBox` the drawing uses,
 * so a label and the grid line it names cannot drift. The wrapper's height is
 * the SVG's height (the SVG is its only in-flow child and is `h-auto w-full`),
 * which is what makes a percentage `top` land on the right grid line at every
 * width.
 *
 * `aria-hidden` on both layers, like the `<svg>` itself. A screen reader
 * reading a bare run of axis numbers gets noise; `ChartFigure` renders the
 * summary as prose and the data as a real table, which is where the numbers
 * are meant to be read.
 */
export function PlotFrame({
  box,
  yTicks,
  xTicks,
  overlayTicks,
  children,
}: {
  box: PlotBox;
  /** Left value axis. */
  yTicks: readonly FrameTick[];
  /** Period axis, under the plot. */
  xTicks: readonly FrameTick[];
  /** Right-hand axis, for the mortgage chart's balance line. */
  overlayTicks?: readonly FrameTick[];
  /** The `<svg>`: grid, data and axis rules only. */
  children: React.ReactNode;
}) {
  const topPercent = (at: number) => (yForFraction(at, box) / box.height) * 100;
  const leftPercent = (at: number) =>
    ((box.left + at * (box.right - box.left)) / box.width) * 100;

  /*
   * Labels are ANCHORED to the plot's edge with an automatic width, not boxed
   * into the gutter.
   *
   * The gutter is a percentage of the figure — 11,7% on `PLOT` — so at a 330px
   * figure it is about 38px, and the widest tick label in the suite is a
   * six-character signed one ("-300,0" on `tai-cap-von`) which needs about 43px
   * at `text-xs`. Boxed into the gutter that would wrap or clip. Anchored, the
   * text's inner edge sits exactly on the plot's edge and any excess overflows
   * outward into the card's own padding, which is the harmless direction.
   */
  const yRight = `${100 - (box.left / box.width) * 100}%`;
  const overlayLeft = `${(box.right / box.width) * 100}%`;

  return (
    <div>
      <div className="relative">
        {children}

        <div aria-hidden="true">
          {yTicks.map((tick) => (
            <span
              key={`y-${tick.at}`}
              style={{ top: `${topPercent(tick.at)}%`, right: yRight }}
              className="absolute -translate-y-1/2 whitespace-nowrap pr-1.5 text-right text-xs leading-none tabular-nums text-ink-3"
            >
              {tick.label}
            </span>
          ))}

          {overlayTicks?.map((tick) => (
            <span
              key={`o-${tick.at}`}
              style={{ top: `${topPercent(tick.at)}%`, left: overlayLeft }}
              className="absolute -translate-y-1/2 whitespace-nowrap pl-1.5 text-left text-xs leading-none tabular-nums text-ink-3"
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      {/* A row of its own rather than an overlay: the labels sit BELOW the
          drawing, so they need height in the flow instead of taking it from
          the plot. */}
      {xTicks.length > 0 ? (
        <div aria-hidden="true" className="relative mt-1.5 h-4">
          {xTicks.map((tick) => (
            <span
              key={`x-${tick.at}-${tick.label}`}
              style={{ left: `${leftPercent(tick.at)}%` }}
              className={cn(
                "absolute top-0 whitespace-nowrap text-xs leading-none tabular-nums text-ink-3",
                // Anchored by the tick's POSITION, not its index. A label
                // sitting exactly on an end of the axis is pulled inside so it
                // cannot overhang the figure — the old `textAnchor`
                // start/end/middle rule. A column chart's ticks are column
                // CENTRES and never land on 0 or 1, so they all centre, which
                // is what they did before.
                tick.at === 0
                  ? ""
                  : tick.at === 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2",
                // A label that would collide with its neighbour on a phone.
                // `hidden sm:block`, not a shifted position: the axis keeps
                // its true fractions and both ends, and the reader who needs
                // the intermediate year has the figure's own table. The
                // marking rule and the measurement behind it are in
                // `countTicks` / `MIN_TICK_GAP`.
                tick.crowded && "hidden sm:block",
              )}
            >
              {tick.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
