import { useId } from "react";
import { cn } from "@/lib/cn";

/*
 * The retirement target's rice basket (bồ thóc): the capital the plan reaches
 * at retirement against the capital it needs, as rice in a woven basket — the
 * dashed rim is the need, and a plan with more than it heaps over the rim.
 * Every bowl of the granary is scooped from it, which is the lesson.
 *
 * Decorative beside the sentence that says the same in words, so it is
 * `aria-hidden`, holds no text, and draws no rice when there is nothing to
 * compare (it keeps its place, `invisible`, so the panel keeps its height).
 * The rice is ONE rect scaled from the bottom (`fh-basket-rice`), so a new
 * level eases in on the compositor under `prefers-reduced-motion:
 * no-preference` and simply snaps otherwise. Inks as the bowls': the rice's
 * edge and the basket's outline are `grain-ink`, which clears 3:1 on white.
 */

const WIDTH = 64;
const HEIGHT = 58;
const RIM_Y = 12;
const BOTTOM_Y = 52;
/** Slightly tapered woven sides, a rounded bottom. */
const BODY = "M6 12 L10 46 Q12 52 18 52 L46 52 Q52 52 54 46 L58 12 Z";
const WEAVE_Y = [22, 32, 42];
const STROKE = { vectorEffect: "non-scaling-stroke" as const };

export function RiceBasket({
  share,
  heaped,
  className,
}: {
  /** The rice, 0–100 (capped at the rim); null draws none. */
  share: number | null;
  /** More than required: rice heaped over the rim. */
  heaped: boolean;
  className?: string;
}) {
  const clipId = useId();
  const level = share === null ? 0 : Math.max(0, Math.min(100, share)) / 100;
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
      focusable="false"
      data-hero-basket={share ?? undefined}
      className={cn("h-14 w-auto shrink-0", share === null && "invisible", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="0"
          y={RIM_Y}
          width={WIDTH}
          height={BOTTOM_Y - RIM_Y}
          className="fh-basket-rice fill-grain stroke-grain-ink"
          strokeWidth={1}
          style={{ transform: `scaleY(${level.toFixed(3)})` }}
          {...STROKE}
        />
        {WEAVE_Y.map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={WIDTH}
            y2={y}
            className="stroke-grain-ink/30"
            strokeWidth={1}
            {...STROKE}
          />
        ))}
      </g>
      {heaped ? (
        <path
          d="M9 12 Q32 -1 55 12 Z"
          className="fill-grain stroke-grain-ink"
          strokeWidth={1}
          strokeLinejoin="round"
          {...STROKE}
        />
      ) : null}
      <path
        d={BODY}
        fill="none"
        className="stroke-grain-ink"
        strokeWidth={1.5}
        strokeLinejoin="round"
        {...STROKE}
      />
      {/* The need is the brim, dashed: "cần có" means filled to here. */}
      <line
        x1="3"
        y1={RIM_Y}
        x2={WIDTH - 3}
        y2={RIM_Y}
        className="stroke-grain-ink"
        strokeWidth={1.5}
        strokeDasharray="3 2.5"
        strokeLinecap="round"
        {...STROKE}
      />
    </svg>
  );
}
