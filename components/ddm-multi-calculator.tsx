"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeDdmMulti } from "@/lib/calc/ddm-multi";
import { DDM_MULTI as C } from "@/content/calculators/ddm-multi";

export function DdmMultiCalculator() {
  const fields = useCalcFields({
    dividend: C.form.defaultDividend,
    highGrowth: C.form.defaultHighGrowth,
    years: C.form.defaultYears,
    terminalGrowth: C.form.defaultTerminalGrowth,
    required: C.form.defaultRequired,
  });

  const dividend = parseMoney(fields.values.dividend);
  const highGrowth = parseDecimal(fields.values.highGrowth);
  const years = parseDecimal(fields.values.years);
  const terminalGrowth = parseDecimal(fields.values.terminalGrowth);
  const required = parseDecimal(fields.values.required);

  const dividendInvalid = dividend === null || dividend <= 0;
  const highGrowthInvalid = highGrowth === null;
  const yearsInvalid =
    years === null || years < 1 || years > 20 || !Number.isInteger(years);
  const requiredInvalid = required === null;
  // Only the TERMINAL rate is bounded by the required return. The first stage
  // being allowed to exceed it is the reason this model exists.
  const terminalGrowthInvalid =
    terminalGrowth === null ||
    (required !== null && terminalGrowth >= required);

  const result =
    dividendInvalid ||
    highGrowthInvalid ||
    yearsInvalid ||
    terminalGrowthInvalid ||
    requiredInvalid
      ? null
      : computeDdmMulti({
          dividend,
          highGrowthPercent: highGrowth,
          highGrowthYears: years,
          terminalGrowthPercent: terminalGrowth,
          requiredReturnPercent: required,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const tableRows =
    result?.years.map((row) => [
      formatDecimal(row.year, 0),
      formatMoney(row.dividend),
      formatMoney(row.presentValue),
    ]) ?? [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.dividendGroup}>
        <NumberField
          {...fields.bind("dividend")}
          label={C.form.dividendLabel}
          unit={C.form.dividendUnit}
          help={C.form.dividendHelp}
          error={C.form.dividendInvalid}
          invalid={dividendInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.highGroup} className="mt-8">
        <NumberField
          {...fields.bind("highGrowth")}
          label={C.form.highGrowthLabel}
          unit={C.form.highGrowthUnit}
          help={C.form.highGrowthHelp}
          error={C.form.highGrowthInvalid}
          invalid={highGrowthInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={C.form.yearsLabel}
          help={C.form.yearsHelp}
          error={C.form.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.terminalGroup} className="mt-8">
        <NumberField
          {...fields.bind("terminalGrowth")}
          label={C.form.terminalGrowthLabel}
          unit={C.form.terminalGrowthUnit}
          help={C.form.terminalGrowthHelp}
          error={C.form.terminalGrowthInvalid}
          invalid={terminalGrowthInvalid}
        />
        <NumberField
          {...fields.bind("required")}
          label={C.form.requiredLabel}
          unit={C.form.requiredUnit}
          help={C.form.requiredHelp}
          error={C.form.requiredInvalid}
          invalid={requiredInvalid}
        />
      </FieldGroup>

      {/* The terminal share sits in the headline beside the value, because
          it is what tells the reader how much of the value is assumption. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.valueLabel}
          value={money(result?.intrinsicValue)}
        />
        <ResultRow
          label={C.form.terminalShareLabel}
          value={
            result ? formatPercent(result.terminalSharePercent, 2) : null
          }
        />
        <ResultRow
          label={C.form.pvDividendsLabel}
          value={money(result?.pvOfDividends)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.terminalDividendLabel}
          value={money(result?.terminalDividend)}
        />
        <ResultRow
          label={C.form.terminalValueLabel}
          value={money(result?.terminalValue)}
        />
        <ResultRow
          label={C.form.pvTerminalLabel}
          value={money(result?.pvOfTerminalValue)}
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.yearColumn },
            { label: C.form.table.dividendColumn, numeric: true },
            { label: C.form.table.pvColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}

      {terminalGrowthInvalid && terminalGrowth !== null && required !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unpriceableNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
