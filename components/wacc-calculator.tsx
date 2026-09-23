"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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
import { computeWacc } from "@/lib/calc/wacc";
import { WACC as C } from "@/content/calculators/wacc";

/*
 * CSV row 41 ("Theo nhóm + kết quả"): "gom nguồn vốn thành nhóm; WACC nổi
 * bật, các thành phần nằm trong bảng mở rộng". Docs §8.
 *
 * The three capital sources were already separate field groups, so what
 * changes here is the answer: WACC becomes the headline, and the nine
 * component rows that used to stand between it and the page's explanation
 * become one expandable table of three sources by three questions. The cost
 * column is the one that needed care — only the debt row is net of tax, and
 * a table that let the reader think otherwise would cause exactly the error
 * this page exists to prevent, so the caption says so.
 *
 * `columns="split"`, CORRECTED. This route shipped `columns="single"` on the
 * argument that seven fields and a three-row answer are "not a two-column
 * shape". An independent review restored the approved requirement: the global
 * desktop layout for a long tool is the 40/60 split — grouped form left,
 * summary right, detail tables full width below — and CSV row 41 describes a
 * grouped form beside a result. The single-column exception was an
 * implementation preference, not an approved change to that requirement. The
 * three capital-source groups stay as they are, the cost table below still
 * spans all five columns (`CalculatorLayout`), and tablet and phone stay
 * single-column because the grid starts at `lg`.
 */
const FORM_ID = "wacc-nhap";
const RESULT_ID = "wacc-ket-qua";

