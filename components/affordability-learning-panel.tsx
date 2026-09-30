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
  type AffordabilitySceneView,
  type FormValues,
  type TrialAvailability,
  type TrialImpactView,
  type TrialKey,
} from "@/components/affordability-learning";
import { FILL, SceneDetails } from "@/components/calc/learning-scene";
import { SplitBar, SplitLegend } from "@/components/calc/living-infographic";
import { AFFORDABILITY_LEARNING as L } from "@/content/calculators/affordability-learning";
import { fill } from "@/lib/calc/charts/labels";
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
 * "Thử một thay đổi" on /cong-cu/kha-nang-mua-nha/ only, in
 * `CalculatorLayout`'s opt-in `learning` slot: after the answer rows, before
 * the actions and the charts (independent review, 2026-09-29 — it had sat
 * above both columns). `nha-o-xa-hoi` renders none.
 *
 * THE CONTROLS COME FIRST, the card after. The status card's height changes
 * with the verdict — measured 577 px on a 390 px phone after a reserve try —
 * so it sits AFTER the tries in the DOM, where its growth cannot move the
 * button just pressed. One column at every width: the slot is the result
 * column, too narrow for the old two-column split. Nothing is reordered.
 *
 * THE SCENE SITS RIGHT UNDER THE BUTTONS (2026-09-28 repair: it was 900 px
 * away on a phone); what a press did and the card follow it.
 *
 * THE CARD RENDERS ONCE, HERE; the result group keeps the rows and the ONE
 * live sentence. Nothing in this panel is live.
 *
 * A PRESS NEVER MOVES FOCUS OR THE BUTTONS. They stay mounted —
 * `aria-disabled`, not `disabled`, so a blocked one keeps focus and reads its
 * reason — and what a press did appears below them: a rounded headline, two
 * bars on one axis from 0, the cause, and the exact đồng behind a disclosure.
 *
 * THE SCENE (living infographic F1, 2026-09-29): the 3D trays as unlabelled
 * context — nothing is laid on the picture — then two code-drawn readings,
 * each a bar whose 100% is named: the price, and the savings. It can only
 * ever be below the controls, so it cannot move them.
 *
 * FRAMELESS BELOW `sm`, like the first pair: the page's card already frames
 * it, and a second border and padding cost a 320 px phone its width.
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
  scene,
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
  /** The integrated scene, figures resolved from the result on screen. */
  scene: AffordabilitySceneView;
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
      className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4"
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

        {/* The scene RIGHT UNDER the buttons that move it: on a 390 × 844
            phone both fit one screen. Nothing above it can grow. */}
        <AffordabilityScene scene={scene} />
      </div>

      {/* What a press did, then the verdict — never between the buttons
          and the scene. */}
      <div className="mt-4 min-w-0">
        {impact === null ? null : <TrialImpact impact={impact} />}
        <ResultStatusCard status={status} formId={formId} />
      </div>
    </section>
  );
}

/** Concept A, 2026-09-28: apartment, two trays and a separate box. */
const TRAYS_BASE = "/images/tools/affordability-trays";

/**
 * The trays at their intrinsic 3 : 2 (720 × 480 and 1200 × 800 WebP), then
 * the two readings. Without a readable price, no figure is drawn — only the
 * picture and the reason.
 */
