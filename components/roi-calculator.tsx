"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  formatQuantity,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRoi } from "@/lib/calc/roi";
import { ROI as C } from "@/content/calculators/roi";

/*
 * CSV row 23 ("Gọn"): "ưu tiên lợi nhuận ròng và thời gian nắm giữ; không đánh
 * đồng ROI cả kỳ với lợi nhuận năm". Three inputs in one block, so
 * `columns="single"` and no chart — a 40/60 split here is two stub columns.
 * What changes is the hierarchy: the annual figure is the one headline, the
 * money gain is the first support row, and the whole-period ROI now carries
 * the period in its own label. Docs §8.
 */
const FORM_ID = "roi-nhap";
const RESULT_ID = "roi-ket-qua";

export function RoiCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the answer. */
  nextSteps?: React.ReactNode;
}) {
  const fields = useCalcFields({
    cost: C.form.defaultCost,
    final: C.form.defaultFinal,
    years: C.form.defaultYears,
  });

  const cost = parseMoney(fields.values.cost);
  const final = parseMoney(fields.values.final);

  // The holding period is optional: empty means "I don't know", which is a
  // different thing from a bad entry and must not read as an error.
  const yearsRaw = fields.values.years.trim();
  const years = yearsRaw === "" ? 0 : parseDecimal(yearsRaw);

  const costInvalid = cost === null || cost <= 0;
  const finalInvalid = final === null || final < 0;
  const yearsInvalid = years === null || years < 0;

  const result =
    costInvalid || finalInvalid || yearsInvalid
      ? null
      : computeRoi({ cost, finalValue: final, years });

  const money = (value: number) => `${formatMoney(value)} ₫`;

  // Two states worth naming rather than leaving as an empty row: no holding
  // period given, and a total loss. Both have a real ROI but no annual rate.
  const noAnnual =
    result !== null && result.annualisedPercent === null && result.years === null;
  const totalLoss =
    result !== null && result.annualisedPercent === null && result.years !== null;

  const annualised =
    result?.annualisedPercent == null
      ? null
      : formatPercent(result.annualisedPercent);

  // Names the period on the whole-period row, from the SAME `result.years` the
  // annual figure was computed from, so the two rows cannot describe different
  // spans. No period entered means no period to name.
  //
  // `formatQuantity`, not `formatDecimal`: a whole number of years reads "3",
  // and half a year still reads "0,5". A fixed two places would put "cả 3,00
  // năm" in a label.
  const roiRowLabel =
    result === null || result.years === null
      ? C.form.roiLabel
      : C.form.roiPeriodFormat.replace("{years}", formatQuantity(result.years));

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <FieldGroup title={C.form.group}>
            <NumberField
              {...fields.bind("cost")}
              label={C.form.costLabel}
              unit={C.form.costUnit}
              help={C.form.costHelp}
              error={C.form.costInvalid}
              invalid={costInvalid}
            />
            <NumberField
              {...fields.bind("final")}
              label={C.form.finalLabel}
              unit={C.form.finalUnit}
              help={C.form.finalHelp}
              error={C.form.finalInvalid}
              invalid={finalInvalid}
            />
            <NumberField
              {...fields.bind("years")}
              label={C.form.yearsLabel}
              unit={C.form.yearsUnit}
              help={C.form.yearsHelp}
              error={C.form.yearsInvalid}
              invalid={yearsInvalid}
            />
          </FieldGroup>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            // An EMPTY holding period is not in this list on purpose: it is a
            // supported entry, the ROI rows are still correct without it, and
            // sending the reader back to a field they left blank deliberately
            // would call a valid answer a mistake.
            invalid={costInvalid || finalInvalid || yearsInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              {/* The annual figure is the headline because it is the only one
                  of the four that compares to anything. */}
              <ResultRow
                label={C.form.annualisedLabel}
                value={annualised}
                emphasis
              />
              {/* Net profit, next: row 23 asks for it ahead of the ratios. */}
              <ResultRow
                label={C.form.gainLabel}
                value={result === null ? null : money(result.gain)}
              />
              <ResultRow
                label={roiRowLabel}
                value={result === null ? null : formatPercent(result.roiPercent)}
              />
              <ResultRow
                label={C.form.multipleLabel}
                value={
                  result === null
                    ? null
                    : `${formatDecimal(result.multiple)} ${C.form.multipleSuffix}`
                }
              />
            </ResultGroup>

            {/* Both of these explain a visible dash on the headline row, so
                they stay beside the answer rather than moving into a
                disclosure: a reader who cannot see them is looking at an
                unexplained gap where the main figure should be. */}
            {noAnnual ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noAnnualNotice}
              </p>
            ) : null}

            {totalLoss ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.totalLossNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        nextSteps={nextSteps}
      />
    </CalculatorCard>
  );
}
