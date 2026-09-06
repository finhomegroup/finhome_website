"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, parseDecimal } from "@/lib/calc/number";
import { exactYears, rule72Years } from "@/lib/rule-of-72";
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";

export function RuleOf72Calculator() {
  const fields = useCalcFields({ rate: C.form.defaultRate });

  const rate = parseDecimal(fields.values.rate);
  const estimate = rate === null ? null : rule72Years(rate);
  const exact = rate === null ? null : exactYears(rate);
  // A null estimate covers every rejected case: empty, unparseable, zero,
  // negative. `exact` is null under exactly the same conditions.
  const invalid = estimate === null;

  const years = (value: number | null) =>
    value === null ? null : `${formatDecimal(value)} ${C.form.unit}`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateSuffix}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={invalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-6">
        <ResultRow label={C.form.estimateLabel} value={years(estimate)} />
        <ResultRow label={C.form.exactLabel} value={years(exact)} />
      </ResultGroup>
    </CalculatorCard>
  );
}
