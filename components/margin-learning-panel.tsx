"use client";

import { useId, useState } from "react";
import { LimitState, OpenFormButton, SignedBar } from "@/components/arith-learning-bars";
import { TrialControls, WRAP } from "@/components/calc/learning-controls";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import {
  marginLesson,
  type MarginFormState,
  type MarginImpact,
  type MarginTrialKey,
} from "@/components/margin-learning";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { MARGIN as C } from "@/content/calculators/margin";
import { MARGIN_LEARNING as L } from "@/content/calculators/margin-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/*
 * /cong-cu/margin-va-markup/'s two frames, in the layout's `learning` slot
 * after the ONE live answer. HTML only, no chart. Each frame is its own
 * signed scale over its own denominator. Nothing here is live. Hooks:
 * `data-mg="M1"` panel, M2 frames, M3 focus, M4 tries, M5 state.
 */

const OPTION =
  "inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-sm font-medium leading-tight text-ink hover:border-brand-green-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-green-ink";

export function MarginLearningPanel({
  sample,
  tried,
  state,
  formId,
  trial,
  impact,
}: {
  sample: boolean;
  tried: boolean;
  state: MarginFormState;
  formId: string;
  trial: { keys: readonly MarginTrialKey[]; availability: Record<MarginTrialKey, TrialAvailability>; canUndo: boolean; onTry: (key: MarginTrialKey) => void; onUndo: () => void };
  impact: MarginImpact | null;
}) {
  const id = useId();
  // Observation only: which denominator to read about. Both frames stay.
  const [focus, setFocus] = useState<"price" | "cost">("price");
  const lesson = marginLesson(state);
  const labels = Object.fromEntries(trial.keys.map((k) => [k, L.trials[k].label])) as Record<MarginTrialKey, string>;

  return (
    <section aria-labelledby={`${id}-t`} data-mg="M1" data-mg-mode={state.mode} className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4">
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
          marker="margin"
          formId={formId}
          fields={[
            { key: "cost", label: C.form.costLabel },
            {
              key: state.activeKey,
              label: state.mode === "price" ? C.form.priceLabel : state.mode === "margin" ? C.form.marginLabel : C.form.markupLabel,
            },
          ]}
        />
      ) : lesson.kind !== "ready" ? (
        <p data-mg="M5" data-mg-state="empty" className="mt-3 rounded-xl bg-bg-soft p-3 text-sm font-medium text-ink">
          {L.empty}
        </p>
      ) : (
        <div data-mg-illustration="true" data-mg-state={lesson.state} className="mt-3 space-y-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3">
          {/* M2: two frames, two different denominators, two scales. */}
          <div data-mg="M2" className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
            {lesson.frames.map((f) => (
              <div key={f.side} data-mg-frame={f.side} className={cn("min-w-0 rounded-lg bg-white p-2 ring-1 ring-ink-4/30", focus === f.side && "ring-2 ring-brand-green-ink")}>
                <p className="text-sm font-medium text-ink">{f.title}</p>
                <ul className="mt-1 space-y-2">
                  <SignedBar marker={`${f.side}-denominator`} label={L.frames[f.side].denominator} text={f.denominator.text} bar={f.denominator.bar} zero={f.zero} fill="hatch" />
                  <SignedBar marker={`${f.side}-profit`} label={lesson.profitLabel} text={f.profit.text} bar={f.profit.bar} zero={f.zero} fill={lesson.state === "gain" ? "solid" : "light"} />
                </ul>
                <p data-mg-ratio={f.side} className={cn("mt-1 text-sm font-medium leading-snug text-ink", WRAP)}>{f.ratio}</p>
              </div>
            ))}
          </div>
          {lesson.notes.map((note) => (
            <p key={note} className={cn("text-sm leading-snug text-ink", WRAP)}>
              {note}
            </p>
          ))}

          {/* M3: focus one denominator; never writes the form. */}
          <fieldset data-mg="M3" className="min-w-0">
            <legend className="text-sm font-medium text-ink">{L.focusLegend}</legend>
            <div className="mt-1 grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
              {(["price", "cost"] as const).map((side) => (
                <label key={side} className={cn(OPTION, FH_POINTER, side === focus && "border-brand-green-ink")}>
                  <input
                    type="radio"
                    name={`${id}-focus`}
                    value={side}
                    checked={side === focus}
                    onChange={() => setFocus(side)}
                    data-mg-focus={side}
                    className="size-4 shrink-0 accent-brand-green-ink"
                  />
                  <span className={WRAP}>{L.frames[side].denominator}</span>
                </label>
              ))}
            </div>
            <p data-mg-reading={focus} className={cn("mt-2 text-sm leading-snug text-ink", WRAP)}>{L.focus[focus]}</p>
            <p className="mt-1 text-sm leading-snug text-ink-2">{L.focusNote}</p>
          </fieldset>
        </div>
      )}

      <div data-mg="M4">
        <TrialControls
          idBase={`${id}-try`}
          keys={trial.keys}
          labels={labels}
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
          <div data-mg-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
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
