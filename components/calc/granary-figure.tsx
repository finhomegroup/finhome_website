import { BowlMark } from "@/components/calc/granary-bowl";
import { GROUP_VIEWBOX, bowlCenter } from "@/lib/calc/charts/granary-geometry";
import type { Bowl } from "@/lib/calc/charts/retirement-granary-chart";
import { cn } from "@/lib/cn";

/**
 * The house the bowls live in: a soft-3D illustration (generated 2026-09-27,
 * `public/images/tools/retirement-house-*.webp`) whose empty back wall the
 * code-drawn shelves are laid onto. `wall` is that wall's box, MEASURED on
 * the image in percent — change the picture and these must be measured again.
 */
const HOUSE = {
  src: "/images/tools/retirement-house-720.webp",
  srcSet:
    "/images/tools/retirement-house-720.webp 720w, /images/tools/retirement-house-1200.webp 1200w",
  width: 1448,
  height: 1086,
  wall: { left: 13.67, top: 34.07, right: 13.6, bottom: 19.43 },
} as const;

/**
 * An infographic: a 3D house as the ground, and the answer drawn on it in 2D.
 * One bowl per unit, in groups of five on shelves, one SVG per group — the
 * picture of `retirementGranaryModel`, which arrives resolved.
 *
 * THE HOUSE IS DECORATION. The illustration holds no quantity and never
 * changes with the answer — no emptier, sadder or broken house for a short
 * plan — so it cannot say something the numbers do not. It is `alt=""`. The
 * exact counts are only ever the code's: an image generator does not keep them. It computes no finance: each
 * bowl's rice is drawn by `granary-geometry`'s pure drawing arithmetic.
 *
 * The §6a figure contract, applied to a pictogram on a picture:
 *
 * - every SVG is `aria-hidden` and `focusable="false"` and holds no `<text>`:
 *   the caption, the ages and the change echo are HTML laid over the image,
 *   and the page says every bowl in words beside the figure (the run-length
 *   text, lossless because the engine's ledger is monotone);
 * - a state is SHAPE AND FILL, never colour alone: rice to its paid level, a
 *   dashed bowl for an unpaid year, a hatch for a year other income covers —
 *   never the shortfall red, never a broken bowl;
 * - no `id`, no `<use>`, no `clipPath`. The one motion — the bowls a lever
 *   press just changed settle once — runs only under
 *   `prefers-reduced-motion: no-preference` (`app/globals.css`).
 *
 * THE FIGURE'S HEIGHT IS THE PICTURE'S, never the bowls': the shelves sit
 * inside the image's own box, so no answer can move what comes after it.
 * Up to thirty years stand two groups a row on three reserved rows; a
 * longer span takes more, smaller columns rather than spilling off the wall,
 * and a field cleared mid-edit keeps the rows and says why they are empty.
 */
export function GranaryFigure({
  bowls,
  groups,
  ticks,
  caption,
  describedBy,
  changed,
  changeKey,
  echo,
  className,
}: {
  bowls: readonly Bowl[];
  groups: readonly (readonly Bowl[])[];
  ticks: readonly { group: number; age: number }[];
  /** Short: what one bowl is. Laid in the gable. */
  caption: string;
  /** The id of the words that describe every bowl. */
  describedBy?: string;
  /** Ages whose bowl the last press changed. */
  changed?: ReadonlySet<number>;
  /** Bumped per press, so the same bowls can settle again. */
  changeKey?: number;
  /** What the last press did, in words, at the foot of the house. */
  echo?: string | null;
  className?: string;
}) {
  const tick = new Map(ticks.map((t) => [t.group, t.age]));
  const { wall } = HOUSE;
  return (
    <figure
      data-granary-figure="true"
      data-bowl-total={bowls.length}
      aria-describedby={describedBy}
      className={cn("relative mx-auto w-full max-w-[34rem]", className)}
      style={{ aspectRatio: `${HOUSE.width} / ${HOUSE.height}` }}
    >
      <figcaption className="absolute left-1/2 top-[25.5%] z-10 w-[56%] -translate-x-1/2 text-center text-xs font-medium leading-4 text-ink-2 md:text-sm md:leading-5">
        {caption}
      </figcaption>
      {/* A plain <img>: the static export has no image loader. */}
      <img
        src={HOUSE.src}
        srcSet={HOUSE.srcSet}
        sizes="(min-width: 768px) 24rem, 100vw"
        width={HOUSE.width}
        height={HOUSE.height}
        alt=""
        decoding="async"
        // On a phone the house is the largest thing in the first screen.
        fetchPriority="high"
        className="absolute inset-0 h-full w-full select-none"
        draggable={false}
      />
      <div
        className="absolute flex flex-col justify-center overflow-hidden px-[3%]"
        style={{
          left: `${wall.left}%`,
          top: `${wall.top}%`,
          right: `${wall.right}%`,
          bottom: `${wall.bottom}%`,
        }}
      >
        <div className={cn("grid gap-x-[6%] gap-y-[3%]", columnsFor(groups.length))}>
          {groups.map((group, index) => (
            <div key={group[0].age} className="min-w-0">
              <svg
                viewBox={GROUP_VIEWBOX}
                aria-hidden="true"
                focusable="false"
                className="block h-auto w-full overflow-visible"
              >
                {group.map((bowl, i) => (
                  <BowlMark
                    key={changed?.has(bowl.age) ? `${bowl.age}-${changeKey}` : bowl.age}
                    bowl={bowl}
                    cx={bowlCenter(i)}
                    changed={changed?.has(bowl.age)}
                  />
                ))}
              </svg>
              <span aria-hidden="true" className={SHELF}>
                {tick.get(index)}
              </span>
            </div>
          ))}
          {groups.length === 0
            ? Array.from({ length: PLACEHOLDER_GROUPS }, (_, i) => (
                <RowSpacer key={i} place={false} />
              ))
            : groups.length <= RESERVED_GROUPS
              ? <RowSpacer />
              : null}
        </div>
      </div>
      {echo ? (
        <p
          key={changeKey}
          data-granary-echo="true"
          className="fh-granary-echo absolute bottom-[3%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-bowl/40 bg-white px-3 py-1 text-xs font-medium text-ink shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        >
          {echo}
        </p>
      ) : null}
    </figure>
  );
}

/** The shelf a group stands on, carrying its first age. */
const SHELF =
  "mt-px block border-t-2 border-grain-ink/30 text-[11px] leading-3 tabular-nums text-ink-2 md:text-xs md:leading-4";

/** Up to this many groups, the three reserved rows would stand partly empty. */
const RESERVED_GROUPS = 4;

/**
 * Columns for a span, so a long retirement shrinks the bowls instead of
 * spilling past the wall: two groups a row up to thirty years (the reserved
 * shape), then three, four and five — a hundred years is five by four.
 */
function columnsFor(groups: number): string {
  if (groups <= 6) return "grid-cols-2";
  if (groups <= 9) return "grid-cols-3";
  if (groups <= 12) return "grid-cols-4";
  return "grid-cols-5";
}

/** Groups held open while there is nothing to draw: the shipped span's three rows. */
const PLACEHOLDER_GROUPS = 5;

/**
 * An invisible cell the same height as a real group. Placed, it stands in
 * the last reserved row; unplaced, it simply takes the next cell.
 */
function RowSpacer({ place = true }: { place?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("invisible", place && "col-start-1 row-start-3")}>
      <svg
        viewBox={GROUP_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        className="block h-auto w-full"
      />
      <span className={SHELF}>&nbsp;</span>
    </div>
  );
}
