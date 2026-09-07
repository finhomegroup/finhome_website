"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
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

export function UsTbillCalculator() {
  const fields = useCalcFields(F.defaults);

  const face = parseMoney(fields.values.face);
  const discount = parseDecimal(fields.values.discount);
  const days = parseMoney(fields.values.days);
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

  return (
    <CalculatorCard>
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

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.priceLabel}
          value={result === null ? null : usd(result.price)}
        />
        <ResultRow
          label={F.discountAmountLabel}
          value={result === null ? null : usd(result.discountAmount)}
        />
        <ResultRow
          label={F.investmentYieldLabel}
          value={result === null ? null : percent(result.investmentYieldPercent)}
        />
        <ResultRow
          label={F.understatementLabel}
          value={
            result === null || result.quoteUnderstatementPoints === null
              ? null
              : `${formatDecimal(result.quoteUnderstatementPoints, 4)} ${F.pointsUnit}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.yieldsTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.periodReturnLabel}
          value={result === null ? null : percent(result.periodReturnPercent)}
        />
        <ResultRow
          label={F.investmentYieldLabel}
          value={result === null ? null : percent(result.investmentYieldPercent)}
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
          value={result === null ? null : percent(result.afterTaxYieldPercent)}
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

      {result?.beyondShortBillRule ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.beyondShortBillNotice}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
