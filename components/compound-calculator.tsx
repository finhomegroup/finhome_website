"use client";

import { useState } from "react";
import { AccumulationLearningPanel } from "@/components/accumulation-learning-panel";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { AreaChart } from "@/components/calc/chart/area-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { onlyTried, useTrialStack } from "@/components/calc/learning-trials";
import {
  COMPOUND_TRIAL_KEYS,
  compoundDisplayable,
  compoundImpactView,
  compoundTimelineView,
  compoundTrialAvailability,
  compoundTrialLabel,
  makeCompoundTrial,
  type CompoundSnapshot,
  type CompoundTrialKey,
} from "@/components/compound-learning";
import { COMPOUND_LEARNING } from "@/content/calculators/compound-learning";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeCompound, MAX_COMPOUND_YEARS } from "@/lib/calc/compound";
import { compoundChartModel } from "@/lib/calc/charts/compound-chart";
import { periodsPerYear, type Compounding } from "@/lib/calc/finance";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { COMPOUND as C } from "@/content/calculators/compound";

/**
 * The compound interest calculator.
 *
 * Money fields parse with `parseMoney` ("." groups thousands); the rate and
 * term parse with `parseDecimal` ("," is the decimal mark).
 *
 * ORIGINAL ROW 16's visual splits the balance into the starting amount, the
 * later contributions and the interest. It is built by
 * `lib/calc/charts/compound-chart.ts` from the SAME yearly snapshots the table
 * below renders, so the two cannot disagree.
 *
 * The yearly schedule sits outside the results live region — see
 * `ResultTable`'s docstring for why.
 *
 * CSV row 19 ("Hai cột"): contributions, interest and the ending balance beside
 * the form, figure before the long explanation. The second half was already
 * true — the figure follows the answer and the page's method section is below
 * the tool — so only the split and the CTA are new. Docs §8.
 */
const FORM_ID = "lai-kep-nhap";
const RESULT_ID = "lai-kep-ket-qua";

