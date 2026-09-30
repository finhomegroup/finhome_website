"use client";

import { useId, useState } from "react";
import { LimitState, OpenFormButton, SignedBar } from "@/components/arith-learning-bars";
import { TrialControls, WRAP } from "@/components/calc/learning-controls";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import {
  percentLesson,
  type PercentFocus,
  type PercentFormState,
  type PercentImpact,
  type PercentTrialKey,
} from "@/components/percent-learning";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { PERCENT as C } from "@/content/calculators/percent";
import { PERCENT_LEARNING as L } from "@/content/calculators/percent-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/*
 * /cong-cu/tinh-phan-tram/'s living ruler, in the layout's `learning` slot
 * after the ONE live answer. HTML only — this route's contract forbids a
 * chart, a table and a figure. Nothing here is live. Hooks: `data-pc="P1"`
 * panel, P2 ruler, P3 focus, P4 tries, P5 state.
 */

const OPTION =
  "inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-sm font-medium leading-tight text-ink hover:border-brand-green-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-green-ink";

export function PercentLearningPanel({
  sample,
  tried,
  state,
  formId,
  trial,
  impact,
}: {
  sample: boolean;
  tried: boolean;
  state: PercentFormState;
  formId: string;
  trial: { key: PercentTrialKey; availability: TrialAvailability; canUndo: boolean; onTry: (key: PercentTrialKey) => void; onUndo: () => void };
  impact: PercentImpact | null;
}) {
  const id = useId();
  // Observation only: which of the two figures to read about.
  const [focus, setFocus] = useState<PercentFocus>("a");
  const lesson = percentLesson(state, focus);
  const copy = C.form.modes[state.mode];

  return (
    <section aria-labelledby={`${id}-t`} data-pc="P1" data-pc-mode={state.mode} className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4">
      <h2 id={`${id}-t`} className="font-display text-base font-medium text-ink">
        {L.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">{L.intro}</p>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-1 text-sm leading-5 text-ink-2">
        {sample ? (tried ? W.basisTried : W.basisSample) : W.basisOwn}
      </p>
      {/* The first invalid box, else the first NUMBER box — never the mode radio. */}
      <OpenFormButton formId={formId} />

      {lesson.kind === "limit" ? (
        <LimitState
          marker="percent"
          formId={formId}
          fields={[
            { key: state.keys.a, label: copy.aLabel },
            { key: state.keys.b, label: copy.bLabel },
          ]}
        />
      ) : lesson.kind !== "ready" ? (
        <p data-pc="P5" data-pc-state="empty" className="mt-3 rounded-xl bg-bg-soft p-3 text-sm font-medium text-ink">
          {L.empty}
        </p>
      ) : (
        <div data-pc-illustration="true" className="mt-3 space-y-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3">
          {/* P2: the mode's two figures on ONE signed axis from 0. */}
          <ul data-pc="P2" className="space-y-2">
            {lesson.bars.map((b) => (
              <SignedBar key={b.marker} marker={b.marker} label={b.label} text={b.text} bar={b.bar} zero={lesson.zero} fill={b.fill} focused={b.key === focus} />
            ))}
          </ul>
          {lesson.notes.map((note) => (
            <p key={note} className={cn("text-sm leading-snug text-ink", WRAP)}>
              {note}
            </p>
          ))}

          {/* P3: focus one figure; never writes the form. */}
          <fieldset data-pc="P3" className="min-w-0">
            <legend className="text-sm font-medium text-ink">{L.focusLegend}</legend>
            <div className="mt-1 grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
              {lesson.bars.map((b) => (
                <label key={b.key} className={cn(OPTION, FH_POINTER, b.key === focus && "border-brand-green-ink")}>
                  <input
                    type="radio"
                    name={`${id}-focus`}
                    value={b.key}
                    checked={b.key === focus}
                    onChange={() => setFocus(b.key as PercentFocus)}
                    data-pc-focus={b.key}
                    className="size-4 shrink-0 accent-brand-green-ink"
                  />
                  <span className={WRAP}>{b.label}</span>
                </label>
              ))}
            </div>
            <p data-pc-reading={focus} className={cn("mt-2 text-sm leading-snug text-ink", WRAP)}>{lesson.reading}</p>
            <p className="mt-1 text-sm leading-snug text-ink-2">{L.focusNote}</p>
          </fieldset>
        </div>
      )}

      <div data-pc="P4">
        <TrialControls
          idBase={`${id}-try`}
          keys={[trial.key]}
          labels={{ [trial.key]: L.trials[trial.key].label } as Record<PercentTrialKey, string>}
          availability={{ [trial.key]: trial.availability } as Record<PercentTrialKey, TrialAvailability>}
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
          <div data-pc-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
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
