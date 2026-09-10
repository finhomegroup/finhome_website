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
import { computeApr } from "@/lib/calc/apr";
import { APR as C } from "@/content/calculators/apr";

export function AprCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    upfront: C.form.defaultUpfront,
    points: C.form.defaultPoints,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const upfront = parseMoney(fields.values.upfront);
  const points = parseDecimal(fields.values.points);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const upfrontInvalid = upfront === null || upfront < 0;
  const pointsInvalid = points === null || points < 0 || points >= 100;

  const result =
    amountInvalid ||
    rateInvalid ||
    termInvalid ||
    upfrontInvalid ||
    pointsInvalid
      ? null
      : computeApr({
          amount,
          annualRatePercent: rate,
          termMonths: term,
          upfrontFees: upfront,
          pointsPercent: points,
        });

  // The loan figures can be valid while the rate solver finds no root. That
  // is a real outcome, and the rest of the result is still worth showing.
  const unsolvable = result !== null && result.aprPercent === null;

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
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.feeGroup} className="mt-8">
        <NumberField
          {...fields.bind("upfront")}
          label={C.form.upfrontLabel}
          unit={C.form.upfrontUnit}
          help={C.form.upfrontHelp}
          error={C.form.upfrontInvalid}
          invalid={upfrontInvalid}
        />
        <NumberField
          {...fields.bind("points")}
          label={C.form.pointsLabel}
          unit={C.form.pointsUnit}
          help={C.form.pointsHelp}
          error={C.form.pointsInvalid}
          invalid={pointsInvalid}
        />
      </FieldGroup>

      {/* Four decimals: the whole point of the tool is a difference that
          shows up in the second and third digit after the comma. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.aprLabel}
          value={
            result?.aprPercent == null
              ? null
              : formatPercent(result.aprPercent, 4)
          }
        />
        <ResultRow
          label={C.form.spreadLabel}
          value={
            result?.aprSpreadPoints == null
              ? null
              : `${formatDecimal(result.aprSpreadPoints, 4)} ${C.form.pointsSuffix}`
          }
        />
        <ResultRow
          label={C.form.effectiveLabel}
          value={
            result?.aprEffectivePercent == null
              ? null
              : formatPercent(result.aprEffectivePercent, 4)
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.paymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.netProceedsLabel}
          value={money(result?.netProceeds)}
        />
        <ResultRow
          label={C.form.totalFeesLabel}
          value={money(result?.totalFees)}
        />
        <ResultRow
          label={C.form.pointsCostLabel}
          value={money(result?.pointsCost)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.totalCostLabel}
          value={money(result?.totalCost)}
        />
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
      </ResultGroup>

      {unsolvable ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unsolvableNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
