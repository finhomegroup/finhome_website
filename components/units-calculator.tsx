"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CopyButton } from "@/components/calc/copy-button";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatQuantity, parseMagnitude } from "@/lib/calc/number";
import {
  convertUnit,
  isAmbiguousLandUnit,
  landRegionComparison,
  resolveLandUnit,
  UNITS,
  type LandRegion,
  type UnitCategory,
} from "@/lib/calc/units";
import { UNITS_CONTENT as C } from "@/content/calculators/units";

const CATEGORY_ORDER: UnitCategory[] = [
  "area",
  "length",
  "mass",
  "volume",
  "gold",
];

/**
 * The ids the FORM offers per category.
 *
 * Area is the one that differs from the engine's own list: the four regional
 * land units are replaced by the two AMBIGUOUS names a reader recognises, and
 * a region turns one of those into a real unit. Offering "Sào Bắc Bộ" as the
 * first option is what let the old form answer a Central-region question with
 * a Northern factor.
 */
const FORM_IDS: Record<UnitCategory, string[]> = {
  area: ["m2", "km2", "ha", "sao", "mau", "sqft", "acre"],
  length: UNITS.length.map((unit) => unit.id),
  mass: UNITS.mass.map((unit) => unit.id),
  volume: UNITS.volume.map((unit) => unit.id),
  gold: UNITS.gold.map((unit) => unit.id),
};