export function WaccCalculator() {
  const fields = useCalcFields({
    equityValue: C.form.defaultEquityValue,
    costOfEquity: C.form.defaultCostOfEquity,
    debtValue: C.form.defaultDebtValue,
    costOfDebt: C.form.defaultCostOfDebt,
    tax: C.form.defaultTax,
    preferredValue: C.form.defaultPreferredValue,
    costOfPreferred: C.form.defaultCostOfPreferred,
  });

  const equityValue = parseMoney(fields.values.equityValue);
  const costOfEquity = parseDecimal(fields.values.costOfEquity);
  const debtValue = parseMoney(fields.values.debtValue);
  const costOfDebt = parseDecimal(fields.values.costOfDebt);
  const tax = parseDecimal(fields.values.tax);
  const preferredValue = parseMoney(fields.values.preferredValue);
  const costOfPreferred = parseDecimal(fields.values.costOfPreferred);

  const equityValueInvalid = equityValue === null || equityValue < 0;
  const costOfEquityInvalid = costOfEquity === null;
  const debtValueInvalid = debtValue === null || debtValue < 0;
  const costOfDebtInvalid = costOfDebt === null;
  const taxInvalid = tax === null || tax < 0 || tax > 100;
  const preferredValueInvalid = preferredValue === null || preferredValue < 0;
  const costOfPreferredInvalid = costOfPreferred === null;

  const fieldsUsable =
    !equityValueInvalid &&
    !costOfEquityInvalid &&
    !debtValueInvalid &&
    !costOfDebtInvalid &&
    !taxInvalid &&
    !preferredValueInvalid &&
    !costOfPreferredInvalid;

  const result = fieldsUsable
    ? computeWacc({
        equityValue,
        costOfEquityPercent: costOfEquity,
        debtValue,
        costOfDebtPercent: costOfDebt,
        taxRatePercent: tax,
        preferredValue,
        costOfPreferredPercent: costOfPreferred,
      })
    : null;

  // Every field parses but the three values are all zero — no capital
  // structure to average over.
  const noCapital = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** Formatted once, for the headline row and the pinned restatement. */
  const waccValue = result ? formatPercent(result.waccPercent, 3) : null;

  const points = (figure: number | undefined) =>
    figure === undefined
      ? null
      : `${formatDecimal(figure, 3)} ${C.form.pointsUnit}`;

  // Three sources, the same three questions of each. The cost column holds
  // the figure actually used, which for debt is the SHIELDED one — the
  // caption carries that warning.
  const componentRows =
    result === null
      ? []
      : [
          [
            C.form.equityGroup,
            formatPercent(result.equityWeightPercent, 2),
            formatPercent(costOfEquity ?? 0, 3),
            formatDecimal(result.equityContributionPoints, 3),
          ],
          [
            C.form.debtGroup,
            formatPercent(result.debtWeightPercent, 2),
            formatPercent(result.afterTaxCostOfDebtPercent, 3),
            formatDecimal(result.debtContributionPoints, 3),
          ],
          [
            C.form.preferredGroup,
            formatPercent(result.preferredWeightPercent, 2),
            formatPercent(costOfPreferred ?? 0, 3),
            formatDecimal(result.preferredContributionPoints, 3),
          ],
        ];

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.equityGroup}>
              <NumberField
                {...fields.bind("equityValue")}
                label={C.form.equityValueLabel}
                unit={C.form.equityValueUnit}
                help={C.form.equityValueHelp}
                error={C.form.equityValueInvalid}
                invalid={equityValueInvalid}
              />
              <NumberField
                {...fields.bind("costOfEquity")}
                label={C.form.costOfEquityLabel}
                unit={C.form.costOfEquityUnit}
                help={C.form.costOfEquityHelp}
                error={C.form.costOfEquityInvalid}
                invalid={costOfEquityInvalid}
              />
            </FieldGroup>

            {/* The tax rate belongs to the DEBT group, not to a settings
                block of its own: it is only ever applied to this source. */}
            <FieldGroup title={C.form.debtGroup} className="mt-8">
              <NumberField
                {...fields.bind("debtValue")}
                label={C.form.debtValueLabel}
                unit={C.form.debtValueUnit}
                help={C.form.debtValueHelp}
                error={C.form.debtValueInvalid}
                invalid={debtValueInvalid}
              />
              <NumberField
                {...fields.bind("costOfDebt")}
                label={C.form.costOfDebtLabel}
                unit={C.form.costOfDebtUnit}
                help={C.form.costOfDebtHelp}
                error={C.form.costOfDebtInvalid}
                invalid={costOfDebtInvalid}
              />
              <NumberField
                {...fields.bind("tax")}
                label={C.form.taxLabel}
                unit={C.form.taxUnit}
                help={C.form.taxHelp}
                error={C.form.taxInvalid}
                invalid={taxInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.preferredGroup} className="mt-8">
              <NumberField
                {...fields.bind("preferredValue")}
                label={C.form.preferredValueLabel}
                unit={C.form.preferredValueUnit}
                help={C.form.preferredValueHelp}
                error={C.form.preferredValueInvalid}
                invalid={preferredValueInvalid}
              />
              <NumberField
                {...fields.bind("costOfPreferred")}
                label={C.form.costOfPreferredLabel}
                unit={C.form.costOfPreferredUnit}
                help={C.form.costOfPreferredHelp}
                error={C.form.costOfPreferredInvalid}
                invalid={costOfPreferredInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: seven boxes across three legends, and the answer is one
             percentage. Single-column, so the CTA block is what stays on
             screen while the third capital source is being typed. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={!fieldsUsable}
            sticky
            answer={{ label: C.form.waccLabel, value: waccValue }}
          />
        }
        primary={
          <>
            {/* WACC with the shielded debt cost beside it, so the one
                component that gets the deduction is visible in the answer. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.waccLabel}
                value={waccValue}
                emphasis
              />
              <ResultRow
                label={C.form.afterTaxDebtLabel}
                value={
                  result ? formatPercent(result.afterTaxCostOfDebtPercent, 3) : null
                }
              />
              <ResultRow
                label={C.form.shieldLabel}
                value={points(result?.taxShieldPoints)}
              />
            </ResultGroup>

            {noCapital ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noCapitalNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          // The row's "bảng mở rộng". Closed by default: a reader who trusts
          // the answer should not have to scroll past nine rows of workings
          // to reach the page's explanation, and a reader who does not trust
          // it is one click from every component.
          <details className="rounded-2xl border border-ink-4/20 p-5">
            <summary className="cursor-pointer font-display text-base font-medium text-ink hover:text-brand-green-ink">
              {C.form.componentsTitle}
            </summary>

            {componentRows.length > 0 ? (
              <ResultTable
                className="mt-5"
                caption={C.form.componentsTable.caption}
                columns={[
                  { label: C.form.componentsTable.sourceColumn },
                  { label: C.form.componentsTable.weightColumn, numeric: true },
                  { label: C.form.componentsTable.costColumn, numeric: true },
                  {
                    label: C.form.componentsTable.contributionColumn,
                    numeric: true,
                  },
                ]}
                rows={componentRows}
              />
            ) : null}

            {/* The scalars that are not per-source. `live={false}`: the
                answer above is the one announced region. */}
            <ResultGroup
              title={C.form.detailTitle}
              className="mt-6"
              live={false}
            >
              <ResultRow
                label={C.form.totalCapitalLabel}
                value={money(result?.totalCapital)}
              />
              <ResultRow
                label={C.form.beforeShieldLabel}
                value={
                  result
                    ? formatPercent(result.waccBeforeTaxShieldPercent, 3)
                    : null
                }
              />
              <ResultRow
                label={C.form.debtToEquityLabel}
                value={
                  result?.debtToEquity == null
                    ? null
                    : formatDecimal(result.debtToEquity, 4)
                }
              />
            </ResultGroup>
          </details>
        }
      />
    </CalculatorCard>
  );
}
