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
import type { MarginMode } from "@/lib/calc/margin";
import { moneyText, percentText } from "@/components/arith-learning-display";
import {
  makeMarginTrial,
  marginAvailability,
  marginFormState,
  marginImpact,
  marginSnapshot,
  marginTrialKeys,
  type MarginSnapshot,
  type MarginTrialKey,
} from "@/components/margin-learning";
import { MarginLearningPanel } from "@/components/margin-learning-panel";
import { MARGIN as C } from "@/content/calculators/margin";

/** The second box: a price in one mode, a percentage in the other two. */
const MODES = {
  price: {
    key: "price",
    label: C.form.priceLabel,
    unit: C.form.priceUnit,
    help: C.form.priceHelp,
    error: C.form.priceInvalid,
    isPercent: false,
  },
  margin: {
    key: "margin",
    label: C.form.marginLabel,
    unit: C.form.marginUnit,
    help: C.form.marginHelp,
    error: C.form.marginInvalid,
    isPercent: true,
  },
  markup: {
    key: "markup",
    label: C.form.markupLabel,
    unit: C.form.markupUnit,
    help: C.form.markupHelp,
    error: C.form.markupInvalid,
    isPercent: true,
  },
} as const satisfies Record<
  MarginMode,
  {
    key: string;
    label: string;
    unit: string;
    help: string;
    error: string;
    isPercent: boolean;
  }
>;

const FORM_ID = "margin-nhap";
const RESULT_ID = "margin-ket-qua";

export const MARGIN_FORMATS = {
  cost: "money", price: "money", margin: "rate", markup: "rate",
} as const;

/**
 * ROW 63: "Một khối ngắn, hai nhãn margin và markup giải thích bằng tiếng
 * Việt; không cần chart."
 *
 * `columns="single"`, no `detail` region and no chart: four rows of
 * arithmetic on two inputs do not earn a second column or a plot. The layout
 * adds the region hooks and the CTA, so a reader on a phone gets the same
 * "xem kết quả" affordance as every other tool.
 *
 * THE EMPHASISED ROW FOLLOWS THE MODE, because the answer does. Somebody who
 * entered cost and price is asking what their margin is; somebody who entered
 * a target margin or markup is asking what to charge. Fixing the emphasis to
 * one row would headline the reader's own input back at them in two of the
 * three modes.
 *
 * THE LIVING TWO-FRAME PICTURE (2026-09-30) sits in the `learning` slot:
 * the same profit over the price and over the cost, each on its own scale.
 * Parse and guards moved unchanged into `marginFormState`; every figure is
 * formatted safely (named at the print limit, sign kept).
 */
export function MarginCalculator() {
  const initial = {
    mode: C.form.defaultMode,
    cost: C.form.defaultCost,
    price: C.form.defaultPrice,
    margin: C.form.defaultMargin,
    markup: C.form.defaultMarkup,
  };
  const raw = useCalcFields(initial, MARGIN_FORMATS);

  // Every reader edit — the mode radio included — retires the trial stack.
  const trials = useTrialStack<MarginTrialKey, MarginSnapshot>(raw.values);
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

  const mode = fields.values.mode as MarginMode;
  const active = MODES[mode];

  // Each mode has its own impossible value: a free sale has no margin, a
  // margin of 100% implies a cost of zero, and a −100% markup zeroes the price.
  // Same guards, moved into `marginFormState`.
  const state = marginFormState(fields.values);
  const { costInvalid, valueInvalid, result } = state;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : moneyText(figure);

  // The example is the example while cost and the ACTIVE second box are
  // untouched; the mode is a question, not a figure.
  const same = (v: Readonly<Record<string, string>>) =>
    v.cost === initial.cost && v[active.key] === initial[active.key];
  const sample =
    same(fields.values) || (trials.trials[0] !== undefined && same(trials.trials[0].before));
  const keys = marginTrialKeys(mode);
  const latest = trials.trials.at(-1) ?? null;
  const now = marginSnapshot(state);
  const impact = latest !== null && now !== null ? marginImpact(latest, now) : null;
  const tryKey = (key: MarginTrialKey) => {
    const t = makeMarginTrial(key, raw.values, trials.state.revision, state);
    if (t === null) return;
    trials.dispatch({ type: "apply", trial: t });
    raw.bind(key).onValueChange(t.after[key]);
  };
  const undo = () => {
    if (latest === null) return;
    trials.dispatch({ type: "undo" });
    raw.bind(latest.key).onValueChange(latest.before[latest.key]);
  };

  // The reader entered a price, so the price is not the answer; they entered
  // a rate, so the rate is not the answer.
  const answerIsPrice = mode !== "price";

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
                  { value: "price", label: C.form.modePrice },
                  { value: "margin", label: C.form.modeMargin },
                  { value: "markup", label: C.form.modeMarkup },
                ]}
              />
            </FieldGroup>

            <FieldGroup title={C.form.group} className="mt-8">
              <NumberField
                {...fields.bind("cost")}
                label={C.form.costLabel}
                unit={C.form.costUnit}
                help={C.form.costHelp}
                error={C.form.costInvalid}
                invalid={costInvalid}
                fieldKey="cost"
              />
              <NumberField
                key={mode}
                {...fields.bind(active.key)}
                label={active.label}
                unit={active.unit}
                help={active.help}
                error={active.error}
                invalid={valueInvalid}
                fieldKey={active.key}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={costInvalid || valueInvalid}
          />
        }
        primary={
          <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
            <ResultRow
              label={C.form.priceResultLabel}
              value={money(result?.price)}
              emphasis={answerIsPrice}
            />
            <ResultRow
              label={C.form.profitLabel}
              value={money(result?.profit)}
            />
            <ResultRow
              label={C.form.marginResultLabel}
              value={result ? percentText(result.marginPercent) : null}
              emphasis={!answerIsPrice}
            />
            <ResultRow
              label={C.form.markupResultLabel}
              value={result ? percentText(result.markupPercent) : null}
            />
          </ResultGroup>
        }
        learning={
          <MarginLearningPanel
            sample={sample}
            tried={sample && trials.trials.length > 0}
            state={state}
            formId={FORM_ID}
            trial={{
              keys,
              availability: {
                price: marginAvailability("price", raw.values, state),
                cost: marginAvailability("cost", raw.values, state),
                margin: marginAvailability("margin", raw.values, state),
                markup: marginAvailability("markup", raw.values, state),
              },
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
