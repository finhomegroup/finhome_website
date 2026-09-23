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
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsTbill } from "@/lib/calc/us-tbill";
import { US_TBILL as C } from "@/content/calculators/us-tbill";

const F = C.form;

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

function percent(value: number | null): string | null {
  return value === null ? null : formatPercent(value, 4);
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "tin-phieu-kho-bac-hoa-ky-nhap";
const RESULT_ID = "tin-phieu-kho-bac-hoa-ky-ket-qua";

export function UsTbillCalculator() {
  const fields = useCalcFields(F.defaults);

  const face = parseMoney(fields.values.face);
  const discount = parseDecimal(fields.values.discount);
  const days = parseCount(fields.values.days);
  const federal = parseDecimal(fields.values.federal);
  const state = parseDecimal(fields.values.state);

  const faceInvalid = face === null || face <= 0;
  const daysInvalid =
    days === null || !Number.isInteger(days) || days < 1 || days > 366;
  const federalInvalid = federal === null || federal < 0 || federal > 100;
  const stateInvalid = state === null || state < 0 || state > 100;

  // A discount rate is only "invalid" when it prices the bill at or below
  // zero, and that depends on the term — so the module is the judge and the
  // field is marked from its verdict rather than from a range check here.
  const structurallyValid =
    !faceInvalid && !daysInvalid && !federalInvalid && !stateInvalid;

  const result =
    structurallyValid && discount !== null
      ? computeUsTbill({
          faceValue: face,
          discountRatePercent: discount,
          daysToMaturity: days,
          federalRatePercent: federal,
          stateRatePercent: state,
        })
      : null;

  const discountInvalid =
    discount === null || (structurallyValid && result === null);

  /*
   * CSV row 75 is "Gọn", so `columns="single"`. Its action: price and yield
   * adjacent, the QUOTING CONVENTION separated from the real/investment
   * yield, the discount-invalid state derived from the pricing, and the
   * registry's US scope kept before the form.
   *
   * Two of those were already true and stay: the US notice is rendered by the
   * shell from the registry's `usRules` flag, above the tool; and
   * `discountInvalid` is read off `computeUsTbill` returning null rather than
   * from a range check here, which is what makes "quá cao" mean "prices the
   * bill at or below zero AT THIS TERM". Neither is rebuilt.
   *
   * What changed is the grouping. The understatement row used to sit in the
   * same group as the yield it is measured against, so a gap between two
   * conventions read as a fifth kind of return. No arithmetic changed and
   * every figure keeps its four decimals.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
            <FieldGroup title={F.billGroup}>
              <NumberField
                {...fields.bind("face")}
                label={F.faceLabel}
                unit={F.faceUnit}
                help={F.faceHelp}
                error={F.faceInvalid}
                invalid={faceInvalid}
              />
              <NumberField
                {...fields.bind("discount")}
                label={F.discountLabel}
                unit={F.discountUnit}
                help={F.discountHelp}
                error={F.discountInvalid}
                invalid={discountInvalid}
              />
              <NumberField
                {...fields.bind("days")}
                label={F.daysLabel}
                unit={F.daysUnit}
                help={F.daysHelp}
                error={F.daysInvalid}
                invalid={daysInvalid}
              />
            </FieldGroup>

            <FieldGroup title={F.taxGroup} className="mt-8">
              <NumberField
                {...fields.bind("federal")}
                label={F.federalLabel}
                unit={F.federalUnit}
                help={F.federalHelp}
                error={F.federalInvalid}
                invalid={federalInvalid}
              />
              <NumberField
                {...fields.bind("state")}
                label={F.stateLabel}
                unit={F.stateUnit}
                help={F.stateHelp}
                error={F.stateInvalid}
                invalid={stateInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={
              faceInvalid ||
              discountInvalid ||
              daysInvalid ||
              federalInvalid ||
              stateInvalid
            }
          />
        }
        primary={
          <>
            {/* Price and yield adjacent, which is the row's first clause: what
                you pay, what you get back, and what that is per year. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.priceLabel}
                value={result === null ? null : usd(result.price)}
                emphasis
              />
              <ResultRow
                label={F.discountAmountLabel}
                value={result === null ? null : usd(result.discountAmount)}
              />
              <ResultRow
                label={F.investmentYieldLabel}
                value={
                  result === null ? null : percent(result.investmentYieldPercent)
                }
              />
            </ResultGroup>

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* The convention, on its own. It is a distance between two ways
                of quoting the same bill, not a return. */}
            <ResultGroup
              title={F.quoteConventionTitle}
              className="mt-4"
              live={false}
            >
              <ResultRow
                label={F.understatementLabel}
                value={
                  result === null || result.quoteUnderstatementPoints === null
                    ? null
                    : `${formatDecimal(result.quoteUnderstatementPoints, 4)} ${F.pointsUnit}`
                }
              />
            </ResultGroup>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.quoteConventionNote}
            </p>
          </>
        }
        detail={
          <>
            <ResultGroup title={F.yieldsTitle} live={false}>
              <ResultRow
                label={F.periodReturnLabel}
                value={result === null ? null : percent(result.periodReturnPercent)}
              />
              <ResultRow
                label={F.investmentYieldLabel}
                value={
                  result === null ? null : percent(result.investmentYieldPercent)
                }
              />
              <ResultRow
                label={F.bondEquivalentLabel}
                value={
                  result === null
                    ? null
                    : percent(result.bondEquivalentYieldPercent)
                }
              />
              <ResultRow
                label={F.effectiveAnnualLabel}
                value={
                  result === null
                    ? null
                    : percent(result.effectiveAnnualYieldPercent)
                }
              />
            </ResultGroup>

            {/* Why the semiannual row may not match the Treasury's published
                coupon equivalent at this term. A model limit on a figure in
                the group above, so it sits directly under it. */}
            {result?.beyondShortBillRule ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.beyondShortBillNotice}
              </p>
            ) : null}

            <ResultGroup title={F.taxTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.federalTaxLabel}
                value={result === null ? null : usd(result.federalTax)}
              />
              <ResultRow
                label={F.afterTaxProfitLabel}
                value={result === null ? null : usd(result.afterTaxProfit)}
              />
              <ResultRow
                label={F.afterTaxYieldLabel}
                value={
                  result === null ? null : percent(result.afterTaxYieldPercent)
                }
              />
              <ResultRow
                label={F.taxableEquivalentLabel}
                value={
                  result === null
                    ? null
                    : percent(result.taxableEquivalentYieldPercent)
                }
              />
            </ResultGroup>

            {/* A state rate of 100% is a VALID entry that leaves exactly one
                row without an answer. Beside that row, not after the page. */}
            {result !== null && result.taxableEquivalentYieldPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.taxableEquivalentUnavailableNotice}
              </p>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
