"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, parseMagnitude } from "@/lib/calc/number";
import { convertUnit, UNITS, type UnitCategory } from "@/lib/calc/units";
import { UNITS_CONTENT as C } from "@/content/calculators/units";

const CATEGORY_ORDER: UnitCategory[] = [
  "area",
  "length",
  "mass",
  "volume",
  "gold",
];

/** The category's units as select options, with their Vietnamese labels. */
function optionsFor(category: UnitCategory) {
  return UNITS[category].map((unit) => ({
    value: unit.id,
    label: (C.units[category] as Record<string, string>)[unit.id],
  }));
}

export function UnitsCalculator() {
  const fields = useCalcFields({
    category: "area",
    fromId: "saoBac",
    toId: "m2",
    value: C.form.defaultValue,
  });

  const category = fields.values.category as UnitCategory;
  const options = optionsFor(category);

  // Switching category leaves the previous category's unit ids in state, and
  // they are not valid here. Falling back to the first two units of the new
  // category keeps the tool answering instead of blanking out.
  const ids = UNITS[category].map((unit) => unit.id);
  const fromId = ids.includes(fields.values.fromId)
    ? fields.values.fromId
    : ids[0];
  const toId = ids.includes(fields.values.toId)
    ? fields.values.toId
    : ids[1] ?? ids[0];

  // A dimensionless magnitude: this field takes both 1,5 chỉ and 10.000 m²,
  // so neither parseDecimal (reads "10.000" as 10) nor parseMoney (reads
  // "1.5" as 15) is usable on its own.
  const value = parseMagnitude(fields.values.value);
  const valueInvalid = value === null;

  const result = valueInvalid
    ? null
    : convertUnit({ category, fromId, toId, value });

  const label = (id: string) =>
    (C.units[category] as Record<string, string>)[id] ?? id;

  const tableRows =
    result?.all.map((row) => [
      label(row.id),
      formatDecimal(row.value, 6),
    ]) ?? [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.group}>
        <SelectField
          {...fields.bind("category")}
          label={C.form.categoryLabel}
          help={C.form.categoryHelp}
          options={CATEGORY_ORDER.map((id) => ({
            value: id,
            label: C.categories[id],
          }))}
        />
        {/* Keyed on the category so the select remounts with its new option
            list rather than briefly holding a value that is not in it. */}
        <SelectField
          key={`from-${category}`}
          value={fromId}
          onValueChange={(next) => fields.bind("fromId").onValueChange(next)}
          label={C.form.fromLabel}
          help={C.form.fromHelp}
          options={options}
        />
        <SelectField
          key={`to-${category}`}
          value={toId}
          onValueChange={(next) => fields.bind("toId").onValueChange(next)}
          label={C.form.toLabel}
          help={C.form.toHelp}
          options={options}
        />
        <NumberField
          {...fields.bind("value")}
          label={C.form.valueLabel}
          help={C.form.valueHelp}
          error={C.form.valueInvalid}
          invalid={valueInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={result ? label(result.toId) : C.form.convertedLabel}
          value={result ? formatDecimal(result.converted, 6) : null}
        />
        {/* More digits than the result: this is what the reader multiplies by
            when they need precision beyond the display. */}
        <ResultRow
          label={C.form.factorLabel}
          value={result ? formatDecimal(result.factor, 10) : null}
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.unitColumn },
            { label: C.form.table.valueColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
