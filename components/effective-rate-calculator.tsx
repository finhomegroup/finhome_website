"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatPercent, parseDecimal } from "@/lib/calc/number";
import type { Compounding } from "@/lib/calc/finance";
import {
  convertRate,
  COMPOUNDING_ORDER,
  type RateDirection,
} from "@/lib/calc/effective-rate";
import { EFFECTIVE_RATE as C } from "@/content/calculators/effective-rate";

const F = C.form;

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "lai-suat-thuc-te-nhap";
const RESULT_ID = "lai-suat-thuc-te-ket-qua";

/**
 * ROW 60: "Một khối gọn lãi niêm yết → lãi hiệu dụng; giảm số lẻ ở kết quả
 * mặc định."
 *
 * `columns="single"` because the audit classes this row "Gọn": three controls
 * split 40/60 is two stub columns.
 *
 * THE PRECISION CHANGE IS PRESENTATION ONLY, and it is the half of this row
 * that could have gone wrong. `convertRate` is called with the same arguments
 * and its result is read field for field; nothing is rounded before it is
 * formatted. What changed is WHICH formatting opens the page: the two rates a
 * reader came for are `formatPercent(x, 2)` under labels that say "khoảng",
 * and the four-decimal figures — both rates, the periodic rate and the
 * compounding gain — are in the `detail` region beside the table that teaches
 * the same difference. A tool whose subject is the third decimal place must
 * not DISCARD the third decimal place; it can decline to lead with it.
 */
export function EffectiveRateCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The longer guidance below — `<ToolNextSteps promoted>`. */
  nextSteps?: React.ReactNode;
}) {
  const fields = useCalcFields({
    direction: "toEffective",
    rate: F.defaultRate,
    compounding: F.defaultCompounding,
  });

  const rate = parseDecimal(fields.values.rate);
  // −100%/năm would take the balance to zero within the year; below that it
  // goes negative, and neither is a rate this module will convert.
  const rateInvalid = rate === null || rate <= -100;

  const result = rateInvalid
    ? null
    : convertRate({
        direction: fields.values.direction as RateDirection,
        ratePercent: rate,
        compounding: fields.values.compounding as Compounding,
      });

  const tableRows = result
    ? result.table.map((row) => [
        C.compounding[row.compounding],
        formatDecimal(row.periodsPerYear, 0),
        formatPercent(row.effectivePercent, 4),
        `${formatDecimal(row.extraPoints, 4)} ${F.pointsUnit}`,
      ])
    : [];

  // The ONE main answer, formatted once so the pinned-CTA restatement and the
  // emphasised row cannot round the same number two different ways.
  const approxEffective =
    result === null ? null : formatPercent(result.effectivePercent, 2);

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
                legend={F.directionLegend}
                help={F.directionHelp}
                options={[
                  { value: "toEffective", label: F.directionToEffective },
                  { value: "toNominal", label: F.directionToNominal },
                ]}
              />
            </FieldGroup>

            <FieldGroup title={F.group} className="mt-8">
              <NumberField
                {...fields.bind("rate")}
                label={F.rateLabel}
                unit={F.rateUnit}
                help={F.rateHelp}
                error={F.rateInvalid}
                invalid={rateInvalid}
              />
              <SelectField
                {...fields.bind("compounding")}
                label={F.compoundingLabel}
                help={F.compoundingHelp}
                options={COMPOUNDING_ORDER.map((compounding) => ({
                  value: compounding,
                  label: C.compounding[compounding],
                }))}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={rateInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.approxEffectiveLabel}
                value={approxEffective}
                emphasis
              />
              <ResultRow
                label={F.approxNominalLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.nominalPercent, 2)
                }
              />
              <ResultRow
                label={F.periodsLabel}
                value={
                  result === null
                    ? null
                    : `${formatDecimal(result.periodsPerYear, 0)} ${F.periodsUnit}`
                }
              />
            </ResultGroup>

            {/* Beside the rounded figures it describes, not below the table:
                a reader who compares two products on a two-decimal number has
                been misled by the rounding, so the pointer to the exact rows
                has to be where the rounding is. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.approxNote}
            </p>
          </>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <>
            {/* `live={false}`: the page is allowed exactly one live region and
                it is the group above — see scripts/check-built-markup.mjs. */}
            <ResultGroup title={F.exactTitle} live={false}>
              <ResultRow
                label={F.effectiveLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.effectivePercent, 4)
                }
              />
              <ResultRow
                label={F.nominalLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.nominalPercent, 4)
                }
              />
              <ResultRow
                label={F.periodicLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.periodicPercent, 4)
                }
              />
              <ResultRow
                label={F.gainLabel}
                value={
                  result === null
                    ? null
                    : `${formatDecimal(result.compoundingGainPoints, 4)} ${F.pointsUnit}`
                }
              />
            </ResultGroup>

            {tableRows.length > 0 ? (
              /*
              `mobileCards` because this table has nothing left to compact.
              Measured at a verified 390 px viewport on 2026-09-16: 400 px
              inside a 300 px scroll frame, and unlike the commercial-loan year
              table NEITHER of the two levers that fixed that one is available
              here.

              Its figures are PERCENTAGES, not money, so `hasMoneyCell` is
              false and there is no compact reading to switch to — "10,4713" is
              already the short form. And its first column is genuine prose
              (the compounding names, "Hằng tháng" / "Nửa năm một lần"), so the
              8,5rem label floor is doing the job it exists for rather than
              wasting space; it is 136 px of a 300 px budget that cannot be
              reclaimed.

              That leaves the headers, which ARE the widest text in every
              column here (68/78/118 px). Shortening all three lands at about
              304 px — still over, and only by turning "Hơn ghép năm" into
              something that no longer says what it is compared against. A
              block per row is the honest trade: the column scan survives from
              `md` up, and below it a reader gets whole rows instead of a
              column hidden off-frame.
              */
              <ResultTable
                className="mt-8"
                caption={C.table.caption}
                columns={[
                  { label: C.table.compoundingColumn },
                  { label: C.table.periodsColumn, numeric: true },
                  { label: C.table.effectiveColumn, numeric: true },
                  { label: C.table.extraColumn, numeric: true },
                ]}
                rows={tableRows}
                mobileCards
              />
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
