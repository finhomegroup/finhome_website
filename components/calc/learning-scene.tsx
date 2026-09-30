import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * The tagged learning scene. Since 2026-09-29 NO route draws its stage
 * (`LearningScene`, `StageTag`, `SceneChip`): vay-mua-nha, vay-mua-xe and
 * kha-nang-mua-nha moved to context art plus 2D readings. They still borrow
 * `SceneStrip`, `SceneDetails`, `FILL`, `MARK_MOTION` and `clampPercent`
 * from here; `learning-scene.test.ts` guards the stage against returning
 * (docs/interactive-illustration-brief-2026-09-28.md, repaired after the
 * 390 × 844 review in `.runtime/interactive-scene-review.md`).
 *
 * ONE COMPACT COMPOSITION. The figure holds a small stage — the supplied
 * soft-3D image, at most 17rem wide on a phone — and, IN the stage, a few
 * calibrated 2D tags anchored on the objects: a value and a thin proportional
 * strip on the scene's ONE named axis. Right under the stage comes a one-line
 * reading and whatever control moves the scene, so the control and what it
 * changes fit in one phone screen. Per-part explanations follow, collapsed.
 *
 * - The raster holds no data: no tray, wallet or building volume means
 *   anything. Every figure is HTML from a pure module.
 * - The stage reserves its 3:2 box, so a missing image moves nothing.
 * - Tags are `aria-hidden`; the reading line and the zones say the same in
 *   full text, which is what assistive technology reads.
 * - Motion: a short width/height/left transition on data marks, ONLY under
 *   `prefers-reduced-motion: no-preference` (`motion-safe:`). Nothing idles.
 * - `data-learning-illustration` is the marker the chart contracts strip
 *   before counting charts: this is a labelled figure, not a chart.
 */

/** A data mark's movement: short, and only when motion is welcome. */
export const MARK_MOTION =
  "motion-safe:transition-[width,height,left,bottom] motion-safe:duration-300 motion-safe:ease-out";

/** Where a tag sits on the stage, in percent: its centre. */
export type ScenePoint = { x: number; y: number };

const at = (point: ScenePoint): CSSProperties => ({ left: `${point.x}%`, top: `${point.y}%` });

export function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

/** The figure: a one-line title, the compact stage, then `children` (reading, control). */
export function LearningScene({
  state,
  title,
  base,
  alt,
  badge,
  marks,
  children,
}: {
  /** "ready" | "unknown" | …, for tests and styling hooks. */
  state: string;
  title: string;
  /** Path without the width suffix: `${base}-720.webp`, `${base}-1200.webp`. */
  base: string;
  alt: string;
  badge: string;
  /** Tags and marks positioned on the stage (`aria-hidden`). */
  marks?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state={state}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-2.5"
    >
      {/* The badge sits outside the stage, so it can never collide with a
          tag on the image. The caption row IS the figcaption (a direct child
          of the figure). On a phone the two stack, so the caption keeps the
          full width; side by side only from `sm`. DOM order, no reordering. */}
      <figcaption className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-2">
        <span className="min-w-0 text-sm font-medium leading-snug text-ink">{title}</span>
        <span
          data-illustration-badge="true"
          className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-ink-2 ring-1 ring-ink-4/40"
        >
          {badge}
        </span>
      </figcaption>
      <div
        data-scene-stage="true"
        className="relative mx-auto mt-2 aspect-[3/2] w-full max-w-[17rem] sm:max-w-[22rem]"
      >
        {/* A plain <img>: the static export has no image loader. */}
        <img
          src={`${base}-720.webp`}
          srcSet={`${base}-720.webp 720w, ${base}-1200.webp 1200w`}
          sizes="(min-width: 640px) 22rem, 17rem"
          width={1536}
          height={1024}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none rounded-lg object-contain"
        />
        <div aria-hidden="true">{marks}</div>
      </div>
      {children}
    </figure>
  );
}

