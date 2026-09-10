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
import { computePoints } from "@/lib/calc/points";
import { POINTS as C } from "@/content/calculators/points";

export function PointsCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    term: C.form.defaultTerm,
    baseRate: C.form.defaultBaseRate,
    points: C.form.defaultPoints,
    reduction: C.form.defaultReduction,
    hold: C.form.defaultHold,
  });

  const amount = parseMoney(fields.values.amount);
  const term = parseDecimal(fields.values.term);
  const baseRate = parseDecimal(fields.values.baseRate);
  const pointsPercent = parseDecimal(fields.values.points);
  const reduction = parseDecimal(fields.values.reduction);
  const hold = parseDecimal(fields.values.hold);

  const amountInvalid = amount === null || amount <= 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const baseRateInvalid = baseRate === null || baseRate < 0;
  const pointsInvalid = pointsPercent === null || pointsPercent < 0;
  // A reduction that takes the rate below zero is not a product on offer.
  const reductionInvalid =
    reduction === null ||
    reduction < 0 ||
    (baseRate !== null && reduction > baseRate);
  const holdInvalid = hold === null || hold <= 0 || !Number.isInteger(hold);

  const result =
    amountInvalid ||
    termInvalid ||
    baseRateInvalid ||
    pointsInvalid ||
    reductionInvalid ||
    holdInvalid
      ? null
      : computePoints({
          amount,
          termMonths: term,
          baseRatePercent: baseRate,
          pointsPercent,
          rateReductionPoints: reduction,
          holdMonths: hold,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.loanGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
        <NumberField
          {...fields.bind("baseRate")}
          label={C.form.baseRateLabel}
          unit={C.form.baseRateUnit}
          help={C.form.baseRateHelp}
          error={C.form.baseRateInvalid}
          invalid={baseRateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.offerGroup} className="mt-8">
        <NumberField
          {...fields.bind("points")}
          label={C.form.pointsLabel}
          unit={C.form.pointsUnit}
          help={C.form.pointsHelp}
          error={C.form.pointsInvalid}
          invalid={pointsInvalid}
        />
        <NumberField
          {...fields.bind("reduction")}
          label={C.form.reductionLabel}
          unit={C.form.reductionUnit}
          help={C.form.reductionHelp}
          error={C.form.reductionInvalid}
          invalid={reductionInvalid}
        />
        <NumberField
          {...fields.bind("hold")}
          label={C.form.holdLabel}
          help={C.form.holdHelp}
          error={C.form.holdInvalid}
          invalid={holdInvalid}
        />
      </FieldGroup>

      {/* The verdict is the horizon comparison, not the naive break-even.
          The naive figure lives in the non-live detail group below, labelled
          as what it is. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.verdictLabel}
          value={
            result === null
              ? null
              : result.worthIt
                ? C.form.verdictYes
                : C.form.verdictNo
          }
        />
        <ResultRow
          label={C.form.holdPositionLabel}
          value={money(result?.holdPosition)}
        />
        <ResultRow
          label={C.form.holdMonthsLabel}
          value={
            result
              ? `${formatDecimal(result.holdMonths, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow label={C.form.costLabel} value={money(result?.cost)} />
        <ResultRow
          label={C.form.buydownRateLabel}
          value={result ? formatPercent(result.buydownRatePercent) : null}
        />
        <ResultRow
          label={C.form.basePaymentLabel}
          value={money(result?.basePayment)}
        />
        <ResultRow
          label={C.form.buydownPaymentLabel}
          value={money(result?.buydownPayment)}
        />
        <ResultRow
          label={C.form.monthlySavingLabel}
          value={money(result?.monthlySaving)}
        />
        <ResultRow
          label={C.form.breakEvenLabel}
          value={
            result?.breakEvenMonths == null
              ? null
              : `${formatDecimal(result.breakEvenMonths, 0)} ${C.form.monthsUnit}`
          }
        />
        <ResultRow
          label={C.form.baseHoldLabel}
          value={money(result?.baseHoldCost)}
        />
        <ResultRow
          label={C.form.buydownHoldLabel}
          value={money(result?.buydownHoldCost)}
        />
        <ResultRow
          label={C.form.lifetimeLabel}
          value={money(result?.lifetimeSaving)}
        />
      </ResultGroup>

      {result !== null && result.breakEvenMonths === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noBreakEvenNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
