"use client";

import { useId } from "react";
import type { AccumulationImpact, AccumulationView } from "@/components/calc/accumulation";
import { formJumpTarget, PairBars, TrialControls, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import { InfographicArt } from "@/components/calc/living-infographic";
import { focusAndScroll } from "@/components/calc/result-cta";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/** The text-free 3D savings scene (Codex, 2026-09-29): context only. */
export const SAVINGS_ART = "/images/tools/savings-living-scene-v1";

/** Colour AND texture. Interest is sand, never a success green. */
export const ACCUMULATION_FILL = {
  initial: "bg-ink-3/70",
  added: "bg-[repeating-linear-gradient(135deg,#117f36_0_3px,#7fb893_3px_6px)]",
  interest: "bg-[radial-gradient(#8a7650_1px,#c9b58c_1px)] bg-[length:5px_5px]",
} as const;

/** A 44 px pill; its label may wrap inside it, never past its edge. */
const STEP =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-center text-sm font-medium leading-tight text-brand-green-ink [overflow-wrap:anywhere] hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2";

/** The copy every accumulation panel needs; each tool supplies its own. */
export type AccumulationCopy = {
  title: string;
  basisSample: string;
  basisOwn: string;
  artAlt: string;
  cursorLabel: string;
  steps: Record<"first" | "prev" | "next" | "last", { short: string; name: string }>;
  undo: string;
  undoNone: string;
  openForm: string;
  limits: string;
  fix: string;
};

/**
 * The F3 accumulation panel, in `CalculatorLayout`'s `learning` slot on
 * /cong-cu/muc-tieu-tiet-kiem/ and /cong-cu/lai-kep/: after the answer, before
 * the actions and the full chart, same DOM order at every width.
 *
 * The 3D scene is context; the data is a code-drawn vessel whose three
 * stacked fills — starting money, money added, interest — are one engine
 * row on one named scale, with a dashed target mark only where a target
 * exists. One native range plus four ≥ 44 px steps move the cursor over the
 * engine's own rows. Fills move only under `motion-safe`; nothing idles.
 * NOTHING HERE IS LIVE — the page's one live region stays the answer.
 */
export function AccumulationLearningPanel<K extends string>({
  marker,
  copy,
  sample,
  view,
  emptyText,
  emptyFix,
  onIndex,
  formId,
  trial,
  impact,
}: {
  marker: string;
  copy: AccumulationCopy;
  sample: boolean;
  view: AccumulationView | null;
  emptyText: string;
  /**
   * True only when a field is actually invalid. A valid form with no answer
   * (no whole period, no money, no schedule) gets its reason and no
   * "Sửa ô đang báo lỗi" — there is no bad field to jump to.
   */
  emptyFix: boolean;
  onIndex: (index: number) => void;
  formId: string;
  trial: {
    keys: readonly K[];
    labels: Record<K, string>;
    availability: Record<K, TrialAvailability>;
    canUndo: boolean;
    onTry: (key: K) => void;
    onUndo: () => void;
  };
  impact: AccumulationImpact | null;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      data-accumulation-learning={marker}
      className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4"
    >
      <h2 id={titleId} className="font-display text-base font-medium text-ink">
        {copy.title}
      </h2>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? copy.basisSample : copy.basisOwn}
      </p>

      {view === null ? (
        <figure
          data-learning-illustration="true"
          data-scene-state="unknown"
          className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
        >
          <figcaption className="text-sm font-medium leading-snug text-ink">{emptyText}</figcaption>
          {emptyFix ? (
            <button
              type="button"
              data-scene-fix="true"
              onClick={() => {
                const target = formJumpTarget(document.getElementById(formId));
                if (target instanceof HTMLElement) focusAndScroll(target);
              }}
              className={cn(STEP, "mt-2", FH_POINTER)}
            >
              {copy.fix}
            </button>
          ) : null}
        </figure>
      ) : (
        <Moment idBase={id} copy={copy} view={view} onIndex={onIndex} />
      )}

      <TrialControls
        idBase={id}
        keys={trial.keys}
        labels={trial.labels}
        availability={trial.availability}
        canUndo={trial.canUndo}
        undoLabel={copy.undo}
        undoNone={copy.undoNone}
        openFormLabel={copy.openForm}
        formId={formId}
        onTry={trial.onTry}
        onUndo={trial.onUndo}
      />

      {impact === null ? null : (
        <div data-learning-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
          <p className="text-sm font-medium text-ink">{impact.heading}</p>
          {impact.lines.map((line) => (
            <p key={line} className={cn("mt-1 text-sm leading-relaxed text-ink", WRAP)}>
              {line}
            </p>
          ))}
          {impact.bars === null ? null : <PairBars title={impact.barsTitle} note={impact.barsNote} bars={impact.bars} />}
        </div>
      )}

      <p data-learning-limits="true" className="mt-3 text-sm leading-relaxed text-ink-2">
        {copy.limits}
      </p>
    </section>
  );
}

