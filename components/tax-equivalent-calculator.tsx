"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatPercent, parseDecimal } from "@/lib/calc/number";
import {
  computeTaxEquivalent,
  type TaxEquivalentDirection,
} from "@/lib/calc/tax-equivalent";
import { TAX_EQUIVALENT as C } from "@/content/calculators/tax-equivalent";

export function TaxEquivalentCalculator() {
  const fields = useCalcFields({
    direction: C.form.defaultDirection,
    yieldValue: C.form.defaultYield,
    taxRate: C.form.defaultTaxRate,
  });

  const yieldValue = parseDecimal(fields.values.yieldValue);
  const taxRate = parseDecimal(fields.values.taxRate);

  const yieldInvalid = yieldValue === null;
  // At 100% no taxable yield can match a positive tax-free one, so the
  // gross-up has no finite value.
  const taxRateInvalid = taxRate === null || taxRate < 0 || taxRate >= 100;

  const result =
    yieldInvalid || taxRateInvalid
      ? null
      : computeTaxEquivalent({
          direction: fields.values.direction as TaxEquivalentDirection,
          yieldPercent: yieldValue,
          taxRatePercent: taxRate,
        });

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("direction")}
          legend={C.form.directionLegend}
          help={C.form.directionHelp}
          options={[
            { value: "toTaxable", label: C.form.directionToTaxable },
            { value: "toAfterTax", label: C.form.directionToAfterTax },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("yieldValue")}
          label={C.form.yieldLabel}
          unit={C.form.yieldUnit}
          help={C.form.yieldHelp}
          error={C.form.yieldInvalid}
          invalid={yieldInvalid}
        />
        <NumberField
          {...fields.bind("taxRate")}
          label={C.form.taxRateLabel}
          unit={C.form.taxRateUnit}
          help={C.form.taxRateHelp}
          error={C.form.taxRateInvalid}
          invalid={taxRateInvalid}
        />
      </FieldGroup>

      {/* Six decimals: the whole point is a difference that shows up in the
          second and third digit after the comma. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.taxableLabel}
          value={result ? formatPercent(result.taxablePercent, 6) : null}
        />
        <ResultRow
          label={C.form.afterTaxLabel}
          value={result ? formatPercent(result.afterTaxPercent, 6) : null}
        />
        <ResultRow
          label={C.form.taxCostLabel}
          value={
            result
              ? `${formatDecimal(result.taxCostPoints, 6)} ${C.form.pointsUnit}`
              : null
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.taxFreeLabel}
          value={result ? formatPercent(result.taxFreePercent, 6) : null}
        />
        <ResultRow
          label={C.form.grossUpLabel}
          value={result ? formatPercent(result.grossUpPercent, 6) : null}
        />
      </ResultGroup>

      {taxRateInvalid && taxRate !== null && taxRate >= 100 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.impossibleNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