function AffordabilityScene({ scene }: { scene: AffordabilitySceneView }) {
  const S = L.scene;
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state={scene.kind}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: nothing is drawn on the picture. `width`/`height` reserve
          its 3 : 2 box, so a missing image moves nothing. */}
      <div data-scene-art="true" className="mx-auto w-full max-w-[22rem]">
        {/* A plain <img>: the static export has no image loader. */}
        <img
          src={`${TRAYS_BASE}-720.webp`}
          srcSet={`${TRAYS_BASE}-720.webp 720w, ${TRAYS_BASE}-1200.webp 1200w`}
          sizes="(min-width: 640px) 22rem, calc(100vw - 4rem)"
          width={1200}
          height={800}
          alt={S.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none rounded-lg"
        />
      </div>
      <figcaption className="mt-1 text-center text-sm font-medium leading-snug text-ink">{S.title}</figcaption>

      {scene.kind !== "ready" ? (
        <p data-scene-message={scene.kind} className="mt-2 text-sm leading-relaxed text-ink-2">
          {S[scene.kind]}
        </p>
      ) : (
        <>
          {/* Reading 1 — 100% is the reference price. */}
          <div data-scene-reading="price" className="mt-3">
            <p className="font-display text-xl font-medium tabular-nums text-brand-green-ink">
              {fill(S.priceHeading, { price: scene.price.wholeText })}
            </p>
            <p className="text-sm leading-snug text-ink-2">{S.priceWhole}</p>
            <SplitBar
              marker="price"
              className="mt-2"
              segments={[
                {
                  key: "own",
                  percent: scene.price.ownPercent,
                  className: FILL.own,
                  inside: scene.price.ownShareText,
                  insideClassName: "text-white",
                },
                {
                  key: "loan",
                  percent: scene.price.loanPercent,
                  className: FILL.loan,
                  inside: scene.price.loanShareText,
                  insideClassName: "text-ink",
                },
              ]}
            />
            <SplitLegend
              items={[
                { key: "own", swatch: FILL.own, label: S.priceOwn, value: scene.price.ownText, meaning: S.priceOwnMeaning },
                { key: "loan", swatch: FILL.loan, label: S.priceLoan, value: scene.price.loanText, meaning: S.priceLoanMeaning },
              ]}
            />
            {scene.noLoan === null ? null : (
              <p data-scene-no-loan={scene.noLoan} className="mt-2 text-sm leading-snug text-ink">
                {scene.noLoan === "ltv" ? S.noLoanLtv : S.noLoanCapacity}
              </p>
            )}
          </div>

          {/* Reading 2 — 100% is the savings. The reserve is here, not in the price. */}
          <div data-scene-reading="savings" className="mt-4">
            {scene.savings === null ? (
              <p className="text-sm leading-relaxed text-ink-2">{S.noSavings}</p>
            ) : (
              <>
                <p className="text-base font-medium tabular-nums text-ink">
                  {fill(S.savingsHeading, { savings: scene.savings.wholeText })}
                </p>
                <p className="text-sm leading-snug text-ink-2">{S.savingsWhole}</p>
                <SplitBar
                  marker="savings"
                  className="mt-2"
                  segments={[
                    { key: "toPrice", percent: scene.savings.toPricePercent, className: FILL.own },
                    { key: "fees", percent: scene.savings.feesPercent, className: FILL.trade },
                    { key: "unused", percent: scene.savings.unusedPercent, className: FILL.unused },
                    { key: "reserve", percent: scene.savings.reservePercent, className: RESERVE },
                  ]}
                />
                <SplitLegend
                  items={[
                    { key: "toPrice", swatch: FILL.own, label: S.savingsToPrice, value: scene.savings.toPriceText },
                    { key: "fees", swatch: FILL.trade, label: S.savingsFees, value: scene.savings.feesText },
                    ...(scene.savings.unusedText === null
                      ? []
                      : [{ key: "unused", swatch: FILL.unused, label: S.savingsUnused, value: scene.savings.unusedText }]),
                    { key: "reserve", swatch: RESERVE, label: S.savingsReserve, value: scene.savings.reserveText },
                  ]}
                />
                <p data-scene-tradeoff="true" className="mt-2 text-sm leading-snug text-ink">
                  {scene.savings.reserveOverSavings
                    ? fill(S.reserveOver, {
                        typed: scene.savings.reserveTypedText,
                        kept: scene.savings.reserveText,
                      })
                    : S.tradeoff}
                </p>
              </>
            )}
          </div>
          <p className="mt-2 text-sm leading-snug text-ink-2">{S.roundedNote}</p>
          <SceneDetails summary={S.details}>
            <dl data-scene-exact="true" className="mt-1 grid grid-cols-1 gap-1 pb-1 min-[420px]:grid-cols-2">
              {scene.exact.map((row) => (
                <div key={row.key} data-exact-row={row.key} className="flex flex-wrap justify-between gap-x-3 text-ink-2">
                  <dt>{row.label}</dt>
                  <dd className={cn("font-medium tabular-nums text-ink", WRAP)}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </SceneDetails>
        </>
      )}
    </figure>
  );
}

/** The reserve: a sand tone AND a dotted texture, never colour alone. */
const RESERVE = "bg-[radial-gradient(#8a7650_1px,#c9b58c_1px)] bg-[length:5px_5px]";

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
