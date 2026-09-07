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
import { computeWacc } from "@/lib/calc/wacc";
import { WACC as C } from "@/content/calculators/wacc";

export function WaccCalculator() {
  const fields = useCalcFields({
    equityValue: C.form.defaultEquityValue,
    costOfEquity: C.form.defaultCostOfEquity,
    debtValue: C.form.defaultDebtValue,
    costOfDebt: C.form.defaultCostOfDebt,
    tax: C.form.defaultTax,
    preferredValue: C.form.defaultPreferredValue,
    costOfPreferred: C.form.defaultCostOfPreferred,
  });

  const equityValue = parseMoney(fields.values.equityValue);
  const costOfEquity = parseDecimal(fields.values.costOfEquity);
  const debtValue = parseMoney(fields.values.debtValue);
  const costOfDebt = parseDecimal(fields.values.costOfDebt);
  const tax = parseDecimal(fields.values.tax);
  const preferredValue = parseMoney(fields.values.preferredValue);
  const costOfPreferred = parseDecimal(fields.values.costOfPreferred);

  const equityValueInvalid = equityValue === null || equityValue < 0;
  const costOfEquityInvalid = costOfEquity === null;
  const debtValueInvalid = debtValue === null || debtValue < 0;
  const costOfDebtInvalid = costOfDebt === null;
  const taxInvalid = tax === null || tax < 0 || tax > 100;
  const preferredValueInvalid = preferredValue === null || preferredValue < 0;
  const costOfPreferredInvalid = costOfPreferred === null;

  const fieldsUsable =
    !equityValueInvalid &&
    !costOfEquityInvalid &&
    !debtValueInvalid &&
    !costOfDebtInvalid &&
    !taxInvalid &&
    !preferredValueInvalid &&
    !costOfPreferredInvalid;

  const result = fieldsUsable
    ? computeWacc({
        equityValue,
        costOfEquityPercent: costOfEquity,
        debtValue,
        costOfDebtPercent: costOfDebt,
        taxRatePercent: tax,
        preferredValue,
        costOfPreferredPercent: costOfPreferred,
      })
    : null;

  // Every field parses but the three values are all zero — no capital
  // structure to average over.
  const noCapital = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const points = (figure: number | undefined) =>
    figure === undefined
      ? null
      : `${formatDecimal(figure, 3)} ${C.form.pointsUnit}`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.equityGroup}>
        <NumberField
          {...fields.bind("equityValue")}
          label={C.form.equityValueLabel}
          unit={C.form.equityValueUnit}
          help={C.form.equityValueHelp}
          error={C.form.equityValueInvalid}
          invalid={equityValueInvalid}
        />
        <NumberField
          {...fields.bind("costOfEquity")}
          label={C.form.costOfEquityLabel}
          unit={C.form.costOfEquityUnit}
          help={C.form.costOfEquityHelp}
          error={C.form.costOfEquityInvalid}
          invalid={costOfEquityInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.debtGroup} className="mt-8">
        <NumberField
          {...fields.bind("debtValue")}
          label={C.form.debtValueLabel}
          unit={C.form.debtValueUnit}
          help={C.form.debtValueHelp}
          error={C.form.debtValueInvalid}
          invalid={debtValueInvalid}
        />
        <NumberField
          {...fields.bind("costOfDebt")}
          label={C.form.costOfDebtLabel}
          unit={C.form.costOfDebtUnit}
          help={C.form.costOfDebtHelp}
          error={C.form.costOfDebtInvalid}
          invalid={costOfDebtInvalid}
        />
        <NumberField
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.taxInvalid}
          invalid={taxInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.preferredGroup} className="mt-8">
        <NumberField
          {...fields.bind("preferredValue")}
          label={C.form.preferredValueLabel}
          unit={C.form.preferredValueUnit}
          help={C.form.preferredValueHelp}
          error={C.form.preferredValueInvalid}
          invalid={preferredValueInvalid}
        />
        <NumberField
          {...fields.bind("costOfPreferred")}
          label={C.form.costOfPreferredLabel}
          unit={C.form.costOfPreferredUnit}
          help={C.form.costOfPreferredHelp}
          error={C.form.costOfPreferredInvalid}
          invalid={costOfPreferredInvalid}
        />
      </FieldGroup>

      {/* WACC with the shielded debt cost beside it, so the one component
          that gets the deduction is visible in the headline. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.waccLabel}
          value={result ? formatPercent(result.waccPercent, 3) : null}
        />
        <ResultRow
          label={C.form.afterTaxDebtLabel}
          value={
            result
              ? formatPercent(result.afterTaxCostOfDebtPercent, 3)
              : null
          }
        />
        <ResultRow
          label={C.form.shieldLabel}
          value={points(result?.taxShieldPoints)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalCapitalLabel}
          value={money(result?.totalCapital)}
        />
        <ResultRow
          label={C.form.equityWeightLabel}
          value={result ? formatPercent(result.equityWeightPercent, 2) : null}
        />
        <ResultRow
          label={C.form.debtWeightLabel}
          value={result ? formatPercent(result.debtWeightPercent, 2) : null}
        />
        <ResultRow
          label={C.form.preferredWeightLabel}
          value={
            result ? formatPercent(result.preferredWeightPercent, 2) : null
          }
        />
        <ResultRow
          label={C.form.equityContributionLabel}
          value={points(result?.equityContributionPoints)}
        />
        <ResultRow
          label={C.form.debtContributionLabel}
          value={points(result?.debtContributionPoints)}
        />
        <ResultRow
          label={C.form.preferredContributionLabel}
          value={points(result?.preferredContributionPoints)}
        />
        <ResultRow
          label={C.form.beforeShieldLabel}
          value={
            result
              ? formatPercent(result.waccBeforeTaxShieldPercent, 3)
              : null
          }
        />
        <ResultRow
          label={C.form.debtToEquityLabel}
          value={
            result?.debtToEquity == null
              ? null
              : formatDecimal(result.debtToEquity, 4)
          }
        />
      </ResultGroup>

      {noCapital ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noCapitalNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
