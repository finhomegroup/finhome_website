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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { compareRefinance } from "@/lib/calc/refinance";
import { REFINANCE as C } from "@/content/calculators/refinance";

export function RefinanceCalculator() {
  const fields = useCalcFields({
    balance: C.form.defaultBalance,
    currentRate: C.form.defaultCurrentRate,
    remaining: C.form.defaultRemaining,
    newRate: C.form.defaultNewRate,
    newTerm: C.form.defaultNewTerm,
    costs: C.form.defaultCosts,
  });

  const balance = parseMoney(fields.values.balance);
  const currentRate = parseDecimal(fields.values.currentRate);
  const remaining = parseDecimal(fields.values.remaining);
  const newRate = parseDecimal(fields.values.newRate);
  const newTerm = parseDecimal(fields.values.newTerm);
  const costs = parseMoney(fields.values.costs);

  const balanceInvalid = balance === null || balance <= 0;
  const currentRateInvalid = currentRate === null || currentRate < 0;
  const remainingInvalid =
    remaining === null || remaining <= 0 || !Number.isInteger(remaining);
  const newRateInvalid = newRate === null || newRate < 0;
  const newTermInvalid =
    newTerm === null || newTerm <= 0 || !Number.isInteger(newTerm);
  const costsInvalid = costs === null || costs < 0;

  const result =
    balanceInvalid ||
    currentRateInvalid ||
    remainingInvalid ||
    newRateInvalid ||
    newTermInvalid ||
    costsInvalid
      ? null
      : compareRefinance({
          balance,
          currentRatePercent: currentRate,
          remainingMonths: remaining,
          newRatePercent: newRate,
          newTermMonths: newTerm,
          closingCosts: costs,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const months = (count: number) =>
    `${formatDecimal(count, 0)} ${C.form.monthsUnit}`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.currentGroup}>
        <NumberField
          {...fields.bind("balance")}
          label={C.form.balanceLabel}
          unit={C.form.balanceUnit}
          help={C.form.balanceHelp}
          error={C.form.balanceInvalid}
          invalid={balanceInvalid}
        />
        <NumberField
          {...fields.bind("currentRate")}
          label={C.form.currentRateLabel}
          unit={C.form.currentRateUnit}
          help={C.form.currentRateHelp}
          error={C.form.currentRateInvalid}
          invalid={currentRateInvalid}
        />
        <NumberField
          {...fields.bind("remaining")}
          label={C.form.remainingLabel}
          help={C.form.remainingHelp}
          error={C.form.remainingInvalid}
          invalid={remainingInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.newGroup} className="mt-8">
        <NumberField
          {...fields.bind("newRate")}
          label={C.form.newRateLabel}
          unit={C.form.newRateUnit}
          help={C.form.newRateHelp}
          error={C.form.newRateInvalid}
          invalid={newRateInvalid}
        />
        <NumberField
          {...fields.bind("newTerm")}
          label={C.form.newTermLabel}
          help={C.form.newTermHelp}
          error={C.form.newTermInvalid}
          invalid={newTermInvalid}
        />
        <NumberField
          {...fields.bind("costs")}
          label={C.form.costsLabel}
          unit={C.form.costsUnit}
          help={C.form.costsHelp}
          error={C.form.costsInvalid}
          invalid={costsInvalid}
        />
      </FieldGroup>

      {/* The conclusion, live: lifetime saving FIRST, then break-even. The
          order matters — break-even alone is the figure that misleads when
          the term has been reset. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.lifetimeLabel}
          value={money(result?.lifetimeSaving)}
        />
        <ResultRow
          label={C.form.breakEvenLabel}
          value={
            result?.breakEvenMonths == null
              ? null
              : months(result.breakEvenMonths)
          }
        />
        <ResultRow
          label={C.form.monthlySavingLabel}
          value={money(result?.monthlySaving)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.currentPaymentLabel}
          value={money(result?.currentPayment)}
        />
        <ResultRow
          label={C.form.newPaymentLabel}
          value={money(result?.newPayment)}
        />
        <ResultRow
          label={C.form.currentInterestLabel}
          value={money(result?.currentRemainingInterest)}
        />
        <ResultRow
          label={C.form.newInterestLabel}
          value={money(result?.newTotalInterest)}
        />
        <ResultRow
          label={C.form.interestSavingLabel}
          value={money(result?.interestSaving)}
        />
        <ResultRow
          label={C.form.costsResultLabel}
          value={money(result?.closingCosts)}
        />
        <ResultRow
          label={C.form.termChangeLabel}
          value={result ? months(result.termChangeMonths) : null}
        />
      </ResultGroup>

      {result !== null && result.breakEvenMonths === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noBreakEvenNotice}
        </p>
      ) : null}

      {result?.termExtended ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.extendedNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
