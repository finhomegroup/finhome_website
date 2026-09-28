"use client";

import { useId, useReducer } from "react";
import { focusAndScroll } from "@/components/calc/result-cta";
import { ResultStatusCard, type StatusView } from "@/components/calc/result-status";
import { ResultTable } from "@/components/calc/result-table";
import {
  heldTrials,
  INITIAL_LEARNING,
  learningReducer,
  TRIAL_KEYS,
  type FormValues,
  type IllustrationPart,
  type TrialAvailability,
  type TrialImpactView,
  type TrialKey,
} from "@/components/affordability-learning";
import { AFFORDABILITY_LEARNING as L } from "@/content/calculators/affordability-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * The tries' state for one form: the manual-edit revision, the tries still in
 * force, and the one dispatcher. Hooks cannot be conditional, so the NOXH
 * route holds this too and never renders it.
 */
export function useAffordabilityLearning(values: FormValues) {
  const [state, dispatch] = useReducer(learningReducer, INITIAL_LEARNING);
  return { state, trials: heldTrials(state, values), dispatch };
}

/** The part of a DOM element `formJumpTarget` needs — so a test can pass a fake. */
type Queryable<T> = { querySelector: (selector: string) => T | null };

/**
 * Where "Nhập số của bạn" lands: the first field marked invalid, else the
 * first control in the form. It moves focus only; it writes nothing.
 */
export function formJumpTarget<T>(form: Queryable<T> | null): T | null {
  if (form === null) return null;
  return (
    form.querySelector('[aria-invalid="true"]') ??
    form.querySelector("input, select, textarea")
  );
}

/** A 44 px pill that fills its half of the row on a phone; two tight lines fit. */
const BUTTON =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border bg-white px-3 py-1 text-center text-sm font-medium leading-tight";

const PRIMARY =
  "border-brand-green-ink text-brand-green-ink transition-colors hover:bg-brand-green-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-not-allowed aria-disabled:border-ink-4/40 aria-disabled:bg-transparent aria-disabled:text-ink-2 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-2";

const SECONDARY =
  "border-ink-4/60 text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2 aria-disabled:hover:border-ink-4/40";

/** Long figures wrap inside their cell rather than widen the panel. */
const WRAP = "min-w-0 [overflow-wrap:anywhere]";

/**
 * "Thử một thay đổi" on /cong-cu/kha-nang-mua-nha/, above the form.
 *
 * THE CONTROLS COME FIRST, the card after. The status card's height changes
 * with the verdict — measured 577 px on a 390 px phone after a reserve try —
 * so it sits AFTER the tries in the DOM, where its growth cannot move the
 * button just pressed. From `lg` the controls are the left column and the
 * card the right, in that same DOM order; nothing is reordered by CSS.
 *
 * THE CARD RENDERS ONCE, HERE; the result group keeps the rows and the ONE
 * live sentence. Nothing in this panel is live.
 *
 * A PRESS NEVER MOVES FOCUS OR THE BUTTONS. They stay mounted —
 * `aria-disabled`, not `disabled`, so a blocked one keeps focus and reads its
 * reason — and what a press did appears below them: a rounded headline, two
 * bars on one axis from 0, the cause, and the exact đồng behind a disclosure.
 *
 * THE ILLUSTRATION COMES LAST, after the card: a restrained 3D picture whose
 * trays the HTML legend names, with the engine's rounded figures beside
 * them. It can only ever be below the controls, so it cannot move them.
 *
 * Presentational: every sentence and width arrives resolved from
 * `affordability-learning.ts`; nothing here computes a figure.
 */
