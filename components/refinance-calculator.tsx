"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import { ExampleNotice, ExampleNoticeDetail } from "@/components/calc/example-notice";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatMoney, parseCount, parseDecimal, parseMoney } from "@/lib/calc/number";
import { moneyCell } from "@/lib/calc/table-cell";
import { compareRefinance } from "@/lib/calc/refinance";
import { refinanceChartModel } from "@/lib/calc/charts/refinance-chart";
import { fill } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { REFINANCE as C } from "@/content/calculators/refinance";

export function RefinanceCalculator() {
  const initial = {
    balance: C.form.defaultBalance, currentRate: C.form.defaultCurrentRate,
    remaining: C.form.defaultRemaining, newRate: C.form.defaultNewRate,
    newTerm: C.form.defaultNewTerm, costs: C.form.defaultCosts,
    oldFee: C.form.defaultOldFee, horizon: C.form.defaultHorizon,
  };
  const fields = useCalcFields(initial);
  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every((key) => fields.values[key] === initial[key]);
  const balance = parseMoney(fields.values.balance);
  const currentRate = parseDecimal(fields.values.currentRate);
  const remaining = parseCount(fields.values.remaining);
  const newRate = parseDecimal(fields.values.newRate);
  const newTerm = parseCount(fields.values.newTerm);
  const costs = parseMoney(fields.values.costs);
  const oldFee = parseMoney(fields.values.oldFee);
  const horizon = parseCount(fields.values.horizon);
  const invalid = {
    balance: balance === null || balance <= 0,
    currentRate: currentRate === null || currentRate < 0 || currentRate > 100,
    newRate: newRate === null || newRate < 0 || newRate > 100,
    remaining: remaining === null || remaining < 1 || remaining > 1200,
    newTerm: newTerm === null || newTerm < 1 || newTerm > 1200,
    costs: costs === null || costs < 0, oldFee: oldFee === null || oldFee < 0,
    horizon: horizon === null || horizon < 0 || horizon > 1200,
  };
  const result = Object.values(invalid).some(Boolean) ? null : compareRefinance({
    balance: balance!, currentRatePercent: currentRate!, remainingMonths: remaining!,
    newRatePercent: newRate!, newTermMonths: newTerm!, closingCosts: costs!,
    earlySettlementFee: oldFee!, horizonMonths: horizon!,
  });
  const chart = refinanceChartModel(result, { ...CHART_UI.money, ...C.chart });
  const money = (n: number | undefined) => n === undefined ? null : `${formatMoney(n)} ${C.form.moneyUnit}`;
  const months = (n: number) => `${formatDecimal(n, 0)} ${C.form.monthsUnit}`;
  const crossing = (n: number | null) => n === null ? C.form.noBreakEven : n === 0 && result?.closingCosts === 0 ? C.form.zeroBreakEven : months(n);
  const field = (key: keyof typeof initial, label: string, help: string, error: string, unit?: string) => (
    <NumberField key={key} {...fields.bind(key)} label={label} help={help} error={error} unit={unit} invalid={invalid[key]} />
  );
  return (
    <CalculatorCard>
      <ExampleNotice pristine={pristine} onReset={fields.reset} />
      <FieldGroup title={C.form.currentGroup} className="mt-6">
        {field("balance", C.form.balanceLabel, C.form.balanceHelp, C.form.balanceInvalid, C.form.moneyUnit)}
        {field("currentRate", C.form.currentRateLabel, C.form.currentRateHelp, C.form.rateInvalid, C.form.rateUnit)}
        {field("remaining", C.form.remainingLabel, C.form.remainingHelp, C.form.monthsInvalid, C.form.monthsUnit)}
      </FieldGroup>
      <FieldGroup title={C.form.newGroup} className="mt-6">
        {field("newRate", C.form.newRateLabel, C.form.newRateHelp, C.form.rateInvalid, C.form.rateUnit)}
        {field("newTerm", C.form.newTermLabel, C.form.newTermHelp, C.form.monthsInvalid, C.form.monthsUnit)}
        {field("horizon", C.form.horizonLabel, C.form.horizonHelp, C.form.horizonInvalid, C.form.monthsUnit)}
      </FieldGroup>
      <AdvancedFields title={C.form.feesTitle} emptySummary={C.form.feesNone} className="mt-6" settings={[
        { key: "oldFee", label: C.form.oldFeeLabel, value: invalid.oldFee ? C.form.costsInvalid : money(oldFee!)!, active: invalid.oldFee || oldFee !== 0 },
        { key: "costs", label: C.form.costsLabel, value: invalid.costs ? C.form.costsInvalid : money(costs!)!, active: invalid.costs || costs !== 0 },
      ]}>
        <FieldGroup title={C.form.feesGroup}>
          {field("oldFee", C.form.oldFeeLabel, C.form.oldFeeHelp, C.form.costsInvalid, C.form.moneyUnit)}
          {field("costs", C.form.costsLabel, C.form.costsHelp, C.form.costsInvalid, C.form.moneyUnit)}
        </FieldGroup>
      </AdvancedFields>
      <ResultGroup title={fill(C.form.resultTitle, { month: result?.horizonMonths ?? "—" })} className="mt-8">
        <ResultRow label={C.form.costSavingLabel} value={money(result?.horizonCostSaving)} />
        <ResultRow label={C.form.cashSavingLabel} value={money(result?.horizonCashFlowSaving)} />
        <ResultRow label={C.form.breakEvenLabel} value={result ? crossing(result.breakEvenMonths) : null} prose />
      </ResultGroup>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{C.form.signNote}</p>
      <ChartFigure model={chart}><LineChart model={chart} /></ChartFigure>
      <p className="mt-4 text-sm leading-relaxed text-ink-3">{C.form.crossingNote}</p>
      {result?.costTurnsNegativeAgain ? <p className="mt-2 text-sm leading-relaxed text-ink-2">{C.form.reversalNote}</p> : null}
      {result ? (
        <DetailDisclosure title={C.form.detailToggle} className="mt-6">
          <DetailFigures title={C.form.detailTitle} figures={[
            { label: C.form.currentPaymentLabel, value: moneyCell(result.currentPayment) },
            { label: C.form.newPaymentLabel, value: moneyCell(result.newPayment) },
            { label: C.form.monthlySavingLabel, value: moneyCell(result.monthlySaving) },
            { label: C.form.currentPaidLabel, value: moneyCell(result.horizon.currentPaid) },
            { label: C.form.newPaidLabel, value: moneyCell(result.horizon.newPaid) },
            { label: C.form.currentInterestLabel, value: moneyCell(result.horizon.currentInterest) },
            { label: C.form.newInterestLabel, value: moneyCell(result.horizon.newInterest) },
            { label: C.form.currentBalanceLabel, value: moneyCell(result.horizon.currentBalance) },
            { label: C.form.newBalanceLabel, value: moneyCell(result.horizon.newBalance) },
            { label: C.form.feesLabel, value: moneyCell(result.closingCosts) },
            { label: C.form.lifetimeLabel, value: moneyCell(result.lifetimeSaving) },
            { label: C.form.cashBreakEvenLabel, value: crossing(result.cashFlowBreakEvenMonths), prose: true },
            { label: C.form.termChangeLabel, value: months(result.termChangeMonths) },
          ]} />
        </DetailDisclosure>
      ) : null}
      <p className="mt-4 text-sm leading-relaxed text-ink-3">{C.form.assumptions}</p>
      <ExampleNoticeDetail className="mt-4" />
    </CalculatorCard>
  );
}
