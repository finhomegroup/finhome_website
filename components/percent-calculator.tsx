"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { useTrialStack } from "@/components/calc/learning-trials";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import type { PercentMode } from "@/lib/calc/percent";
import {
  moneyText,
  numberText,
  percentText,
} from "@/components/arith-learning-display";
import {
  makePercentTrial,
  PERCENT_MODES,
  PERCENT_TRIAL_KEY,
  percentAvailability,
  percentEquation,
  percentFormState,
  percentImpact,
  percentSnapshot,
  type PercentSnapshot,
  type PercentTrialKey,
} from "@/components/percent-learning";
import { PercentLearningPanel } from "@/components/percent-learning-panel";
import { PERCENT as C } from "@/content/calculators/percent";

/**
 * Which field keys and which parser each mode uses.
 *
 * Every mode owns its OWN pair of boxes; see `PERCENT_MODES` in
 * `components/percent-learning.ts`, where the mapping and the per-field
 * parser now live so the page and its living ruler read one state.
 */
const MODES = PERCENT_MODES;

/**
 * The two region ids the CTA contract runs on.
 *
 * Literals rather than `useId`, because they are a CONTRACT between two
 * components and a stable hook for the render test — and because they must be
 * byte-identical between the server's prerender and the client's hydration,
 * which is the one thing every calculator in this suite is required to be.
 */
const FORM_ID = "tinh-phan-tram-nhap";
const RESULT_ID = "tinh-phan-tram-ket-qua";

/** Each mode owns separate keys, so a money input never inherits a rate's grammar. */
export const PERCENT_FORMATS = {
  ofPercent: "rate", ofTotal: "money",
  sharePart: "money", shareWhole: "money",
  changeFrom: "money", changeTo: "money",
  pointsFrom: "rate", pointsTo: "rate",
} as const;

