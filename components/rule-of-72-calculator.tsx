"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { ResultCta } from "@/components/calc/result-cta";
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
 *
 * CSV row 20 ("Gọn"): one short block per question, no chart, the answer
 * directly under the rate. Two of those three were already true, so what is new
 * is the single-column wrapper and a CTA per question. TWO layouts rather than
 * one, because each has its own input: `ResultCta` scopes its search for the
 * first invalid field to its own `formId`, and folding the second field into the
 * first block's detail region would put it outside that scope and silently drop
 * its recovery. This route is the one entry in the two-live-region allowlist.
 * Docs §8.
 */
const RATE_FORM_ID = "quy-tac-72-lai-suat-nhap";
const RATE_RESULT_ID = "quy-tac-72-thoi-gian";
const YEARS_FORM_ID = "quy-tac-72-thoi-gian-nhap";
const YEARS_RESULT_ID = "quy-tac-72-lai-suat";

export function RuleOf72Calculator({
  actions,
}: {
  /** `<ResultActions slug="quy-tac-72">`, from the route. Second layout only. */
  actions?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Both go through `parseDecimal`.
  const fields = useCalcFields(
    {
      rate: C.form.defaultRate,
      years: C.form.defaultYears,
    },
    { rate: "rate", years: "rate" },
  );

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
      <CalculatorLayout
        formId={RATE_FORM_ID}
        columns="single"
        form={
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
        }
        cta={
          <ResultCta
            formId={RATE_FORM_ID}
            targetId={RATE_RESULT_ID}
            invalid={rateInvalid}
          />
        }
        primary={
          <>
            {/* The two figures side by side, then the gap between them as its
                own row: original row 17's lesson is the ERROR, so it is a
                result and not a footnote. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RATE_RESULT_ID}>
              <ResultRow
                label={C.form.estimateLabel}
                value={asYears(estimateYears)}
                emphasis
              />
              <ResultRow
                label={C.form.exactLabel}
                value={asYears(exactYearsValue)}
              />
              <ResultRow label={C.form.errorLabel} value={errorValue} prose />
            </ResultGroup>

            <p className="mt-3 text-sm leading-relaxed text-ink-3">
              {C.form.errorHelp}
            </p>
          </>
        }
        detail={
          milestoneRows.length > 0 ? (
            <div>
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
          ) : undefined
        }
      />

      <CalculatorLayout
        className="mt-10"
        formId={YEARS_FORM_ID}
        columns="single"
        form={
          <FieldGroup>
            <NumberField
              {...fields.bind("years")}
              label={C.form.yearsLabel}
              unit={C.form.yearsSuffix}
              help={C.form.yearsHelp}
              error={C.form.yearsInvalid}
              invalid={yearsInvalid}
            />
          </FieldGroup>
        }
        cta={
          <ResultCta
            formId={YEARS_FORM_ID}
            targetId={YEARS_RESULT_ID}
            invalid={yearsInvalid}
          />
        }
        primary={
          <ResultGroup
            title={C.form.rateResultTitle}
            anchorId={YEARS_RESULT_ID}
          >
            <ResultRow
              label={C.form.estimateLabel}
              value={asRate(estimateRate)}
              emphasis
            />
            <ResultRow
              label={C.form.exactLabel}
              value={asRate(exactRateValue)}
            />
          </ResultGroup>
        }
        /* SECOND layout only, deliberately. One compact block per page: putting
           it under the first answer would interrupt question 1 → question 2, and
           duplicating it would put the same two links on screen twice. Here it
           sits between the second answer and the 13-row reference table. */
        actions={actions}
        detail={
          <ResultTable
            caption={C.table.caption}
            columns={[
              { label: C.table.rateColumn },
              { label: C.table.estimateColumn, numeric: true },
              { label: C.table.exactColumn, numeric: true },
            ]}
            rows={tableRows}
          />
        }
      />
    </CalculatorCard>
  );
}
