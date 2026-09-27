"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatPercent, parseDecimal } from "@/lib/calc/number";
import {
  computeTaxEquivalent,
  type TaxEquivalentDirection,
} from "@/lib/calc/tax-equivalent";
import { TAX_EQUIVALENT as C } from "@/content/calculators/tax-equivalent";

/*
 * CSV row 26 ("Gọn"): "giảm số thập phân ở phần tóm tắt, giữ nhãn thuế, cho
 * xem đầy đủ khi cần". Two inputs and a direction, so `columns="single"` and
 * no chart. The summary keeps all three labelled figures — including "thuế lấy
 * đi", which is the row the page exists for — at THREE decimals, and the
 * unrounded six-decimal set moves into a disclosure below. Docs §8.
 */
const FORM_ID = "loi-suat-thue-nhap";
const RESULT_ID = "loi-suat-thue-ket-qua";

/** The summary's precision. Three, not two: see `fullPrecisionTitle`. */
const SUMMARY_DP = 3;
/** The unrounded set, as the module has always rendered it. */
const FULL_DP = 6;

export function TaxEquivalentCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the answer. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Direction is a list.
  const fields = useCalcFields(
    {
      direction: C.form.defaultDirection,
      yieldValue: C.form.defaultYield,
      taxRate: C.form.defaultTaxRate,
    },
    { yieldValue: "rate", taxRate: "rate" },
  );

  const direction = fields.values.direction as TaxEquivalentDirection;

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
          direction,
          yieldPercent: yieldValue,
          taxRatePercent: taxRate,
        });

  const percent = (value: number, dp: number) => formatPercent(value, dp);
  const points = (value: number, dp: number) =>
    `${formatDecimal(value, dp)} ${C.form.pointsUnit}`;

  // Which row answered the question the reader asked. The direction radio IS
  // that question — "tôi đang có con số nào" — so the headline follows it
  // rather than being fixed to one of the two conversions.
  const headline = direction === "toTaxable" ? "taxable" : "afterTax";

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={yieldInvalid || taxRateInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.taxableLabel}
                value={result ? percent(result.taxablePercent, SUMMARY_DP) : null}
                emphasis={headline === "taxable"}
              />
              <ResultRow
                label={C.form.afterTaxLabel}
                value={result ? percent(result.afterTaxPercent, SUMMARY_DP) : null}
                emphasis={headline === "afterTax"}
              />
              {/* The tax label stays in the summary: the deduction in points
                  is the number the reader compares against the quoted gap. */}
              <ResultRow
                label={C.form.taxCostLabel}
                value={result ? points(result.taxCostPoints, SUMMARY_DP) : null}
              />
            </ResultGroup>

            {/* Explains a row of dashes where the answer should be, so it stays
                beside the answer rather than in the disclosure. */}
            {taxRateInvalid && taxRate !== null && taxRate >= 100 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.impossibleNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <details className="rounded-2xl border border-ink-4/20 p-5">
            <summary className="cursor-pointer font-display text-base font-medium text-ink hover:text-brand-green-ink">
              {C.form.fullPrecisionTitle}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {C.form.fullPrecisionNote}
            </p>
            {/* NOT live. The summary above is the one announced region; a
                second one reciting five rows on every keystroke would report a
                single recomputation twice. */}
            <ResultGroup
              title={C.form.detailTitle}
              className="mt-4"
              live={false}
            >
              <ResultRow
                label={C.form.taxableLabel}
                value={result ? percent(result.taxablePercent, FULL_DP) : null}
              />
              <ResultRow
                label={C.form.afterTaxLabel}
                value={result ? percent(result.afterTaxPercent, FULL_DP) : null}
              />
              <ResultRow
                label={C.form.taxCostLabel}
                value={result ? points(result.taxCostPoints, FULL_DP) : null}
              />
              <ResultRow
                label={C.form.taxFreeLabel}
                value={result ? percent(result.taxFreePercent, FULL_DP) : null}
              />
              <ResultRow
                label={C.form.grossUpLabel}
                value={result ? percent(result.grossUpPercent, FULL_DP) : null}
              />
            </ResultGroup>
          </details>
        }
      />
    </CalculatorCard>
  );
}
