"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeCompound } from "@/lib/calc/compound";
import type { Compounding } from "@/lib/calc/finance";
import { COMPOUND as C } from "@/content/calculators/compound";

/**
 * The compound interest calculator.
 *
 * Money fields parse with `parseMoney` ("." groups thousands); the rate and
 * term parse with `parseDecimal` ("," is the decimal mark).
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
  const yearsInvalid = years === null || years <= 0;
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

  const tableRows = result
    ? result.yearlyBalances.map((year) => [
        formatDecimal(year.year, 0),
        formatMoney(year.contributed),
        formatMoney(year.interest),
        formatMoney(year.balance),
      ])
    : [];

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

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.yearColumn },
            { label: C.table.contributedColumn, numeric: true },
            { label: C.table.interestColumn, numeric: true },
            { label: C.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
