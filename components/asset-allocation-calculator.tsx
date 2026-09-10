"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  analyseAllocation,
  ASSET_CLASSES,
  REBALANCE_BAND_POINTS,
  type AssetAllocationInput,
  type AssetClass,
  type RiskTolerance,
} from "@/lib/calc/asset-allocation";
import { ASSET_ALLOCATION as C } from "@/content/calculators/asset-allocation";

const F = C.form;
const T = F.table;

const RISK_OPTIONS: readonly { value: RiskTolerance; label: string }[] = [
  { value: "conservative", label: F.riskOptions.conservative },
  { value: "moderate", label: F.riskOptions.moderate },
  { value: "aggressive", label: F.riskOptions.aggressive },
];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

/** A signed trade, so a sell reads as one. */
function signedUsd(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatMoney(Math.abs(value))} USD`;
}

/** Drift is in percentage points, not percent — see the module docstring. */
function points(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatDecimal(Math.abs(value), 1)}`;
}

export function AssetAllocationCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const age = parseCount(v.age);
  const equityHolding = parseMoney(v.equityHolding);
  const bondHolding = parseMoney(v.bondHolding);
  const cashHolding = parseMoney(v.cashHolding);
  const equityReturn = parseDecimal(v.equityReturn);
  const bondReturn = parseDecimal(v.bondReturn);
  const cashReturn = parseDecimal(v.cashReturn);
  const equitySigma = parseDecimal(v.equitySigma);
  const bondSigma = parseDecimal(v.bondSigma);
  const correlation = parseDecimal(v.correlation);

  const badMoney = (value: number | null) => value === null || value < 0;
  const badReturn = (value: number | null) =>
    value === null || value < -100 || value > 100;
  const badSigma = (value: number | null) =>
    value === null || value < 0 || value > 100;

  const invalid = {
    age: age === null || age > 120,
    equityHolding: badMoney(equityHolding),
    bondHolding: badMoney(bondHolding),
    cashHolding: badMoney(cashHolding),
    equityReturn: badReturn(equityReturn),
    bondReturn: badReturn(bondReturn),
    cashReturn: badReturn(cashReturn),
    equitySigma: badSigma(equitySigma),
    bondSigma: badSigma(bondSigma),
    correlation:
      correlation === null || correlation < -1 || correlation > 1,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: AssetAllocationInput | null = anyInvalid
    ? null
    : {
        age: age!,
        riskTolerance: v.risk as RiskTolerance,
        holdings: {
          equity: equityHolding!,
          bond: bondHolding!,
          cash: cashHolding!,
        },
        returns: {
          equity: equityReturn!,
          bond: bondReturn!,
          cash: cashReturn!,
        },
        equitySigmaPercent: equitySigma!,
        bondSigmaPercent: bondSigma!,
        equityBondCorrelation: correlation!,
      };

  const result = input === null ? null : analyseAllocation(input);

  const rows =
    result === null
      ? []
      : ASSET_CLASSES.map((key: AssetClass) => [
          T.names[key],
          formatPercent(result.target[key], 0),
          result.currentWeights === null
            ? null
            : formatPercent(result.currentWeights[key], 1),
          result.driftPoints === null ? null : points(result.driftPoints[key]),
          input === null ? null : usd(input.holdings[key]),
          result.trades === null ? null : signedUsd(result.trades[key]),
        ]);

  return (
    <CalculatorCard>
      <FieldGroup title={F.profileGroup}>
        <NumberField
          {...fields.bind("age")}
          label={F.ageLabel}
          unit={F.ageUnit}
          help={F.ageHelp}
          error={F.ageInvalid}
          invalid={invalid.age}
        />
        <RadioGroupField
          {...fields.bind("risk")}
          legend={F.riskLabel}
          help={F.riskHelp}
          options={RISK_OPTIONS}
        />
      </FieldGroup>

      <FieldGroup title={F.holdingsGroup} className="mt-8">
        <NumberField
          {...fields.bind("equityHolding")}
          label={F.equityHoldingLabel}
          unit={F.holdingUnit}
          help={F.equityHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.equityHolding}
        />
        <NumberField
          {...fields.bind("bondHolding")}
          label={F.bondHoldingLabel}
          unit={F.holdingUnit}
          help={F.bondHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.bondHolding}
        />
        <NumberField
          {...fields.bind("cashHolding")}
          label={F.cashHoldingLabel}
          unit={F.holdingUnit}
          help={F.cashHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.cashHolding}
        />
      </FieldGroup>

      <FieldGroup title={F.assumptionGroup} className="mt-8">
        <NumberField
          {...fields.bind("equityReturn")}
          label={F.equityReturnLabel}
          unit={F.returnUnit}
          help={F.equityReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.equityReturn}
        />
        <NumberField
          {...fields.bind("bondReturn")}
          label={F.bondReturnLabel}
          unit={F.returnUnit}
          help={F.bondReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.bondReturn}
        />
        <NumberField
          {...fields.bind("cashReturn")}
          label={F.cashReturnLabel}
          unit={F.returnUnit}
          help={F.cashReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.cashReturn}
        />
        <NumberField
          {...fields.bind("equitySigma")}
          label={F.equitySigmaLabel}
          unit={F.sigmaUnit}
          help={F.equitySigmaHelp}
          error={F.sigmaInvalid}
          invalid={invalid.equitySigma}
        />
        <NumberField
          {...fields.bind("bondSigma")}
          label={F.bondSigmaLabel}
          unit={F.sigmaUnit}
          help={F.bondSigmaHelp}
          error={F.sigmaInvalid}
          invalid={invalid.bondSigma}
        />
        <NumberField
          {...fields.bind("correlation")}
          label={F.correlationLabel}
          help={F.correlationHelp}
          error={F.correlationInvalid}
          invalid={invalid.correlation}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.maxDriftLabel}
          value={
            result === null || result.maxDriftPoints === null
              ? null
              : `${formatDecimal(result.maxDriftPoints, 1)} ${F.pointsUnit}`
          }
        />
        <ResultRow
          label={F.rebalanceLabel}
          value={
            result === null || result.maxDriftPoints === null
              ? null
              : result.rebalanceDue
                ? F.rebalanceYes
                : F.rebalanceNo
          }
        />
        <ResultRow
          label={F.targetReturnLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.expectedReturnPercent, 2)
          }
        />
        <ResultRow
          label={F.targetSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.standardDeviationPercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.riskTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.averageSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.weightedAverageSigmaPercent, 2)
          }
        />
        <ResultRow
          label={F.actualSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.standardDeviationPercent, 2)
          }
        />
        <ResultRow
          label={F.benefitLabel}
          value={
            result === null
              ? null
              : `${formatDecimal(
                  result.targetStats.diversificationBenefitPoints,
                  2,
                )} ${F.pointsUnit}`
          }
        />
        <ResultRow
          label={F.ratioLabel}
          value={
            result === null || result.targetStats.returnPerRiskUnit === null
              ? null
              : formatDecimal(result.targetStats.returnPerRiskUnit, 3)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.currentTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalLabel}
          value={result === null ? null : usd(result.totalValue)}
        />
        <ResultRow
          label={F.currentReturnLabel}
          value={
            result === null || result.currentStats === null
              ? null
              : formatPercent(result.currentStats.expectedReturnPercent, 2)
          }
        />
        <ResultRow
          label={F.currentSigmaLabel}
          value={
            result === null || result.currentStats === null
              ? null
              : formatPercent(result.currentStats.standardDeviationPercent, 2)
          }
        />
        <ResultRow
          label={F.currentRatioLabel}
          value={
            result === null ||
            result.currentStats === null ||
            result.currentStats.returnPerRiskUnit === null
              ? null
              : formatDecimal(result.currentStats.returnPerRiskUnit, 3)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.ruleTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.equityRuleLabel}
          value={
            result === null || age === null
              ? null
              : `${result.rule.equityBase} − ${age} = ${formatPercent(
                  result.target.equity,
                  0,
                )}`
          }
        />
        <ResultRow
          label={F.cashRuleLabel}
          value={result === null ? null : formatPercent(result.rule.cashPercent, 0)}
        />
        <ResultRow
          label={F.bandLabel}
          value={`${REBALANCE_BAND_POINTS} ${F.pointsUnit}`}
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.classColumn },
              { label: T.targetColumn, numeric: true },
              { label: T.currentColumn, numeric: true },
              { label: T.driftColumn, numeric: true },
              { label: T.holdingColumn, numeric: true },
              { label: T.tradeColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null && result.currentWeights === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.emptyNotice}
        </p>
      ) : result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.rebalanceDue ? F.rebalanceNotice : F.inBandNotice}
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
