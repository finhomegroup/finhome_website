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
import { computeHoldingPeriod } from "@/lib/calc/holding-period";
import { HOLDING_PERIOD as C } from "@/content/calculators/holding-period";

/*
 * CSV row 40 ("Gọn"): "tách rõ lợi nhuận cả kỳ và theo năm bằng nhãn rõ ràng;
 * gom ô nhập thành một khối gọn". The inputs were already one block; what
 * changes is that the annual figure becomes the one headline, the whole-period
 * row names its own span, and the five money lines move to the full-width
 * detail region. Docs §8.
 */
const FORM_ID = "ky-nam-giu-nhap";
const RESULT_ID = "ky-nam-giu-ket-qua";

export function HoldingPeriodCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`.
  const fields = useCalcFields(
    {
      begin: C.form.defaultBegin,
      end: C.form.defaultEnd,
      income: C.form.defaultIncome,
      years: C.form.defaultYears,
    },
    { begin: "money", end: "money", income: "money", years: "rate" },
  );

  const begin = parseMoney(fields.values.begin);
  const end = parseMoney(fields.values.end);
  const income = parseMoney(fields.values.income);

  // Optional: empty means "I don't need the annual figure", not an error.
  const yearsRaw = fields.values.years.trim();
  const years = yearsRaw === "" ? 0 : parseDecimal(yearsRaw);

  const beginInvalid = begin === null || begin <= 0;
  const endInvalid = end === null || end < 0;
  const incomeInvalid = income === null || income < 0;
  const yearsInvalid = years === null || years < 0;

  const result =
    beginInvalid || endInvalid || incomeInvalid || yearsInvalid
      ? null
      : computeHoldingPeriod({
          beginValue: begin,
          endValue: end,
          incomeReceived: income,
          years,
        });

  // Two distinct reasons the annual figure can be absent, and the user needs
  // to know which one they hit.
  const noAnnual =
    result !== null &&
    result.annualisedReturnPercent === null &&
    result.years === null;
  const totalLoss =
    result !== null &&
    result.annualisedReturnPercent === null &&
    result.years !== null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  // Read from the SAME `result.years` the annual figure was computed from, so
  // the two rows cannot name different spans. `formatQuantity` keeps a whole
  // number of years reading as "3" rather than "3,00" inside a label.
  const hprRowLabel =
    result === null || result.years === null
      ? C.form.hprLabel
      : C.form.hprPeriodFormat.replace("{years}", formatQuantity(result.years));

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <FieldGroup title={C.form.group}>
            <NumberField
              {...fields.bind("begin")}
              label={C.form.beginLabel}
              unit={C.form.beginUnit}
              help={C.form.beginHelp}
              error={C.form.beginInvalid}
              invalid={beginInvalid}
            />
            <NumberField
              {...fields.bind("end")}
              label={C.form.endLabel}
              unit={C.form.endUnit}
              help={C.form.endHelp}
              error={C.form.endInvalid}
              invalid={endInvalid}
            />
            <NumberField
              {...fields.bind("income")}
              label={C.form.incomeLabel}
              unit={C.form.incomeUnit}
              help={C.form.incomeHelp}
              error={C.form.incomeInvalid}
              invalid={incomeInvalid}
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
            // An EMPTY holding period is not in this list: the whole-period
            // figures are still correct without it, and `yearsInvalid` is
            // already false while the box is blank.
            invalid={beginInvalid || endInvalid || incomeInvalid || yearsInvalid}
          />
        }
        primary={
          <>
            {/* The annual figure is the headline because it compares; the
                whole-period row states its own span so the two cannot be read
                as two measurements of the same thing. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.annualisedLabel}
                value={
                  result?.annualisedReturnPercent == null
                    ? null
                    : formatPercent(result.annualisedReturnPercent, 4)
                }
                emphasis
              />
              <ResultRow
                label={hprRowLabel}
                value={
                  result
                    ? formatPercent(result.holdingPeriodReturnPercent, 4)
                    : null
                }
              />
              <ResultRow
                label={C.form.capitalGainYieldLabel}
                value={
                  result ? formatPercent(result.capitalGainYieldPercent, 4) : null
                }
              />
              <ResultRow
                label={C.form.incomeYieldLabel}
                value={result ? formatPercent(result.incomeYieldPercent, 4) : null}
              />
            </ResultGroup>

            {/* Both explain a dash on the HEADLINE row, so they stay beside the
                answer rather than moving below the money detail. */}
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
        detail={
          // The đồng figures the percentages came from. NOT live: the summary
          // above is the one announced region.
          <ResultGroup title={C.form.detailTitle} live={false}>
            <ResultRow
              label={C.form.capitalGainLabel}
              value={money(result?.capitalGain)}
            />
            <ResultRow
              label={C.form.totalGainLabel}
              value={money(result?.totalGain)}
            />
            <ResultRow
              label={C.form.totalProceedsLabel}
              value={money(result?.totalProceeds)}
            />
            <ResultRow
              label={C.form.incomeShareLabel}
              value={
                result?.incomeSharePercent == null
                  ? null
                  : formatPercent(result.incomeSharePercent, 2)
              }
            />
            <ResultRow
              label={C.form.yearsResultLabel}
              value={
                result?.years == null
                  ? null
                  : `${formatDecimal(result.years, 2)} ${C.form.yearsSuffix}`
              }
            />
          </ResultGroup>
        }
      />
    </CalculatorCard>
  );
}