export function AffordabilityLearningPanel({
  status,
  formId,
  sample,
  availability,
  sharedReason,
  impact,
  illustration,
  canUndo,
  onTry,
  onUndo,
}: {
  status: StatusView;
  /** The form region the card's jumps and "Nhập số của bạn" search. */
  formId: string;
  /** True while the figures are the shipped example plus presses only. */
  sample: boolean;
  availability: Record<TrialKey, TrialAvailability>;
  /** The reason BOTH tries are off, said once; null when neither is blocked by it. */
  sharedReason: string | null;
  /** The latest press that still holds, or null. */
  impact: TrialImpactView | null;
  /** The legend of the picture, figures resolved from the result on screen. */
  illustration: readonly IllustrationPart[];
  canUndo: boolean;
  onTry: (key: TrialKey) => void;
  onUndo: () => void;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const sharedId = `${id}-blocked`;
  const undoNoneId = `${id}-undo-none`;
  const reasonId = (key: TrialKey) => `${id}-${key}-blocked`;

  return (
    <section
      aria-labelledby={titleId}
      data-affordability-learning="true"
      className="mb-6 rounded-2xl border border-ink-4/20 bg-white p-4 lg:grid lg:grid-cols-2 lg:gap-x-6"
    >
      <div data-learning-controls="true" className="min-w-0">
        <h2 id={titleId} className="font-display text-base font-medium text-ink">
          {L.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">{L.intro}</p>
        <p data-learning-basis={sample ? "sample" : "own"} className="mt-1 text-xs leading-5 text-ink-2">
          {sample ? L.basisSample : L.basisOwn}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {TRIAL_KEYS.map((key) => {
            const state = availability[key];
            const described = state.enabled
              ? undefined
              : sharedReason !== null
                ? sharedId
                : reasonId(key);
            return (
              <button
                key={key}
                type="button"
                data-learning-try={key}
                aria-disabled={state.enabled ? undefined : true}
                aria-describedby={described}
                onClick={(event) => {
                  // A double-click is one press; a key press has detail 0.
                  if (event.detail > 1 || !state.enabled) return;
                  onTry(key);
                }}
                className={cn(BUTTON, PRIMARY, FH_POINTER)}
              >
                {L.trials[key].label}
              </button>
            );
          })}
          <button
            type="button"
            data-learning-undo="true"
            aria-disabled={canUndo ? undefined : true}
            aria-describedby={canUndo ? undefined : undoNoneId}
            onClick={(event) => {
              if (event.detail > 1 || !canUndo) return;
              onUndo();
            }}
            className={cn(BUTTON, SECONDARY, FH_POINTER)}
          >
            {L.undo}
          </button>
          {/* To the reader's own figures: the first field with an error,
              else the first field. Focus only; no value is written. */}
          <button
            type="button"
            data-learning-open-form="true"
            onClick={() => {
              const target = formJumpTarget(document.getElementById(formId));
              if (target instanceof HTMLElement) focusAndScroll(target);
            }}
            className={cn(BUTTON, SECONDARY, FH_POINTER)}
          >
            {L.openForm}
          </button>
        </div>
        {canUndo ? null : (
          <span id={undoNoneId} className="sr-only">
            {L.undoNone}
          </span>
        )}

        {sharedReason !== null ? (
          <p id={sharedId} data-learning-blocked="all" className="mt-2 text-sm leading-relaxed text-ink-2">
            {sharedReason}
          </p>
        ) : (
          TRIAL_KEYS.map((key) => {
            const state = availability[key];
            return state.enabled ? null : (
              <p
                key={key}
                id={reasonId(key)}
                data-learning-blocked={key}
                className="mt-2 text-sm leading-relaxed text-ink-2"
              >
                {state.reason}
              </p>
            );
          })
        )}

        {impact === null ? null : <TrialImpact impact={impact} />}
      </div>

      <div className="mt-4 min-w-0 lg:mt-0">
        <ResultStatusCard status={status} formId={formId} className="lg:mt-0" />
        <LearningIllustration parts={illustration} />
      </div>
    </section>
  );
}

/** Concept A, 2026-09-28: `public/images/tools/affordability-trays-*.webp`. */
const TRAYS = {
  src: "/images/tools/affordability-trays-720.webp",
  srcSet:
    "/images/tools/affordability-trays-720.webp 720w, /images/tools/affordability-trays-1200.webp 1200w",
  width: 1536,
  height: 1024,
} as const;

/** Legend keys, matched by eye to the trays in the picture; text carries the meaning. */
const SWATCH: Record<IllustrationPart["key"], string> = {
  own: "border-[#2a6b49] bg-[#2a6b49]",
  loan: "border-[#8fa878] bg-[#aac391]",
  reserve: "border-ink-4 bg-[#f4ebdc]",
};

/**
 * The picture and its HTML legend. The image holds no figure and does not
 * change with the answer; every number is the legend's, from the engine.
 */
function LearningIllustration({ parts }: { parts: readonly IllustrationPart[] }) {
  const I = L.illustration;
  const withFigures = parts.some((part) => part.value !== null);
  return (
    <figure
      data-learning-illustration="true"
      className="mt-4 rounded-xl border border-ink-4/15 bg-bg-soft p-3 sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-center sm:gap-4"
    >
      <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-none">
        {/* A plain <img>: the static export has no image loader. */}
        <img
          src={TRAYS.src}
          srcSet={TRAYS.srcSet}
          sizes="(min-width: 640px) 12rem, 18rem"
          width={TRAYS.width}
          height={TRAYS.height}
          alt={I.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none rounded-lg"
        />
        <span
          data-illustration-badge="true"
          className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-ink-2"
        >
          {I.badge}
        </span>
      </div>
      <figcaption className="mt-3 min-w-0 sm:mt-0">
        <p className="text-sm font-medium text-ink">{I.title}</p>
        <ul className="mt-2 space-y-1.5">
          {parts.map((part) => (
            <li
              key={part.key}
              data-illustration-part={part.key}
              className="flex items-start gap-2 text-sm leading-snug"
            >
              <span
                aria-hidden="true"
                className={cn("mt-1 size-3 shrink-0 rounded-sm border", SWATCH[part.key])}
              />
              <span className={WRAP}>
                <span className="font-medium text-ink">{part.label}:</span>{" "}
                <span className="text-ink-2">{part.meaning}</span>
                {part.value === null ? null : (
                  <>
                    {" — "}
                    <span className="font-medium tabular-nums text-ink">{part.value}</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p data-illustration-fees="true" className="mt-2 text-sm leading-snug text-ink-2">
          {I.feesNote}
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-2">
          {withFigures ? I.figuresNote : I.noFigures} {I.caption}
        </p>
      </figcaption>
    </figure>
  );
}

/** What the latest press did: headline, bars, cause, then the exact figures. */
function TrialImpact({ impact }: { impact: TrialImpactView }) {
  const I = L.impact;
  return (
    <div data-learning-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">{I.heading}</p>
      <p className={cn("mt-1 text-sm leading-relaxed text-ink", WRAP)}>{impact.fieldLine}</p>
      <p className="mt-1 font-display text-base font-medium text-ink">{impact.change}</p>
      {impact.statusLine ? (
        <p className="mt-1 text-sm leading-relaxed text-ink">{impact.statusLine}</p>
      ) : null}
      {impact.bindingLine ? (
        <p className="mt-1 text-sm leading-relaxed text-ink-2">{impact.bindingLine}</p>
      ) : null}

      {/* Two bars on ONE axis from 0 to the larger price. Before is neutral
          grey, after is brand ink: neither colour means good or bad, and each
          bar carries its label and rounded figure in text. */}
      <figure data-learning-bars="true" className="mt-3">
        <figcaption className="text-sm font-medium text-ink">{I.barsTitle}</figcaption>
        <ul className="mt-2 space-y-2">
          {impact.bars.map((bar) => (
            <li key={bar.side} data-learning-bar={bar.side}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="text-ink-2">{bar.label}</span>
                <span className={cn("font-medium tabular-nums text-ink", WRAP)}>{bar.text}</span>
              </div>
              <div aria-hidden="true" className="mt-1 h-3 w-full rounded-full bg-white">
                <div
                  data-bar-percent={bar.percent.toFixed(2)}
                  className={cn(
                    "h-3 rounded-full",
                    bar.side === "before" ? "bg-ink-3" : "bg-brand-green-ink",
                  )}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs leading-5 text-ink-2">{I.barsNote}</p>
      </figure>

      <p className="mt-3 text-sm leading-relaxed text-ink-2">{impact.why}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{impact.lesson}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{impact.question}</p>

      <details data-learning-exact="true" className="mt-3 text-sm">
        <summary className={cn("cursor-pointer font-medium text-brand-green-ink", FH_POINTER)}>
          {I.exactTitle}
        </summary>
        {/* The suite's own table: one card per row below `md` (figures kept
            whole on one line), a contained scroll frame from `md`. Plain
            pre-formatted strings — this disclosure is the exact reading, so
            no typed money cells and no compact/exact switch. */}
        <ResultTable
          className="mt-2"
          caption={I.exactCaption}
          mobileCards
          columns={[
            { label: I.exactItem },
            { label: I.exactBefore, numeric: true },
            { label: I.exactAfter, numeric: true },
          ]}
          rows={[
            ...impact.exact.rows.map((row) => [row.label, row.before, row.after]),
            [I.exactPriceChange, "", impact.exact.change],
          ]}
        />
      </details>
    </div>
  );
}
