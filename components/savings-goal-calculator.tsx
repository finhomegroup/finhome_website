"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeSavingsGoal,
  type SavingsGoalMode,
} from "@/lib/calc/savings-goal";
import { SAVINGS_GOAL as C } from "@/content/calculators/savings-goal";

/** Which of the three figures each mode asks for, and which it solves. */
const MODES = {
  contribution: { needsTarget: true, needsContribution: false, needsMonths: true },
  months: { needsTarget: true, needsContribution: true, needsMonths: false },
  target: { needsTarget: false, needsContribution: true, needsMonths: true },
} as const satisfies Record<
  SavingsGoalMode,
  { needsTarget: boolean; needsContribution: boolean; needsMonths: boolean }
>;

export function SavingsGoalCalculator() {
  const fields = useCalcFields({
    mode: "contribution",
    initial: C.form.defaultInitial,
    target: C.form.defaultTarget,
    contribution: C.form.defaultContribution,
    months: C.form.defaultMonths,
    rate: C.form.defaultRate,
  });

  const mode = fields.values.mode as SavingsGoalMode;
  const needs = MODES[mode];

  const initial = parseMoney(fields.values.initial);
  const target = parseMoney(fields.values.target);
  const contribution = parseMoney(fields.values.contribution);
  const months = parseDecimal(fields.values.months);
  const rate = parseDecimal(fields.values.rate);

  const initialInvalid = initial === null || initial < 0;
  const targetInvalid = needs.needsTarget && (target === null || target < 0);
  const contributionInvalid =
    needs.needsContribution && (contribution === null || contribution < 0);
  const monthsInvalid = needs.needsMonths && (months === null || months <= 0);
  const rateInvalid = rate === null || rate < 0;

  const fieldsUsable =
    !initialInvalid &&
    !targetInvalid &&
    !contributionInvalid &&
    !monthsInvalid &&
    !rateInvalid;

  const result = fieldsUsable
    ? computeSavingsGoal({
        mode,
        initial,
        annualRatePercent: rate,
        // Each mode passes only the two figures it needs; the third is what
        // the module solves for and must not be handed in.
        target: needs.needsTarget ? (target ?? undefined) : undefined,
        contribution: needs.needsContribution
          ? (contribution ?? undefined)
          : undefined,
        months: needs.needsMonths ? (months ?? undefined) : undefined,
      })
    : null;

  // Every field parses, but the combination has no answer — already at the
  // target, a negative required contribution, or a balance that never moves.
  const noResult = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "contribution", label: C.form.modeContribution },
            { value: "months", label: C.form.modeMonths },
            { value: "target", label: C.form.modeTarget },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("initial")}
          label={C.form.initialLabel}
          unit={C.form.initialUnit}
          help={C.form.initialHelp}
          error={C.form.initialInvalid}
          invalid={initialInvalid}
        />
        {/* Only the two inputs the mode needs are rendered: showing the box
            the tool is solving for would invite the user to fill it in. */}
        {needs.needsTarget ? (
          <NumberField
            {...fields.bind("target")}
            label={C.form.targetLabel}
            unit={C.form.targetUnit}
            help={C.form.targetHelp}
            error={C.form.targetInvalid}
            invalid={targetInvalid}
          />
        ) : null}
        {needs.needsContribution ? (
          <NumberField
            {...fields.bind("contribution")}
            label={C.form.contributionLabel}
            unit={C.form.contributionUnit}
            help={C.form.contributionHelp}
            error={C.form.contributionInvalid}
            invalid={contributionInvalid}
          />
        ) : null}
        {needs.needsMonths ? (
          <NumberField
            {...fields.bind("months")}
            label={C.form.monthsLabel}
            help={C.form.monthsHelp}
            error={C.form.monthsInvalid}
            invalid={monthsInvalid}
          />
        ) : null}
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {mode === "contribution" ? (
          <ResultRow
            label={C.form.contributionResultLabel}
            value={money(result?.contribution)}
          />
        ) : null}
        {mode === "months" ? (
          <ResultRow
            label={C.form.monthsResultLabel}
            value={
              result
                ? `${formatDecimal(result.months, 1)} ${C.form.monthsUnit}`
                : null
            }
          />
        ) : null}
        {mode === "target" ? (
          <ResultRow
            label={C.form.targetResultLabel}
            value={money(result?.target)}
          />
        ) : null}
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalContributedLabel}
          value={money(result?.totalContributed)}
        />
        <ResultRow
          label={C.form.interestLabel}
          value={money(result?.interestEarned)}
        />
        <ResultRow
          label={C.form.interestShareLabel}
          value={result ? formatPercent(result.interestSharePercent, 1) : null}
        />
      </ResultGroup>

      {noResult ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noResultNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
