"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import {
  computeFibonacci,
  type FibonacciDirection,
  type FibonacciResult,
} from "@/lib/calc/fibonacci";
import { FIBONACCI as C } from "@/content/calculators/fibonacci";

/** Look a retracement level up by its ratio, for the summary rows. */
function levelAt(result: FibonacciResult | null, ratioPercent: number) {
  if (result === null) return null;
  const found = result.retracements.find(
    (entry) => Math.abs(entry.ratioPercent - ratioPercent) < 1e-9,
  );
  return found ? `${formatMoney(found.price)} ₫` : null;
}

export function FibonacciCalculator() {
  const fields = useCalcFields({
    high: C.form.defaultHigh,
    low: C.form.defaultLow,
    direction: C.form.defaultDirection,
  });

  const high = parseMoney(fields.values.high);
  const low = parseMoney(fields.values.low);

  const highInvalid = high === null || high <= 0;
  const lowInvalid = low === null || low <= 0 || (high !== null && low > high);

  const result =
    highInvalid || lowInvalid
      ? null
      : computeFibonacci({
          high,
          low,
          direction: fields.values.direction as FibonacciDirection,
        });

  const retracementRows =
    result?.retracements.map((entry) => [
      formatPercent(entry.ratioPercent, 1),
      formatMoney(entry.price),
      entry.conventional
        ? C.form.retracementTable.conventional
        : C.form.retracementTable.fibonacci,
    ]) ?? [];

  const extensionRows =
    result?.extensions.map((entry) => [
      formatPercent(entry.ratioPercent, 1),
      formatMoney(entry.price),
    ]) ?? [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.group}>
        <NumberField
          {...fields.bind("high")}
          label={C.form.highLabel}
          unit={C.form.highUnit}
          help={C.form.highHelp}
          error={C.form.highInvalid}
          invalid={highInvalid}
        />
        <NumberField
          {...fields.bind("low")}
          label={C.form.lowLabel}
          unit={C.form.lowUnit}
          help={C.form.lowHelp}
          error={C.form.lowInvalid}
          invalid={lowInvalid}
        />
        {/* A radio, not a select: the choice reverses which end every level
            is measured from, so it deserves to be visibly a fork. */}
        <RadioGroupField
          {...fields.bind("direction")}
          legend={C.form.directionLegend}
          help={C.form.directionHelp}
          options={[
            { value: "uptrend", label: C.form.directionUp },
            { value: "downtrend", label: C.form.directionDown },
          ]}
        />
      </FieldGroup>

      {/* Three levels live; the two full tables stay out of the live region. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.level382Label}
          value={levelAt(result, 38.2)}
        />
        <ResultRow label={C.form.level500Label} value={levelAt(result, 50)} />
        <ResultRow
          label={C.form.level618Label}
          value={levelAt(result, 61.8)}
        />
        <ResultRow
          label={C.form.rangeLabel}
          value={result ? `${formatMoney(result.range)} ₫` : null}
        />
      </ResultGroup>

      {retracementRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.retracementTable.caption}
          columns={[
            { label: C.form.retracementTable.ratioColumn },
            { label: C.form.retracementTable.priceColumn, numeric: true },
            { label: C.form.retracementTable.kindColumn },
          ]}
          rows={retracementRows}
        />
      ) : null}

      {extensionRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.extensionTable.caption}
          columns={[
            { label: C.form.extensionTable.ratioColumn },
            { label: C.form.extensionTable.priceColumn, numeric: true },
          ]}
          rows={extensionRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