function Moment({
  idBase,
  copy,
  view,
  onIndex,
}: {
  idBase: string;
  copy: AccumulationCopy;
  view: AccumulationView;
  onIndex: (index: number) => void;
}) {
  const rangeId = `${idBase}-cursor`;
  const { index, lastIndex } = view;
  const go = (target: number) => onIndex(Math.min(Math.max(0, target), lastIndex));
  const steps = [
    ["first", 0, index === 0],
    ["prev", index - 1, index === 0],
    ["next", index + 1, index >= lastIndex],
    ["last", lastIndex, index >= lastIndex],
  ] as const;
  // Stacked from the bottom by absolute offsets: no CSS reordering. Each
  // offset is the sum of the heights below it, computed before rendering.
  const stack = view.segments.map((segment, i) => ({
    segment,
    height: clampPercent(segment.percent),
    at: view.segments.slice(0, i).reduce((sum, s) => sum + clampPercent(s.percent), 0),
  }));

  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="ready"
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: a text-free 3D scene. No figure is drawn on it. */}
      <InfographicArt base={SAVINGS_ART} alt={copy.artAlt} />
      <figcaption data-accumulation-caption="true" className="mt-1 text-center text-sm font-medium leading-snug text-ink">
        {view.caption}
      </figcaption>

      {/* Below 420 px the vessel stands above a FULL-WIDTH legend: beside it,
          a 320 px pass left the legend 144 px split into two 66 px columns
          and broke amounts mid-figure. Same DOM order at every width. */}
      <div data-accumulation-body="true" className="mt-3 flex flex-col items-center gap-3 min-[420px]:flex-row min-[420px]:items-end">
        {/* The vessel: one engine row on one named scale. */}
        <div
          aria-hidden="true"
          data-vessel="true"
          className="relative h-44 w-20 shrink-0 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-ink-4/60 bg-white"
        >
          {stack.map(({ segment, height, at }) => (
            <div
              key={segment.key}
              data-segment={segment.key}
              data-percent={height.toFixed(2)}
              className={cn("absolute inset-x-0", MARK_MOTION, ACCUMULATION_FILL[segment.key])}
              style={{ bottom: `${at}%`, height: `${height}%` }}
            />
          ))}
          {view.targetPercent === null ? null : (
            <div
              data-vessel-target={clampPercent(view.targetPercent).toFixed(2)}
              className="absolute inset-x-0 z-10 border-t-2 border-dashed border-ink"
              // Kept INSIDE the frame at 100%: at `bottom: 100%` the mark sat
              // under the vessel's top border and disappeared. The value is
              // unchanged; only the drawn position is inset by 4 px.
              style={{ bottom: `min(${clampPercent(view.targetPercent)}%, calc(100% - 4px))` }}
            />
          )}
        </div>
        <div className="w-full min-w-0 flex-1">
          <p
            data-accumulation-balance="true"
            className="font-display text-xl font-medium tabular-nums text-ink [overflow-wrap:anywhere]"
          >
            {view.balanceText}
          </p>
          {/* ONE column: label and swatch left, the amount right and whole.
              A row WRAPS when both do not fit: at 320 px a 1e15 amount left
              its label 48 px wide, so the amount drops under the label
              instead of squeezing it. Local to this panel; `SplitLegend` is
              unchanged for the earlier tools. */}
          <dl data-accumulation-legend="true" className="mt-1.5 space-y-1.5">
            {view.segments.map((segment) => (
              <div
                key={segment.key}
                data-split-label={segment.key}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
              >
                <dt className="flex items-center gap-1.5 text-sm leading-snug text-ink-2">
                  <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", ACCUMULATION_FILL[segment.key])} />
                  {segment.label}
                </dt>
                {/* Whole, not squeezed: `nowrap` keeps "506,6 triệu" on one
                    line; no `shrink-0` beside a figure (detail-ui contract). */}
                <dd className="whitespace-nowrap text-base font-medium tabular-nums text-ink">{segment.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mt-2 text-sm leading-snug text-ink-2">{view.scaleText}</p>
      {view.targetLine === null ? null : (
        <p data-accumulation-target="true" className="mt-1 text-sm font-medium leading-snug text-ink">
          {view.targetLine}
        </p>
      )}
      <p data-accumulation-sentence="true" className={cn("mt-2 text-sm leading-relaxed text-ink", WRAP)}>
        {view.sentence}
      </p>

      {lastIndex > 0 ? (
        <div data-accumulation-cursor={index} className="mt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <label htmlFor={rangeId} className="text-sm text-ink-2">
              {copy.cursorLabel}
            </label>
            <span data-accumulation-position="true" className="text-sm font-medium tabular-nums text-ink">
              {view.position}
            </span>
          </div>
          <input
            id={rangeId}
            type="range"
            min={0}
            max={lastIndex}
            step={1}
            value={index}
            aria-valuetext={view.caption}
            onChange={(event) => go(Number(event.target.value))}
            className={cn("h-11 w-full accent-brand-green-ink", FH_POINTER)}
          />
          <div data-cursor-steps="true" className="grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-4">
            {steps.map(([key, target, off]) => (
              <button
                key={key}
                type="button"
                data-cursor-step={key}
                aria-label={copy.steps[key].name}
                aria-disabled={off ? true : undefined}
                aria-controls={rangeId}
                onClick={() => {
                  if (!off) go(target);
                }}
                className={cn(STEP, FH_POINTER)}
              >
                {copy.steps[key].short}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {view.notes.length === 0 ? null : (
        <ul data-accumulation-notes="true" className="mt-2 space-y-1 text-sm leading-snug text-ink-2">
          {view.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </figure>
  );
}
