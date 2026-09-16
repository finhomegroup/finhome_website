"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { AreaChart } from "@/components/calc/chart/area-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeCompound, MAX_COMPOUND_YEARS } from "@/lib/calc/compound";
import { compoundChartModel } from "@/lib/calc/charts/compound-chart";
import type { Compounding } from "@/lib/calc/finance";
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
 */
export function CompoundCalculator() {
  const fields = useCalcFields({
    principal: C.form.defaultPrincipal,
    rate: C.form.defaultRate,
    years: C.form.defaultYears,
    compounding: C.form.defaultCompounding,
    contribution: C.form.defaultContribution,
  });

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

  return (
    <CalculatorCard>
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

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.futureValueLabel}
          value={money(result?.futureValue)}
        />
        <ResultRow
          label={C.form.contributedLabel}
          value={money(result?.totalContributed)}
        />
        <ResultRow
          label={C.form.interestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.effectiveRateLabel}
          value={
            result
              ? formatPercent(result.effectiveAnnualRatePercent)
              : null
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

      {nothingToCompute ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.emptyNotice}
        </p>
      ) : null}

      {/* Right after the answer, and outside every ResultGroup. */}
      <ChartFigure model={chart}>
        <AreaChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
