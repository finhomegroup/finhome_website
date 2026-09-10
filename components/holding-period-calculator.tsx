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
import { computeHoldingPeriod } from "@/lib/calc/holding-period";
import { HOLDING_PERIOD as C } from "@/content/calculators/holding-period";

export function HoldingPeriodCalculator() {
  const fields = useCalcFields({
    begin: C.form.defaultBegin,
    end: C.form.defaultEnd,
    income: C.form.defaultIncome,
    years: C.form.defaultYears,
  });

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

  return (
    <CalculatorCard>
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

      {/* The annual figure first because it compares, then the total and its
          two halves — the split is what the page exists for. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.annualisedLabel}
          value={
            result?.annualisedReturnPercent == null
              ? null
              : formatPercent(result.annualisedReturnPercent, 4)
          }
        />
        <ResultRow
          label={C.form.hprLabel}
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

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
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
    </CalculatorCard>
  );
}
