"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatPercent, parseDecimal } from "@/lib/calc/number";
import type { Compounding } from "@/lib/calc/finance";
import {
  convertRate,
  COMPOUNDING_ORDER,
  type RateDirection,
} from "@/lib/calc/effective-rate";
import { EFFECTIVE_RATE as C } from "@/content/calculators/effective-rate";

export function EffectiveRateCalculator() {
  const fields = useCalcFields({
    direction: "toEffective",
    rate: C.form.defaultRate,
    compounding: C.form.defaultCompounding,
  });

  const rate = parseDecimal(fields.values.rate);
  // −100%/năm would take the balance to zero within the year; below that it
  // goes negative, and neither is a rate this module will convert.
  const rateInvalid = rate === null || rate <= -100;

  const result = rateInvalid
    ? null
    : convertRate({
        direction: fields.values.direction as RateDirection,
        ratePercent: rate,
        compounding: fields.values.compounding as Compounding,
      });

  const tableRows = result
    ? result.table.map((row) => [
        C.compounding[row.compounding],
        formatDecimal(row.periodsPerYear, 0),
        formatPercent(row.effectivePercent, 4),
        `${formatDecimal(row.extraPoints, 4)} ${C.form.pointsUnit}`,
      ])
    : [];

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("direction")}
          legend={C.form.directionLegend}
          help={C.form.directionHelp}
          options={[
            { value: "toEffective", label: C.form.directionToEffective },
            { value: "toNominal", label: C.form.directionToNominal },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        <SelectField
          {...fields.bind("compounding")}
          label={C.form.compoundingLabel}
          help={C.form.compoundingHelp}
          options={COMPOUNDING_ORDER.map((compounding) => ({
            value: compounding,
            label: C.compounding[compounding],
          }))}
        />
      </FieldGroup>

      {/* Four decimal places, not two: the whole point of the tool is a
          difference that shows up in the third and fourth digit. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.effectiveLabel}
          value={result ? formatPercent(result.effectivePercent, 4) : null}
        />
        <ResultRow
          label={C.form.nominalLabel}
          value={result ? formatPercent(result.nominalPercent, 4) : null}
        />
        <ResultRow
          label={C.form.periodicLabel}
          value={result ? formatPercent(result.periodicPercent, 4) : null}
        />
        <ResultRow
          label={C.form.gainLabel}
          value={
            result
              ? `${formatDecimal(result.compoundingGainPoints, 4)} ${C.form.pointsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.periodsLabel}
          value={
            result
              ? `${formatDecimal(result.periodsPerYear, 0)} ${C.form.periodsUnit}`
              : null
          }
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.compoundingColumn },
            { label: C.table.periodsColumn, numeric: true },
            { label: C.table.effectiveColumn, numeric: true },
            { label: C.table.extraColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
