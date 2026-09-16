"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, parseDecimal } from "@/lib/calc/number";
import { countCell } from "@/lib/calc/table-cell";
import {
  doublingMilestones,
  estimateErrorMonths,
  exactRate,
  exactYears,
  rule72Rate,
  rule72Years,
} from "@/lib/rule-of-72";
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";

/**
 * Both directions of the rule, plus the quick-reference table — matching the
 * three blocks the reference tool puts on one page.
 *
 * The table is rendered unconditionally rather than behind a "show table"
 * button as the reference does: it is 13 rows of genuinely useful content, and
 * hiding it behind a click would also hide it from crawlers.
 */
export function RuleOf72Calculator() {
  const fields = useCalcFields({
    rate: C.form.defaultRate,
    years: C.form.defaultYears,
  });

  // Direction 1: a rate in, a doubling time out.
  const rate = parseDecimal(fields.values.rate);
  const estimateYears = rate === null ? null : rule72Years(rate);
  const exactYearsValue = rate === null ? null : exactYears(rate);
  // A null estimate covers every rejected case: empty, unparseable, zero,
  // negative. The exact value is null under the same conditions.
  const rateInvalid = estimateYears === null;

  // Direction 2: a term in, the rate it would take out.
  const years = parseDecimal(fields.values.years);
  const estimateRate = years === null ? null : rule72Rate(years);
  const exactRateValue = years === null ? null : exactRate(years);
  const yearsInvalid = estimateRate === null;

  // How wrong the mental estimate is, at the rate the reader typed. Signed,
  // and the sign is turned into words rather than left as a minus the reader
  // has to interpret against "lệch".
  const errorMonths = rate === null ? null : estimateErrorMonths(rate);
  const errorValue =
    errorMonths === null
      ? null
      : `${formatDecimal(Math.abs(errorMonths))} ${C.form.errorUnit} ${
          errorMonths >= 0
            ? C.form.errorAheadSuffix
            : C.form.errorBehindSuffix
        }`;

  // The small timeline: 2×, 4×, 8×. Exact figures, for the reason in the
  // module docstring.
  const milestones = rate === null ? null : doublingMilestones(rate);
  const milestoneRows = (milestones ?? []).map((rung) => [
    C.milestones.multipleFormat.replace(
      "{multiple}",
      formatDecimal(rung.multiple, 0),
    ),
    countCell(rung.doublings),
    `${formatDecimal(rung.years)} ${C.milestones.yearsUnit}`,
  ]);

  const asYears = (value: number | null) =>
    value === null ? null : `${formatDecimal(value)} ${C.form.unit}`;
  const asRate = (value: number | null) =>
    value === null ? null : `${formatDecimal(value)}${C.form.rateUnit}`;

  const tableRows = C.table.rates.map((tableRate) => {
    const estimate = rule72Years(tableRate);
    const exact = exactYears(tableRate);
    return [
      formatDecimal(tableRate, 0),
      estimate === null ? null : formatDecimal(estimate),
      exact === null ? null : formatDecimal(exact),
    ];
  });

  return (
    <CalculatorCard>
      <FieldGroup>
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateSuffix}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
      </FieldGroup>

      {/* The two figures side by side, then the gap between them as its own
          row: original row 17's lesson is the ERROR, so it is a result and
          not a footnote. */}
      <ResultGroup title={C.form.resultTitle} className="mt-6">
        <ResultRow
          label={C.form.estimateLabel}
          value={asYears(estimateYears)}
        />
        <ResultRow label={C.form.exactLabel} value={asYears(exactYearsValue)} />
        <ResultRow label={C.form.errorLabel} value={errorValue} prose />
      </ResultGroup>

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.errorHelp}
      </p>

      {milestoneRows.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-base font-medium text-ink">
            {C.milestones.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            {C.milestones.intro}
          </p>
          <ResultTable
            className="mt-4"
            caption={C.milestones.caption}
            columns={[
              { label: C.milestones.multipleColumn },
              { label: C.milestones.doublingsColumn, numeric: true },
              { label: C.milestones.yearsColumn, numeric: true },
            ]}
            rows={milestoneRows}
          />
        </div>
      ) : null}

      <FieldGroup className="mt-8">
        <NumberField
          {...fields.bind("years")}
          label={C.form.yearsLabel}
          unit={C.form.yearsSuffix}
          help={C.form.yearsHelp}
          error={C.form.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.rateResultTitle} className="mt-6">
        <ResultRow label={C.form.estimateLabel} value={asRate(estimateRate)} />
        <ResultRow label={C.form.exactLabel} value={asRate(exactRateValue)} />
      </ResultGroup>

      <ResultTable
        className="mt-8"
        caption={C.table.caption}
        columns={[
          { label: C.table.rateColumn },
          { label: C.table.estimateColumn, numeric: true },
          { label: C.table.exactColumn, numeric: true },
        ]}
        rows={tableRows}
      />
    </CalculatorCard>
  );
}
