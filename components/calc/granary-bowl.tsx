import {
  BOWL,
  GROUP_HEIGHT,
  bowlBody,
  bowlFillPolygon,
  bowlFoot,
  bowlHatch,
  bowlLip,
  pathAttr,
  pointsAttr,
} from "@/lib/calc/charts/granary-geometry";
import type { Bowl, BowlState, ZeroNeedReason } from "@/lib/calc/charts/retirement-granary-chart";

/*
 * One bowl of the retirement granary, in its state — the mark
 * `GranaryFigure` repeats and a legend shows alone. Shape and fill carry the
 * state, never colour alone: the bowl fills to the share of the year's spend
 * that was paid, in two layers — the lower one what other income paid
 * (`bowl-soft`, a celadon edge), the upper one the savings' rice (`grain`,
 * heaped over the rim in a full year). A dashed bowl is a year nothing paid;
 * a hatch is a year with nothing to spend. Strokes are `non-scaling-stroke`,
 * so a bowl reads the same at 390 px and at 1280 px.
 *
 * Each layer's own edge is an ink that clears 3:1 on white: the pale fills
 * are warmth, the edges are what make a level visible.
 */

const STROKE = { vectorEffect: "non-scaling-stroke" as const, strokeWidth: 1.5 };

/** One bowl at centre `cx`, in its state. */
export function BowlMark({
  bowl,
  cx,
  changed = false,
}: {
  bowl: Pick<Bowl, "fill" | "other" | "state"> & Partial<Pick<Bowl, "age">>;
  cx: number;
  /** The last lever press changed this bowl: it settles once (motion-safe only). */
  changed?: boolean;
}) {
  const empty = bowl.state === "empty";
  // The savings' rice sits above the other-income layer; it is drawn first
  // and the lower layer over it, so only the savings' band shows gold.
  const rice =
    bowl.state === "covered" || bowl.fill <= bowl.other ? null : bowlFillPolygon(cx, bowl.fill);
  const lower = bowl.other > 0 ? bowlFillPolygon(cx, bowl.other) : null;
  const hatched = bowl.state === "covered" && bowl.other === 0;
  const lip = bowlLip(cx);
  const dash = empty ? "3 2.5" : undefined;
  return (
    // Only a bowl of the plan — one with an age — is marked for the tests and
    // the browser probe; a legend swatch is a picture of a state, not a year.
    <g
      data-bowl={bowl.age === undefined ? undefined : bowl.state}
      data-age={bowl.age}
      data-bowl-changed={changed ? "true" : undefined}
      className={changed ? "fh-bowl-changed" : undefined}
    >
      {rice ? (
        <polygon
          points={pointsAttr(rice)}
          className="fill-grain stroke-grain-ink"
          strokeLinejoin="round"
          {...STROKE}
          strokeWidth={1}
        />
      ) : null}
      {lower ? (
        <polygon
          points={pointsAttr(lower)}
          className="fill-bowl-soft stroke-bowl"
          strokeLinejoin="round"
          {...STROKE}
          strokeWidth={1}
        />
      ) : null}
      {hatched
        ? bowlHatch(cx).map((segment) => (
            <line
              key={`${segment.a.x.toFixed(2)}-${segment.a.y.toFixed(2)}`}
              // Fixed decimals, like every other coordinate here: the server's
              // prerender and the client must emit the same attribute bytes.
              x1={segment.a.x.toFixed(3)}
              y1={segment.a.y.toFixed(3)}
              x2={segment.b.x.toFixed(3)}
              y2={segment.b.y.toFixed(3)}
              className="stroke-bowl"
              {...STROKE}
              strokeWidth={1}
            />
          ))
        : null}
      <path
        d={pathAttr(bowlBody(cx), false)}
        fill="none"
        className="stroke-bowl"
        strokeDasharray={dash}
        strokeLinecap="round"
        {...STROKE}
      />
      <line
        x1={lip.a.x.toFixed(3)}
        y1={lip.a.y.toFixed(3)}
        x2={lip.b.x.toFixed(3)}
        y2={lip.b.y.toFixed(3)}
        className="stroke-bowl"
        strokeDasharray={dash}
        strokeLinecap="round"
        {...STROKE}
        strokeWidth={2}
      />
      <polygon
        points={pointsAttr(bowlFoot(cx))}
        className={empty ? "fill-none stroke-bowl" : "fill-bowl stroke-bowl"}
        strokeDasharray={dash}
        strokeLinejoin="round"
        {...STROKE}
        strokeWidth={1}
      />
    </g>
  );
}

/** An illustrative other-income share for the key's two-layer swatches. */
const KEY_OTHER = 0.45;

/**
 * A single bowl, for a legend entry — illustrative levels, not the plan's:
 * the key shows what each state LOOKS like.
 */
export function BowlSwatch({
  state,
  zeroNeed = null,
}: {
  state: BowlState;
  /** The covered swatch shows the plan's own cause: other income, or no spend. */
  zeroNeed?: ZeroNeedReason | null;
}) {
  const width = BOWL.rim + 6;
  const [fill, other] =
    state === "full"
      ? [1, KEY_OTHER]
      : state === "partial"
        ? [KEY_OTHER + (1 - KEY_OTHER) * 0.35, KEY_OTHER]
        : state === "otherOnly"
          ? [KEY_OTHER, KEY_OTHER]
          : state === "empty"
            ? [0, 0]
            : [1, zeroNeed === "noSpending" ? 0 : 1];
  return (
    <svg
      viewBox={`0 0 ${width} ${GROUP_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
      className="h-5 w-auto shrink-0"
    >
      <BowlMark bowl={{ fill, other, state }} cx={width / 2} />
    </svg>
  );
}