export function CompoundCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. The compounding select formats nothing.
  const initialValues = {
    principal: C.form.defaultPrincipal,
    rate: C.form.defaultRate,
    years: C.form.defaultYears,
    compounding: C.form.defaultCompounding,
    contribution: C.form.defaultContribution,
  };
  const raw = useCalcFields(
    initialValues,
    { principal: "money", rate: "rate", years: "rate", contribution: "money" },
  );

  /*
   * THE F3 TRIAL STACK (2026-09-29): a press adds 1 triệu PER COMPOUNDING
   * PERIOD through the raw binding; every reader action — a keystroke, the
   * compounding select — goes through `fields` and retires the trials.
   */
  const learning = useTrialStack<CompoundTrialKey, CompoundSnapshot>(raw.values);
  /** The snapshot the panel's cursor is on; null = the last one. */
  const [pickedPoint, setPickedPoint] = useState<number | null>(null);
  const fields = {
    values: raw.values,
    bind: (key: keyof typeof initialValues) => {
      const binding = raw.bind(key);
      return {
        ...binding,
        onValueChange: (next: string) => {
          learning.dispatch({ type: "edit" });
          binding.onValueChange(next);
        },
      };
    },
  };
  const pristine = (Object.keys(initialValues) as (keyof typeof initialValues)[]).every(
    (key) => raw.values[key] === initialValues[key],
  );

  const principal = parseMoney(fields.values.principal);
  const rate = parseDecimal(fields.values.rate);
  const years = parseDecimal(fields.values.years);
  const contribution = parseMoney(fields.values.contribution);

  const principalInvalid = principal === null || principal < 0;
  const rateInvalid = rate === null || rate < 0;
  // Bounded on the TYPED value, so the field shows its own error instead of
  // the module silently refusing a term the page never mentioned.
  const yearsInvalid =
    years === null || years <= 0 || years > MAX_COMPOUND_YEARS;
  const contributionInvalid = contribution === null || contribution < 0;

  const result =
    principalInvalid || rateInvalid || yearsInvalid || contributionInvalid
      ? null
      : computeCompound({
          principal,
          annualRatePercent: rate,
          years,
          compounding: fields.values.compounding as Compounding,
          contributionPerPeriod: contribution,
        });

  // A zero principal AND a zero contribution is not an invalid field — it is
  // simply nothing to compute, so it gets its own note rather than an error.
  const nothingToCompute =
    result === null &&
    !principalInvalid &&
    !rateInvalid &&
    !yearsInvalid &&
    !contributionInvalid;

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;

  // The three-band figure. A cleared result clears the chart rather than
  // leaving the previous drawing beside new inputs.
  const chart = compoundChartModel(result, principal ?? 0, {
    ...CHART_UI.money,
    ...C.chart,
  });

  // No second table here. The chart's own table is these same snapshots with
  // typed cells — one stated unit, exact đồng behind a checkbox, inside a
  // disclosure — and a dense always-expanded duplicate below it was the
  // reading experience this unit was asked to fix.

  const anyInvalid =
    principalInvalid || rateInvalid || yearsInvalid || contributionInvalid;

  // --- the F3 panel: every figure from `result` or a trial's record ---
  const compounding = fields.values.compounding as Compounding;
  const latestTrial = learning.trials.at(-1) ?? null;
  // Past the formatter's display boundary there is no printable figure: no
  // vessel, no trial, no impact.
  const printable = compoundDisplayable(result, principal ?? 0);
  const trialImpact =
    latestTrial !== null && result !== null && printable ? compoundImpactView(latestTrial, result, compounding) : null;
  const tryContribution = () => {
    const trial = makeCompoundTrial({ values: raw.values, revision: learning.state.revision, result });
    if (trial === null) return;
    learning.dispatch({ type: "apply", trial });
    raw.bind("contribution").onValueChange(trial.after.contribution);
  };
  const undoTrial = () => {
    if (latestTrial === null) return;
    learning.dispatch({ type: "undo" });
    raw.bind("contribution").onValueChange(latestTrial.before.contribution);
  };
  const timeline = compoundTimelineView(result, principal ?? 0, contribution ?? 0, compounding, pickedPoint);
  const L = COMPOUND_LEARNING;
  /**
   * Why the panel has no figure, from the state itself — never the broad
   * "nothing to compute" predicate, which also covers a term shorter than one
   * period and an unrepresentable growth. Only a real bad field gets the fix.
   */
  const empty =
    result !== null
      ? printable
        ? null
        : { text: L.tooLarge, fix: false, trial: L.blocked.tooLarge }
      : anyInvalid
        ? { text: L.unknown, fix: true, trial: L.blocked.invalid }
        : principal === 0 && contribution === 0
          ? { text: L.nothing, fix: false, trial: L.blocked.nothing }
          : (years ?? 0) * periodsPerYear(compounding) < 1
            ? { text: L.noPeriod, fix: false, trial: L.blocked.noPeriod }
            : { text: L.noAnswer, fix: false, trial: L.blocked.noAnswer };

  return (
    <CalculatorCard compact>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <FieldGroup title={C.form.depositGroup}>
            <NumberField
              {...fields.bind("principal")}
              label={C.form.principalLabel}
              unit={C.form.principalUnit}
              help={C.form.principalHelp}
              error={C.form.principalInvalid}
              invalid={principalInvalid}
            />
            <NumberField
              {...fields.bind("rate")}
              label={C.form.rateLabel}
              unit={C.form.rateUnit}
              help={C.form.rateHelp}
              error={C.form.rateInvalid}
              invalid={rateInvalid}
            />
            <NumberField
              {...fields.bind("years")}
              label={C.form.yearsLabel}
              unit={C.form.yearsUnit}
              help={C.form.yearsHelp}
              error={C.form.yearsInvalid}
              invalid={yearsInvalid}
            />
            <SelectField
              {...fields.bind("compounding")}
              label={C.form.compoundingLabel}
              help={C.form.compoundingHelp}
              options={C.form.compoundingOptions}
            />
            <NumberField
              {...fields.bind("contribution")}
              label={C.form.contributionLabel}
              unit={C.form.contributionUnit}
              help={C.form.contributionHelp}
              error={C.form.contributionInvalid}
              invalid={contributionInvalid}
            />
          </FieldGroup>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            // Measured at 1440×1000 with the contribution field focused at
            // y 529–575: the first result row sat at y −96,5. Five controls in
            // one group is still a form whose answer leaves the screen while
            // the last of them is edited. The restatement is the EMPHASISED
            // row, whose label already names its own period ("cuối kỳ"),
            // through the same `money()` the row uses.
            sticky
            answer={{
              label: C.form.futureValueLabel,
              value: money(result?.futureValue),
            }}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.futureValueLabel}
                value={money(result?.futureValue)}
                emphasis
              />
              <ResultRow
                label={C.form.contributedLabel}
                value={money(result?.totalContributed)}
              />
              <ResultRow
                label={C.form.interestLabel}
                value={money(result?.totalInterest)}
              />
            </ResultGroup>

            {nothingToCompute ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.emptyNotice}
              </p>
            ) : null}
          </>
        }
        learning={
          <AccumulationLearningPanel
            marker="compound"
            copy={L}
            sample={pristine || onlyTried(learning.trials, initialValues)}
            view={timeline}
            emptyText={empty?.text ?? L.unknown}
            emptyFix={empty?.fix ?? false}
            onIndex={setPickedPoint}
            formId={FORM_ID}
            trial={{
              keys: COMPOUND_TRIAL_KEYS,
              labels: { contribution: compoundTrialLabel(compounding) },
              availability: { contribution: compoundTrialAvailability(empty?.trial ?? null, raw.values) },
              canUndo: latestTrial !== null,
              onTry: tryContribution,
              onUndo: undoTrial,
            }}
            impact={trialImpact}
          />
        }
        chart={
          <ChartFigure model={chart}>
            <AreaChart model={chart} />
          </ChartFigure>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          /* The effective rate and the period count moved here from the answer
             group: a browser pass at 390 px read five rows, of which only the
             first three answer "how much will I have". These two explain what
             the compounding period did to get there, so they read behind a
             label. Same figures, same formatters, nothing recomputed. */
          <DetailDisclosure
            title={C.form.detailToggle}
            hint={C.form.detailHint}
          >
            <ResultGroup title={C.form.detailTitle} live={false}>
              <ResultRow
                label={C.form.effectiveRateLabel}
                value={
                  result ? formatPercent(result.effectiveAnnualRatePercent) : null
                }
              />
              <ResultRow
                label={C.form.periodsLabel}
                value={
                  result
                    ? `${formatDecimal(result.periods, 0)} ${C.form.periodsUnit}`
                    : null
                }
              />
            </ResultGroup>
          </DetailDisclosure>
        }
      />
    </CalculatorCard>
  );
}