export function PercentCalculator() {
  const initial = {
    mode: "of",
    ofPercent: C.form.modes.of.defaultA,
    ofTotal: C.form.modes.of.defaultB,
    sharePart: C.form.modes.share.defaultA,
    shareWhole: C.form.modes.share.defaultB,
    changeFrom: C.form.modes.change.defaultA,
    changeTo: C.form.modes.change.defaultB,
    pointsFrom: C.form.modes.points.defaultA,
    pointsTo: C.form.modes.points.defaultB,
  };
  const raw = useCalcFields(initial, PERCENT_FORMATS);

  // Every reader edit — the mode radio included — retires the trial stack;
  // a press writes through the RAW binding.
  const trials = useTrialStack<PercentTrialKey, PercentSnapshot>(raw.values);
  const fields = {
    values: raw.values,
    bind: (key: keyof typeof initial) => {
      const binding = raw.bind(key);
      return {
        ...binding,
        onValueChange: (next: string) => {
          trials.dispatch({ type: "edit" });
          binding.onValueChange(next);
        },
      };
    },
  };

  const mode = fields.values.mode as PercentMode;
  const keys = MODES[mode];
  const copy = C.form.modes[mode];

  // The parser comes from the FIELD, per mode — docs §4. A rate box uses
  // `parseDecimal` (7,5 is seven and a half) and a money box uses
  // `parseMoney` (2.000.000 is two million); swapping them is a 1000× error.
  //
  // "share" divides by b and "change" divides by a, so a zero in either
  // divisor is flagged on the field itself rather than silently blanking the
  // result.
  //
  // "points" is NOT in that list. A 0% old rate is a legitimate rate — an
  // introductory period — and the point difference from it is valid; only the
  // relative change is undefined, and the model returns that as null. Marking
  // the field invalid withheld both answers, which a review found on 0 → 7.
  // All of it now in `percentFormState`, unchanged.
  const state = percentFormState(fields.values);
  const { aInvalid, bInvalid, result } = state;

  // Named past the print limit, never "— ₫".
  const money = (value: number) => moneyText(value);

  // The example is the example while the ACTIVE mode's two boxes are
  // untouched; the mode is a question, not a figure.
  const same = (v: Readonly<Record<string, string>>) =>
    v[keys.a] === initial[keys.a] && v[keys.b] === initial[keys.b];
  const sample =
    same(fields.values) || (trials.trials[0] !== undefined && same(trials.trials[0].before));
  const trialKey = PERCENT_TRIAL_KEY[mode];
  const latest = trials.trials.at(-1) ?? null;
  const now = percentSnapshot(state);
  const impact = latest !== null && now !== null ? percentImpact(latest, now, mode) : null;
  const tryKey = (key: PercentTrialKey) => {
    const t = makePercentTrial(key, raw.values, trials.state.revision, state);
    if (t === null) return;
    trials.dispatch({ type: "apply", trial: t });
    raw.bind(key).onValueChange(t.after[key]);
  };
  const undo = () => {
    if (latest === null) return;
    trials.dispatch({ type: "undo" });
    raw.bind(latest.key).onValueChange(latest.before[latest.key]);
  };

  /**
   * The one-line worked arithmetic original row 59 asks for.
   *
   * Built from the SAME parsed numbers the result came from, so the equation
   * and the answer cannot disagree — and formatted with the same formatters,
   * so the equation reads in the same grammar as the boxes above it.
   */
  //
  // Built in `percentEquation`: compared terms share one precision, so
  // near-equal operands (7,001 / 7,002) never both print as "7,00".
  const equation = percentEquation(state);

  /*
   * A "Gọn" row in the audit's own classification (CSV row 61): its action is
   * "chọn phép tính trước, kết quả ngay dưới hai ô; không cần chart hoặc bảng
   * phụ". The mode radio is still the first control and the result still
   * follows the two boxes; there is still no chart, `<figure>` or secondary
   * table.
   *
   * `columns="single"`: four short controls across 40/60 would make two stub
   * columns. WHAT CHANGED (2026-09-30): the approved living-infographic draft
   * adds a meaningful HTML ruler in the `learning` slot — the mode's two
   * figures on one signed axis, their denominator named, a native focus
   * picker and one-field tries. It is not a decorative plot, and it sits
   * outside the one live region.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
            <FieldGroup>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "of", label: C.form.modes.of.label },
                  { value: "share", label: C.form.modes.share.label },
                  { value: "change", label: C.form.modes.change.label },
                  { value: "points", label: C.form.modes.points.label },
                ]}
              />
            </FieldGroup>

            {/* Keyed on the mode so React remounts the pair rather than reusing
                the previous mode's inputs — the two boxes mean different things
                and carry different `useId`-generated labels. */}
            <FieldGroup key={mode} className="mt-8">
              <NumberField
                {...fields.bind(keys.a)}
                label={copy.aLabel}
                unit={copy.aUnit}
                help={copy.aHelp}
                error={copy.aInvalid}
                invalid={aInvalid}
                fieldKey={keys.a}
              />
              <NumberField
                {...fields.bind(keys.b)}
                label={copy.bLabel}
                unit={copy.bUnit}
                help={copy.bHelp}
                error={copy.bInvalid}
                invalid={bInvalid}
                fieldKey={keys.b}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={aInvalid || bInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={copy.resultLabel}
                // The one answer this page exists to give. Every mode has
                // exactly one, and its unit differs per mode — which is the
                // whole lesson of the tool.
                emphasis
                value={
                  result === null
                    ? null
                    : result.mode === "of"
                      ? money(result.amount)
                      : result.mode === "share"
                        ? percentText(result.sharePercent)
                        : result.mode === "change"
                          ? percentText(result.changePercent)
                          : // ĐIỂM phần trăm, with its unit spelled out: the
                            // whole point of the mode is that this is not a
                            // percentage.
                            numberText(result.differencePoints, 2, ` ${C.form.modes.points.pointsUnit}`)
                }
              />
              {mode === "change" ? (
                <ResultRow
                  label={C.form.modes.change.differenceLabel}
                  value={
                    result === null || result.mode !== "change"
                      ? null
                      : money(result.difference)
                  }
                />
              ) : null}
              {/* The same move as a percentage of the old rate — the second
                  half of the lesson, beside the first rather than instead of
                  it. The DIRECTION is a word picked from the sign, and the
                  magnitude is rendered unsigned: the label used to say "tăng"
                  beside a negative figure on any rate cut. Null at a 0% old
                  rate, where this measure does not exist but the point
                  difference above still does. */}
              {mode === "points" ? (
                <ResultRow
                  label={C.form.modes.points.relativeLabel}
                  value={
                    result === null || result.mode !== "points"
                      ? null
                      : result.relativePercent === null
                        ? C.form.modes.points.relativeUndefined
                        : C.form.modes.points.relativeFormat
                            .replace(
                              "{direction}",
                              result.relativePercent > 0
                                ? C.form.modes.points.relativeIncrease
                                : result.relativePercent < 0
                                  ? C.form.modes.points.relativeDecrease
                                  : C.form.modes.points.relativeSame,
                            )
                            .replace(
                              "{percent}",
                              percentText(Math.abs(result.relativePercent)),
                            )
                  }
                  prose={
                    result !== null &&
                    result.mode === "points" &&
                    result.relativePercent === null
                  }
                />
              ) : null}
              <ResultRow
                label={C.form.equationLabel}
                value={equation}
                prose
              />
            </ResultGroup>

            {/* Why there is no đồng figure in this mode. */}
            {mode === "points" ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.pointsMoneyNote}
              </p>
            ) : null}

            {/* And why only ONE of the two figures is missing at a 0% old
                rate. Kept beside the answer rather than moved to a disclosure:
                it explains a visible dash, so a reader who cannot see it is
                looking at an unexplained gap. */}
            {mode === "points" &&
            result !== null &&
            result.mode === "points" &&
            result.relativePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.modes.points.relativeUndefinedNote}
              </p>
            ) : null}
          </>
        }
        learning={
          <PercentLearningPanel
            sample={sample}
            tried={sample && trials.trials.length > 0}
            state={state}
            formId={FORM_ID}
            trial={{
              key: trialKey,
              availability: percentAvailability(trialKey, raw.values, state),
              canUndo: latest !== null,
              onTry: tryKey,
              onUndo: undo,
            }}
            impact={impact}
          />
        }
      />
    </CalculatorCard>
  );
}
