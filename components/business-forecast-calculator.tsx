"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
  PLACEHOLDER,
} from "@/lib/calc/number";
import { computeForecast } from "@/lib/calc/forecast";
import { BUSINESS_FORECAST as C } from "@/content/calculators/business-forecast";

const F = C.form;
const T = F.table;

export function BusinessForecastCalculator() {
  const fields = useCalcFields(F.defaults);

  const revenue = parseMoney(fields.values.revenue);
  const growth = parseDecimal(fields.values.growth);
  const variable = parseDecimal(fields.values.variable);
  const fixed = parseMoney(fields.values.fixed);
  const fixedGrowth = parseDecimal(fields.values.fixedGrowth);
  const years = parseCount(fields.values.years);
  const baseYear = parseMoney(fields.values.baseYear);
  const tax = parseDecimal(fields.values.tax);

  const revenueInvalid = revenue === null || revenue < 0;
  const growthInvalid = growth === null || growth < -100;
  const variableInvalid = variable === null || variable < 0 || variable > 100;
  const fixedInvalid = fixed === null || fixed < 0;
  const fixedGrowthInvalid = fixedGrowth === null || fixedGrowth < -100;
  const yearsInvalid =
    years === null || !Number.isInteger(years) || years < 1 || years > 30;
  // The base year only labels the rows, but a fractional or wild year would
  // produce nonsense labels, so it is validated like any other field.
  const baseYearInvalid =
    baseYear === null ||
    !Number.isInteger(baseYear) ||
    baseYear < 1900 ||
    baseYear > 2200;
  const taxInvalid = tax === null || tax < 0 || tax > 100;

  const anyInvalid =
    revenueInvalid ||
    growthInvalid ||
    variableInvalid ||
    fixedInvalid ||
    fixedGrowthInvalid ||
    yearsInvalid ||
    baseYearInvalid ||
    taxInvalid;

  const result = anyInvalid
    ? null
    : computeForecast({
        baseRevenue: revenue,
        revenueGrowthPercent: growth,
        variableCostPercent: variable,
        baseFixedCost: fixed,
        fixedCostGrowthPercent: fixedGrowth,
        years,
        baseYear,
        taxPercent: tax,
      });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** Signed money, so a loss cannot be read as a profit. */
  const signedMoney = (figure: number) =>
    `${figure < 0 ? "−" : ""}${formatMoney(Math.abs(figure))} ₫`;

  const percentOrDash = (value: number | null | undefined) =>
    value === null || value === undefined ? PLACEHOLDER : formatPercent(value, 2);

  const rows = result
    ? result.years.map((row) => [
        String(row.year),
        `${formatMoney(row.revenue)} ₫`,
        `${formatMoney(row.variableCost)} ₫`,
        `${formatMoney(row.fixedCost)} ₫`,
        signedMoney(row.operatingProfit),
        percentOrDash(row.operatingMarginPercent),
        `${formatMoney(row.tax)} ₫`,
        signedMoney(row.profitAfterTax),
      ])
    : [];

  return (
    <CalculatorCard>
      <FieldGroup title={F.revenueGroup}>
        <NumberField
          {...fields.bind("revenue")}
          label={F.revenueLabel}
          unit={F.revenueUnit}
          help={F.revenueHelp}
          error={F.revenueInvalid}
          invalid={revenueInvalid}
        />
        <NumberField
          {...fields.bind("growth")}
          label={F.growthLabel}
          unit={F.growthUnit}
          help={F.growthHelp}
          error={F.growthInvalid}
          invalid={growthInvalid}
        />
      </FieldGroup>

      <FieldGroup title={F.costGroup} className="mt-8">
        <NumberField
          {...fields.bind("variable")}
          label={F.variableLabel}
          unit={F.variableUnit}
          help={F.variableHelp}
          error={F.variableInvalid}
          invalid={variableInvalid}
        />
        <NumberField
          {...fields.bind("fixed")}
          label={F.fixedLabel}
          unit={F.fixedUnit}
          help={F.fixedHelp}
          error={F.fixedInvalid}
          invalid={fixedInvalid}
        />
        <NumberField
          {...fields.bind("fixedGrowth")}
          label={F.fixedGrowthLabel}
          unit={F.fixedGrowthUnit}
          help={F.fixedGrowthHelp}
          error={F.fixedGrowthInvalid}
          invalid={fixedGrowthInvalid}
        />
      </FieldGroup>

      <FieldGroup title={F.horizonGroup} className="mt-8">
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={yearsInvalid}
        />
        <NumberField
          {...fields.bind("baseYear")}
          label={F.baseYearLabel}
          help={F.baseYearHelp}
          error={F.baseYearInvalid}
          invalid={baseYearInvalid}
        />
        <NumberField
          {...fields.bind("tax")}
          label={F.taxLabel}
          unit={F.taxUnit}
          help={F.taxHelp}
          error={F.taxInvalid}
          invalid={taxInvalid}
        />
      </FieldGroup>

      {/* The final year plus the margin move: the answer. The per-year table
          below is reference and stays out of the live region. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.finalRevenueLabel}
          value={money(result?.finalRevenue)}
        />
        <ResultRow
          label={F.finalProfitLabel}
          value={
            result === null ? null : signedMoney(result.finalOperatingProfit)
          }
        />
        <ResultRow
          label={F.finalMarginLabel}
          value={result === null ? null : percentOrDash(result.finalMarginPercent)}
        />
        <ResultRow
          label={F.marginChangeLabel}
          value={
            result === null || result.marginChangePoints === null
              ? null
              : `${result.marginChangePoints < 0 ? "−" : "+"}${formatDecimal(
                  Math.abs(result.marginChangePoints),
                  2,
                )} ${F.pointsUnit}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.totalsTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalRevenueLabel}
          value={money(result?.totalRevenue)}
        />
        <ResultRow label={F.totalCostLabel} value={money(result?.totalCost)} />
        <ResultRow
          label={F.totalProfitLabel}
          value={
            result === null ? null : signedMoney(result.totalOperatingProfit)
          }
        />
        <ResultRow
          label={F.totalAfterTaxLabel}
          value={
            result === null ? null : signedMoney(result.totalProfitAfterTax)
          }
        />
        <ResultRow
          label={F.cagrLabel}
          value={result === null ? null : percentOrDash(result.revenueCagrPercent)}
        />
        <ResultRow
          label={F.firstProfitableLabel}
          value={
            result === null
              ? null
              : result.firstProfitableYear === null
                ? F.neverProfitable
                : String(result.firstProfitableYear)
          }
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={T.caption}
          columns={[
            { label: T.yearColumn },
            { label: T.revenueColumn, numeric: true },
            { label: T.variableColumn, numeric: true },
            { label: T.fixedColumn, numeric: true },
            { label: T.profitColumn, numeric: true },
            { label: T.marginColumn, numeric: true },
            { label: T.taxColumn, numeric: true },
            { label: T.afterTaxColumn, numeric: true },
          ]}
          rows={rows}
        />
      ) : null}

      {result?.hasLossYear ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.lossNotice}
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
