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
import { computeFundFees } from "@/lib/calc/fund-fees";
import { FUND_FEES as C } from "@/content/calculators/fund-fees";

export function FundFeesCalculator() {
  const fields = useCalcFields({
    initial: C.form.defaultInitial,
    contribution: C.form.defaultContribution,
    months: C.form.defaultMonths,
    grossReturn: C.form.defaultGrossReturn,
    entryFee: C.form.defaultEntryFee,
    managementFee: C.form.defaultManagementFee,
    exitFee: C.form.defaultExitFee,
  });

  const initial = parseMoney(fields.values.initial);
  const contribution = parseMoney(fields.values.contribution);
  const months = parseDecimal(fields.values.months);
  const grossReturn = parseDecimal(fields.values.grossReturn);
  const entryFee = parseDecimal(fields.values.entryFee);
  const managementFee = parseDecimal(fields.values.managementFee);
  const exitFee = parseDecimal(fields.values.exitFee);

  const initialInvalid = initial === null || initial < 0;
  const contributionInvalid = contribution === null || contribution < 0;
  const monthsInvalid =
    months === null || months <= 0 || !Number.isInteger(months);
  const grossReturnInvalid = grossReturn === null || grossReturn <= -100;
  const entryFeeInvalid = entryFee === null || entryFee < 0 || entryFee > 100;
  const managementFeeInvalid =
    managementFee === null || managementFee < 0 || managementFee > 100;
  const exitFeeInvalid = exitFee === null || exitFee < 0 || exitFee > 100;

  const fieldsUsable =
    !initialInvalid &&
    !contributionInvalid &&
    !monthsInvalid &&
    !grossReturnInvalid &&
    !entryFeeInvalid &&
    !managementFeeInvalid &&
    !exitFeeInvalid;

  const result = fieldsUsable
    ? computeFundFees({
        initial,
        monthlyContribution: contribution,
        months,
        grossReturnPercent: grossReturn,
        entryFeePercent: entryFee,
        managementFeePercent: managementFee,
        exitFeePercent: exitFee,
      })
    : null;

  // Every field parses but nothing was paid in at all — the module's only
  // rejection on otherwise-valid input.
  const nothingInvested = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.planGroup}>
        <NumberField
          {...fields.bind("initial")}
          label={C.form.initialLabel}
          unit={C.form.initialUnit}
          help={C.form.initialHelp}
          error={C.form.initialInvalid}
          invalid={initialInvalid}
        />
        <NumberField
          {...fields.bind("contribution")}
          label={C.form.contributionLabel}
          unit={C.form.contributionUnit}
          help={C.form.contributionHelp}
          error={C.form.contributionInvalid}
          invalid={contributionInvalid}
        />
        <NumberField
          {...fields.bind("months")}
          label={C.form.monthsLabel}
          help={C.form.monthsHelp}
          error={C.form.monthsInvalid}
          invalid={monthsInvalid}
        />
        <NumberField
          {...fields.bind("grossReturn")}
          label={C.form.grossReturnLabel}
          unit={C.form.grossReturnUnit}
          help={C.form.grossReturnHelp}
          error={C.form.grossReturnInvalid}
          invalid={grossReturnInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.feeGroup} className="mt-8">
        <NumberField
          {...fields.bind("entryFee")}
          label={C.form.entryFeeLabel}
          unit={C.form.entryFeeUnit}
          help={C.form.entryFeeHelp}
          error={C.form.entryFeeInvalid}
          invalid={entryFeeInvalid}
        />
        <NumberField
          {...fields.bind("managementFee")}
          label={C.form.managementFeeLabel}
          unit={C.form.managementFeeUnit}
          help={C.form.managementFeeHelp}
          error={C.form.managementFeeInvalid}
          invalid={managementFeeInvalid}
        />
        <NumberField
          {...fields.bind("exitFee")}
          label={C.form.exitFeeLabel}
          unit={C.form.exitFeeUnit}
          help={C.form.exitFeeHelp}
          error={C.form.exitFeeInvalid}
          invalid={exitFeeInvalid}
        />
      </FieldGroup>

      {/* The share of PROFIT lost leads, because that is the number that
          turns "2% a year" into something worth acting on. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.profitLostLabel}
          value={
            result?.profitLostPercent == null
              ? null
              : formatPercent(result.profitLostPercent, 2)
          }
        />
        <ResultRow
          label={C.form.valueLostLabel}
          value={money(result?.valueLost)}
        />
        <ResultRow
          label={C.form.netValueLabel}
          value={money(result?.netValue)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.compareTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.grossValueLabel}
          value={money(result?.grossValue)}
        />
        <ResultRow
          label={C.form.contributedLabel}
          value={money(result?.totalContributed)}
        />
        <ResultRow
          label={C.form.netProfitLabel}
          value={money(result?.netProfit)}
        />
        <ResultRow
          label={C.form.grossProfitLabel}
          value={money(result?.grossProfit)}
        />
        <ResultRow
          label={C.form.valueLostPercentLabel}
          value={result ? formatPercent(result.valueLostPercent, 2) : null}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.managementFeesLabel}
          value={money(result?.totalManagementFees)}
        />
        <ResultRow
          label={C.form.entryFeesLabel}
          value={money(result?.totalEntryFees)}
        />
        <ResultRow
          label={C.form.exitFeeResultLabel}
          value={money(result?.exitFee)}
        />
        <ResultRow
          label={C.form.totalFeesLabel}
          value={money(result?.totalFees)}
        />
        <ResultRow
          label={C.form.netAnnualLabel}
          value={
            result ? formatPercent(result.netAnnualReturnPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.grossAnnualLabel}
          value={
            result ? formatPercent(result.grossAnnualReturnPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.dragLabel}
          value={
            result
              ? `${formatDecimal(result.annualDragPoints, 3)} ${C.form.pointsUnit}`
              : null
          }
        />
      </ResultGroup>

      {result !== null && result.profitLostPercent === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noProfitNotice}
        </p>
      ) : null}

      {nothingInvested ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.nothingInvestedNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
