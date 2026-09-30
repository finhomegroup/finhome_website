"use client";

import { useId, useState } from "react";
import { ARITH_FILL, FixFieldButton, LimitState, OpenFormButton } from "@/components/arith-learning-bars";
import { TrialControls, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import {
  PRICE_TRIAL_KEYS,
  priceLesson,
  type PriceAdjustFormState,
  type PriceImpact,
  type PriceTrialKey,
} from "@/components/price-adjust-learning";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";
import { PRICE_ADJUST_LEARNING as L } from "@/content/calculators/price-adjust-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/*
 * /cong-cu/giam-gia-va-thue/'s price-tag path, in the layout's `learning` slot
 * after the ONE live answer. HTML only (the route forbids `<svg>`): one row
 * per ENGINE ledger line, a fixed bill scale, and the tax-inside line drawn
 * as the final price's composition. Nothing here is live. Hooks:
 * `data-pa="A1"` panel, A2 path, A3 step picker, A4 tries, A5 state.
 */

const OPTION =
  "inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-sm font-medium leading-tight text-ink hover:border-brand-green-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-green-ink";

export function PriceAdjustLearningPanel({
  sample,
  tried,
  state,
  formId,
  trial,
  impact,
}: {
  sample: boolean;
  tried: boolean;
  state: PriceAdjustFormState;
  formId: string;
  trial: { availability: Record<PriceTrialKey, TrialAvailability>; canUndo: boolean; onTry: (key: PriceTrialKey) => void; onUndo: () => void };
  impact: PriceImpact | null;
}) {
  const id = useId();
  // Observation only: which ledger line to read about. Clamped to the
  // current ledger, so a shorter bill never reads a stale step.
  const [picked, setPicked] = useState(0);
  const lesson = priceLesson(state);
  const index = lesson.kind === "ready" ? Math.min(picked, lesson.steps.length - 1) : 0;

  return (
    <section aria-labelledby={`${id}-t`} data-pa="A1" className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4">
      <h2 id={`${id}-t`} className="font-display text-base font-medium text-ink">
        {L.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">{L.intro}</p>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-1 text-sm leading-5 text-ink-2">
        {sample ? (tried ? W.basisTried : W.basisSample) : W.basisOwn}
      </p>
      <OpenFormButton formId={formId} />

      {lesson.kind === "refused" ? (
        <div data-pa="A5" data-pa-state="refused" className="mt-3 rounded-xl bg-bg-soft p-3">
          <p className="text-sm font-medium text-ink">{L.refused}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <FixFieldButton formId={formId} field="discountAmount" label={C.form.discountAmountLabel} />
            <FixFieldButton formId={formId} field="discountPercent" label={C.form.discountPercentLabel} />
          </div>
        </div>
      ) : lesson.kind === "limit" ? (
        <LimitState
          marker="price"
          formId={formId}
          fields={[
            { key: "price", label: C.form.priceLabel },
            { key: "discountAmount", label: C.form.discountAmountLabel },
          ]}
        />
      ) : lesson.kind === "empty" ? (
        <p data-pa="A5" data-pa-state="empty" className="mt-3 rounded-xl bg-bg-soft p-3 text-sm font-medium text-ink">
          {L.empty}
        </p>
      ) : (
        <div data-pa-illustration="true" className="mt-3 space-y-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3">
          {/* A2: one row per engine ledger line, in order. */}
          <ol data-pa="A2" className="space-y-2">
            {lesson.steps.map((s) => (
              <li key={s.key} data-pa-step={s.key} className={cn(s.index === index && "rounded-md ring-2 ring-brand-green-ink ring-offset-2 ring-offset-bg-soft")}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                  <span className={cn("text-ink-2", WRAP)}>{s.label}</span>
                  <span className={cn("font-medium tabular-nums text-ink", WRAP)}>
                    {s.key === "list" ? s.balance : `${s.delta} → ${s.balance}`}
                  </span>
                </div>
                {s.composition !== null ? (
                  <div aria-hidden="true" data-pa-composition="true" className="mt-1 flex h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-ink-4/30">
                    <span className={cn("h-full", MARK_MOTION, ARITH_FILL.hatch)} style={{ width: `${clampPercent(s.composition.net)}%` }} />
                    <span className={cn("h-full", MARK_MOTION, ARITH_FILL.solid)} style={{ width: `${clampPercent(s.composition.tax)}%` }} />
                  </div>
                ) : s.percent === null ? null : (
                  <div aria-hidden="true" className="mt-1 h-3 w-full rounded-full bg-white ring-1 ring-ink-4/30">
                    <div data-percent={clampPercent(s.percent).toFixed(2)} className={cn("h-3 rounded-full", MARK_MOTION, s.key === "taxAdded" ? ARITH_FILL.light : ARITH_FILL.solid)} style={{ width: `${clampPercent(s.percent)}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className={cn("text-sm leading-snug text-ink-2", WRAP)}>{lesson.scaleText}</p>
          {lesson.compositionText === null ? null : (
            <p data-pa-composition-text="true" className={cn("text-sm leading-snug text-ink", WRAP)}>{lesson.compositionText}</p>
          )}
          <p data-pa-mode={state.taxIncluded ? "included" : "excluded"} className="text-sm leading-snug text-ink">{lesson.modeText}</p>
          <p className="text-sm leading-snug text-ink-2">{L.rateNote}</p>
          {lesson.successive === null ? null : (
            <p data-pa-successive="true" className={cn("text-sm font-medium leading-snug text-ink", WRAP)}>{lesson.successive}</p>
          )}

          {/* A3: pick one engine step; never writes the form. */}
          <fieldset data-pa="A3" className="min-w-0">
            <legend className="text-sm font-medium text-ink">{L.stepLegend}</legend>
            <div className="mt-1 grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2">
              {lesson.steps.map((s) => (
                <label key={s.key} className={cn(OPTION, FH_POINTER, s.index === index && "border-brand-green-ink")}>
                  <input
                    type="radio"
                    name={`${id}-step`}
                    value={s.index}
                    checked={s.index === index}
                    onChange={() => setPicked(s.index)}
                    data-pa-pick={s.key}
                    className="size-4 shrink-0 accent-brand-green-ink"
                  />
                  <span className={WRAP}>{s.label}</span>
                </label>
              ))}
            </div>
            <p data-pa-reading={lesson.steps[index].key} className={cn("mt-2 text-sm leading-snug text-ink", WRAP)}>
              {lesson.steps[index].reading}
            </p>
            <p className="mt-1 text-sm leading-snug text-ink-2">{L.stepNote}</p>
          </fieldset>
        </div>
      )}

      <div data-pa="A4">
        <TrialControls
          idBase={`${id}-try`}
          keys={PRICE_TRIAL_KEYS}
          labels={{
            secondDiscountPercent: L.trials.secondDiscountPercent.label,
            discountAmount: L.trials.discountAmount.label,
            taxIncluded: L.trials.taxIncluded.label,
          }}
          availability={trial.availability}
          canUndo={trial.canUndo}
          undoLabel={W.undo}
          undoNone={W.undoNone}
          openFormLabel={W.openForm}
          formId={formId}
          onTry={trial.onTry}
          onUndo={trial.onUndo}
          showOpenForm={false}
        />
        {impact === null || lesson.kind !== "ready" ? null : (
          <div data-pa-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
            <p className="text-sm font-medium text-ink">{W.impactHeading}</p>
            <p className={cn("mt-1 text-sm leading-snug text-ink", WRAP)}>{impact.fieldLine}</p>
            {impact.lines.map((line) => (
              <p key={line} className={cn("mt-1 text-sm leading-snug text-ink", WRAP)}>
                {line}
              </p>
            ))}
            <p className="mt-1 text-sm font-medium leading-snug text-ink">{impact.tradeoff}</p>
          </div>
        )}
      </div>
      <p data-learning-limits="true" className="mt-3 text-sm leading-relaxed text-ink-2">{L.limits}</p>
    </section>
  );
}