/** A short text chip on the stage. Decorative: the reading says it in full. */
export function SceneChip({
  at: point,
  children,
  className,
  marker,
}: {
  at: ScenePoint;
  children: ReactNode;
  className?: string;
  marker: string;
}) {
  return (
    <span
      data-scene-mark={marker}
      style={at(point)}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-ink shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** One segment of a proportional strip, 0–100 of the strip's named axis. */
export type StripSegment = {
  key: string;
  percent: number;
  /** Fill classes; pair a colour with a pattern or border, never colour alone. */
  className: string;
};

/**
 * A tag's value as two lines: the amount, then its unit. "550,0 triệu" →
 * ["550", "triệu"]; "1,98 tỷ" → ["1,98", "tỷ"]. A decimal part of ONLY zeros
 * (",0", ",00") is dropped — it carries no information — but no other digit
 * ever is, and the unit is always kept whole, so nothing changes meaning.
 */
export function tagParts(value: string): { amount: string; unit: string } {
  const space = value.lastIndexOf(" ");
  const [amount, unit] = space === -1 ? [value, ""] : [value.slice(0, space), value.slice(space + 1)];
  return { amount: amount.replace(/,0+$/, ""), unit };
}

/**
 * A calibrated tag ON an object: the rounded value and a thin strip whose
 * fill is the value's share of a NAMED axis. `width` is the tag's width in
 * percent of the stage — the SAME for every tag sharing one axis, so equal
 * fills there mean equal amounts; a tag on another axis says which.
 *
 * NEVER TRUNCATED: the amount (12 px) and its unit (11 px) are two lines,
 * each whole, so the tag is a little taller rather than "350,0 tri…". Its
 * `at` is the tag's CENTRE; place it so a ~40 px tag stays inside a stage as
 * small as 190 × 127 px (`learning-scene-geometry` in the render tests).
 */
export function StageTag({
  at: point,
  width,
  value,
  segments,
  ghost,
  marker,
}: {
  at: ScenePoint;
  width: number;
  value: string;
  segments: readonly StripSegment[];
  ghost?: number | null;
  marker: string;
}) {
  const { amount, unit } = tagParts(value);
  return (
    <span
      data-scene-tag={marker}
      style={{ ...at(point), width: `${width}%` }}
      className="absolute min-w-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/95 px-1 pb-1 pt-0.5 text-center shadow-sm"
    >
      <span data-tag-amount="true" className="block whitespace-nowrap text-xs font-semibold leading-tight tabular-nums text-ink">
        {amount}
      </span>
      {unit === "" ? null : (
        <span data-tag-unit="true" className="block whitespace-nowrap text-[11px] leading-tight text-ink-2">
          {unit}
        </span>
      )}
      <SceneStrip marker={marker} segments={segments} ghost={ghost} className="mt-0.5 h-1.5" />
    </span>
  );
}

/**
 * A horizontal strip on a stated axis. `ghost` is where the total stood
 * before the latest press, on the SAME axis — so a change shows as movement,
 * not as a re-normalised 100%.
 */
export function SceneStrip({
  marker,
  segments,
  ghost,
  className,
}: {
  marker: string;
  segments: readonly StripSegment[];
  ghost?: number | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-scene-strip={marker}
      className={cn("relative flex h-3 w-full overflow-hidden rounded-full bg-ink-4/30", className)}
    >
      {segments.map((segment) => (
        <span
          key={segment.key}
          data-segment={segment.key}
          data-percent={clampPercent(segment.percent).toFixed(2)}
          className={cn("block h-full shrink-0", MARK_MOTION, segment.className)}
          style={{ width: `${clampPercent(segment.percent)}%` }}
        />
      ))}
      {ghost === null || ghost === undefined ? null : (
        <span
          data-scene-ghost={clampPercent(ghost).toFixed(2)}
          className={cn("absolute inset-y-0 block w-0.5 bg-ink", MARK_MOTION)}
          style={{ left: `calc(${clampPercent(ghost)}% - 1px)` }}
        />
      )}
    </span>
  );
}

/** The one-line reading under the stage: the scene in words, not live. */
export function SceneReading({ children }: { children: ReactNode }) {
  return (
    <p data-scene-reading="true" className="mt-2 text-sm leading-snug text-ink [overflow-wrap:anywhere]">
      {children}
    </p>
  );
}

/** The per-part explanations, collapsed: secondary to the scene above. */
export function SceneDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details data-scene-details="true" className="mt-3 text-sm">
      <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-brand-green-ink">
        {summary}
      </summary>
      {children}
    </details>
  );
}

/** The zones inside `SceneDetails`. */
export function SceneZones({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("mt-1 grid gap-2", wide ? "sm:grid-cols-2" : "sm:grid-cols-3")}>{children}</div>
  );
}

/** One annotation zone: a title, the rounded figure, its strip and notes. */
export function SceneZone({
  zone,
  title,
  value,
  children,
}: {
  /** Stable key for tests: "debt", "month", … */
  zone: string;
  title: string;
  value: string | null;
  children?: ReactNode;
}) {
  return (
    <div data-scene-zone={zone} className="min-w-0 rounded-lg bg-bg-soft p-2.5">
      <p className="text-sm leading-snug text-ink-2 [overflow-wrap:anywhere]">{title}</p>
      {value === null ? null : (
        <p className="mt-1 text-base font-medium leading-snug tabular-nums text-ink [overflow-wrap:anywhere]">
          {value}
        </p>
      )}
      {children}
    </div>
  );
}

/** A legend line under a strip: the swatch, the name, the rounded figure. */
export function StripLegend({
  items,
}: {
  items: readonly { key: string; swatch: string; label: string; value: string }[];
}) {
  return (
    <ul className="mt-1.5 space-y-0.5 text-sm leading-snug">
      {items.map((item) => (
        <li key={item.key} data-legend={item.key} className="flex items-start gap-2">
          <span aria-hidden="true" className={cn("mt-1 size-2.5 shrink-0 rounded-sm", item.swatch)} />
          <span className="min-w-0 text-ink-2 [overflow-wrap:anywhere]">
            {item.label}: <span className="font-medium tabular-nums text-ink">{item.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Fill classes the three scenes share, colour AND texture. */
export const FILL = {
  own: "bg-brand-green-ink",
  loan: "bg-[#aac391]",
  debt: "bg-[repeating-linear-gradient(135deg,#6d6d6d_0_2px,#bcbcbc_2px_5px)]",
  interest: "bg-ink-3",
  principal: "bg-brand-green-ink",
  trade: "bg-[repeating-linear-gradient(90deg,#117f36_0_2px,#aac391_2px_5px)]",
  reserve: "bg-[#c9b58c]",
  unused: "bg-white ring-1 ring-inset ring-ink-4",
} as const;