export function UnitsCalculator() {
  const fields = useCalcFields({
    category: C.form.defaultCategory,
    fromId: C.form.defaultFromId,
    toId: C.form.defaultToId,
    region: C.form.defaultRegion,
    value: C.form.defaultValue,
  });

  const category = fields.values.category as UnitCategory;
  const label = (id: string) =>
    (C.units[category] as Record<string, string>)[id] ?? id;
  const ids = FORM_IDS[category];
  const options = ids.map((id) => ({ value: id, label: label(id) }));

  // Switching category leaves the previous category's unit ids in state, and
  // they are not valid here. Falling back to the first two units of the new
  // category keeps the tool answering instead of blanking out.
  const fromId = ids.includes(fields.values.fromId)
    ? fields.values.fromId
    : ids[0];
  const toId = ids.includes(fields.values.toId)
    ? fields.values.toId
    : ids[1] ?? ids[0];

  const region =
    fields.values.region === "bac" || fields.values.region === "trung"
      ? (fields.values.region as LandRegion)
      : null;

  // A dimensionless magnitude: this field takes both 1,5 chỉ and 10.000 m²,
  // so neither parseDecimal (reads "10.000" as 10) nor parseMoney (reads
  // "1.5" as 15) is usable on its own.
  const value = parseMagnitude(fields.values.value);
  const valueInvalid = value === null;

  // A REGION IS NOT DEFAULTED. An ambiguous land unit on either side of the
  // conversion resolves to null until the reader confirms one, and null means
  // no result — not a Northern figure with no warning.
  const ambiguous =
    isAmbiguousLandUnit(fromId) || isAmbiguousLandUnit(toId);
  const resolvedFrom = resolveLandUnit(fromId, region);
  const resolvedTo = resolveLandUnit(toId, region);
  const regionMissing = ambiguous && region === null;

  const result =
    valueInvalid || resolvedFrom === null || resolvedTo === null
      ? null
      : convertUnit({
          category,
          fromId: resolvedFrom,
          toId: resolvedTo,
          value,
        });

  /**
   * The short regional comparison, for whichever side the region decides.
   *
   * Shown as soon as an ambiguous unit is selected — INCLUDING while the
   * region is still unconfirmed, because seeing the two figures side by side
   * is what makes the question worth answering. It covers the TARGET side
   * too: m² → mẫu is the direction a reader with a deed actually takes, and
   * that used to show only the long all-unit table with no statement that the
   * answer depends on a convention.
   */
  const comparison = valueInvalid
    ? null
    : landRegionComparison({ fromId, toId, value, region });

  /** Readable precision: six significant digits with the padding removed. */
  const quantity = (figure: number) => formatQuantity(figure);

  const tableRows =
    result?.all.map((row) => [label(row.id), quantity(row.value)]) ?? [];

  /**
   * The number and the equation, as one line a reader can copy.
   *
   * Built from the resolved units, so a land figure in it always names the
   * region it was computed with — a copied "2 sào = 720 m²" with no region
   * would be the original defect, pasted elsewhere.
   */
  const equation =
    result === null || value === null
      ? null
      : `${quantity(value)} ${label(resolvedFrom ?? fromId)} = ${quantity(result.converted)} ${label(resolvedTo ?? toId)}`;

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
        {/* Only where it decides an area. A region selector under a gold
            conversion would be a control that changes nothing. */}
        {ambiguous ? (
          <RadioGroupField
            {...fields.bind("region")}
            legend={C.form.regionLegend}
            help={C.form.regionHelp}
            options={[
              { value: "", label: C.form.regionUnset },
              { value: "bac", label: C.form.regionBac },
              { value: "trung", label: C.form.regionTrung },
            ]}
          />
        ) : null}
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
          value={result ? quantity(result.converted) : null}
        />
        {/* More digits than the result: this is what the reader multiplies by
            when they need precision beyond the display. */}
        <ResultRow
          label={C.form.factorLabel}
          value={result ? formatQuantity(result.factor, 10) : null}
        />
      </ResultGroup>

      {/* The region is a REFUSAL state, not a warning beside a figure. */}
      {regionMissing ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          {C.form.regionRequiredNotice}
        </p>
      ) : null}

      {equation !== null ? (
        <div className="mt-6">
          <p className="text-sm leading-relaxed text-ink-2">
            <span className="font-medium text-ink">
              {C.form.equationLabel}:
            </span>{" "}
            <span className="tabular-nums">{equation}</span>
          </p>
          {/* Writes to the clipboard on a click and at no other time. */}
          <CopyButton
            text={equation}
            label={C.form.copyLabel}
            copiedLabel={C.form.copiedLabel}
            failedLabel={C.form.copyFailedLabel}
          />
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            {C.form.precisionNote}
          </p>
        </div>
      ) : null}

      {/* The SHORT comparison: the two conventions for whichever side is
          regional, on the reader's own figure. The full category table is
          below.

          THE VALUE COLUMN NAMES ITS UNIT. It read a bare "Kết quả", so 2 sào
          → ha showed 0,072 beside 0,09999 while the row labels named 360 m²
          and 499,95 m² — two units on one line and none of them the answer's.
          Where the TARGET is the regional side, each row is in its own unit
          and the heading says to read it from the row. */}
      {comparison !== null ? (
        <ResultTable
          className="mt-8"
          caption={C.form.comparison.title}
          columns={[
            { label: C.form.comparison.unitColumn },
            {
              label:
                comparison.targetId === null
                  ? C.form.comparison.valueColumnPerRow
                  : C.form.comparison.valueColumnIn.replace(
                      "{unit}",
                      label(comparison.targetId),
                    ),
              numeric: true,
            },
          ]}
          rows={comparison.rows.map((row) => [
            `${C.form.comparison[row.region]} — ${label(row.id)}`,
            quantity(row.value),
          ])}
        />
      ) : null}
      {comparison !== null ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            {C.form.comparison.note}
          </p>
          {/* Both sides regional: the target convention is fixed for the
              comparison, and it is NAMED rather than left to pass as
              neutral. */}
          {comparison.targetConventionApplied && comparison.targetId !== null ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {C.form.comparison.targetConventionNote.replace(
                "{unit}",
                label(comparison.targetId),
              )}
            </p>
          ) : null}
          {comparison.targetId === null ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {C.form.comparison.perRowNote}
            </p>
          ) : null}
        </>
      ) : null}

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
