import type { ReactNode } from "react";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import { cn } from "@/lib/cn";

/*
 * Living-infographic primitives (docs/design/living-infographic/brief.md,
 * approved 2026-09-29): a 3D miniature as CONTEXT, and accurate, code-drawn
 * 2D marks for every quantity. First consumers: /cong-cu/vay-mua-nha/ and
 * /cong-cu/vay-mua-xe/.
 *
 * - The image carries NO number, label or chart, and nothing is laid over it.
 *   It sits in a reserved box, so a missing image moves nothing.
 * - Every width is a share of a NAMED whole passed in by the caller; these
 *   components compute no finance.
 * - Marks move briefly only under `prefers-reduced-motion: no-preference`.
 * - Server-safe: no hooks, no state.
 */

/** The living-scene rasters' intrinsic size: 1983 × 793, a 2,5 : 1 band. */
export const LIVING_SCENE_SIZE = { width: 1983, height: 793 } as const;

/**
 * A text-free 3D scene band that sets the context. Decoration with a real alt.
 *
 * Drawn at its INTRINSIC 2,5 : 1 ratio — full width of its column up to
 * 650 px (≈ 650 × 260 on desktop, ≈ 300 × 120 on a 390 px phone), never a
 * fixed-height box that would shrink or squash it. `width`/`height` reserve
 * the space, so a missing or slow image moves nothing. Files: `${base}-650`
 * and `-1300` WebP, mechanical derivatives of the original PNG.
 */
export function InfographicArt({ base, alt }: { base: string; alt: string }) {
  return (
    <div data-infographic-art="true" className="mx-auto w-full max-w-[40.625rem]">
      {/* A plain <img>: the static export has no image loader. */}
      <img
        src={`${base}-650.webp`}
        srcSet={`${base}-650.webp 650w, ${base}-1300.webp 1300w`}
        sizes="(min-width: 768px) 40.625rem, calc(100vw - 4rem)"
        width={LIVING_SCENE_SIZE.width}
        height={LIVING_SCENE_SIZE.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="block h-auto w-full select-none"
      />
    </div>
  );
}

/** One segment of a split bar: its share of the bar's named whole. */
export type SplitSegment = {
  key: string;
  percent: number;
  /** Fill: a colour AND a pattern or border, never colour alone. */
  className: string;
  /** Shown INSIDE the segment only when it is wide enough to hold it. */
  inside?: string;
  /** Text colour for `inside`. */
  insideClassName?: string;
};

/** The share a segment needs before its label may sit inside it. */
export const INSIDE_LABEL_MIN_PERCENT = 18;

/** A horizontal split of one whole; direct labels go in a `SplitLegend`. */
export function SplitBar({
  marker,
  segments,
  className,
}: {
  marker: string;
  segments: readonly SplitSegment[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-split-bar={marker}
      className={cn("flex h-7 w-full overflow-hidden rounded-md bg-ink-4/30", className)}
    >
      {segments.map((segment) => {
        const percent = clampPercent(segment.percent);
        return (
          <div
            key={segment.key}
            data-segment={segment.key}
            data-percent={percent.toFixed(2)}
            className={cn("flex h-full shrink-0 items-center justify-center overflow-hidden", MARK_MOTION, segment.className)}
            style={{ width: `${percent}%` }}
          >
            {segment.inside !== undefined && percent >= INSIDE_LABEL_MIN_PERCENT ? (
              <span className={cn("whitespace-nowrap px-1 text-sm font-semibold tabular-nums", segment.insideClassName)}>
                {segment.inside}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Direct labels under a split bar: swatch, name, figure, one-line meaning. */
export function SplitLegend({
  items,
}: {
  items: readonly { key: string; swatch: string; label: string; value: string; meaning?: string }[];
}) {
  return (
    <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:flex sm:flex-wrap sm:gap-x-6">
      {items.map((item) => (
        <div key={item.key} data-split-label={item.key} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-sm text-ink-2">
            <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", item.swatch)} />
            {item.label}
          </dt>
          <dd className="text-base font-medium tabular-nums text-ink [overflow-wrap:anywhere]">{item.value}</dd>
          {item.meaning === undefined ? null : (
            <dd className="text-sm leading-snug text-ink-2">{item.meaning}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** One term of a flow equation: a starting amount, a subtraction, or the result. */
export type FlowItem = {
  key: string;
  op: "base" | "minus" | "result";
  label: string;
  /** Rounded figure; null means not known — said, never drawn as 0. */
  value: string | null;
  /** Shown instead of a value when `value` is null. */
  missing?: string;
  /** Extra classes for the result tile (its tone, with words). */
  className?: string;
  /** Optional control beside the term, e.g. a jump to its field. */
  action?: ReactNode;
};

/**
 * A readable subtraction: income − each commitment = what is left. Each tile
 * carries its own operator, so a wrapped row never strands a "−". The result
 * spans the row. Nothing here is computed; the caller supplies every figure.
 */
export function FlowEquation({ marker, items }: { marker: string; items: readonly FlowItem[] }) {
  return (
    <ol data-flow-equation={marker} className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.key}
          data-flow-item={item.key}
          data-flow-op={item.op}
          className={cn(
            "min-w-0 rounded-lg px-2.5 py-2",
            item.op === "result" ? "col-span-full" : "bg-white ring-1 ring-ink-4/30",
            item.className,
          )}
        >
          <p className="text-sm leading-snug text-ink-2">
            {item.op === "minus" ? <span aria-hidden="true">− </span> : null}
            {item.op === "result" ? <span aria-hidden="true">= </span> : null}
            {item.label}
          </p>
          <p
            className={cn(
              "tabular-nums [overflow-wrap:anywhere]",
              item.op === "result" ? "text-xl font-medium" : "text-base font-medium text-ink",
            )}
          >
            {item.value ?? item.missing ?? "—"}
          </p>
          {item.action ?? null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Two durations on ONE time axis from 0, each ending at its own payoff, with
 * the difference named. Widths are months over `axisMax`.
 */
export function TimelineCompare({
  marker,
  rows,
  axisMax,
  delta,
}: {
  marker: string;
  rows: readonly { key: string; label: string; value: number; text: string; className: string }[];
  axisMax: number;
  delta: string;
}) {
  return (
    <div data-timeline-compare={marker}>
      <ul className="space-y-2">
        {rows.map((row) => {
          const percent = axisMax > 0 ? clampPercent((row.value / axisMax) * 100) : 0;
          return (
            <li key={row.key} data-timeline-row={row.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="text-ink-2">{row.label}</span>
                <span className="font-medium tabular-nums text-ink">{row.text}</span>
              </div>
              <div aria-hidden="true" className="mt-1 h-3 w-full rounded-full bg-white ring-1 ring-ink-4/30">
                <div
                  data-timeline-percent={percent.toFixed(2)}
                  className={cn("h-3 rounded-full", MARK_MOTION, row.className)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p data-timeline-delta="true" className="mt-1.5 text-sm font-medium text-ink">
        {delta}
      </p>
    </div>
  );
}
