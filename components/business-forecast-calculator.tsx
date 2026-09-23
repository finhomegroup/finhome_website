"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { ResultCta } from "@/components/calc/result-cta";
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

/**
 * ROW 66: "Đưa kết quả dự phóng cạnh đầu vào; nhãn giả định tăng trưởng/biên
 * lợi nhuận nhìn thấy cùng kết luận", at "Theo nhóm + kết quả".
 *
 * WHAT CHANGED:
 *
 * 1. `CalculatorLayout columns="split"` with `wide` on the route, so the final
 *    year sits beside the three input groups instead of 2.560 px below the
 *    first field on a phone-width page.
 * 2. `assumptionLine` renders the ENTERED growth, variable-cost, fixed-cost
 *    growth and tax figures directly under the conclusion. At a wide width the
 *    fields are in the other column: a widening margin read without them looks
 *    like a finding rather than an arithmetic consequence of the inputs.
 * 3. The eight-column per-year table and the loss caveat moved to the
 *    full-width band. The period totals stay in the result column, because
 *    "no profitable year in the horizon" is a conclusion and not reference.
 *
 * Untouched: every field, default and bound (including the 17% rate and the
 * reason recorded in the content file), the signed rendering that keeps a loss
 * a loss, `neverProfitable`, `lossNotice`, and the per-year figures.
 */
const FORM_ID = "du-bao-kinh-doanh-nhap";
const RESULT_ID = "du-bao-kinh-doanh-ket-qua";

export function BusinessForecastCalculator() {
  const fields = useCalcFields(F.defaults);

  const revenue = parseMoney(fields.values.revenue);
  const growth = parseDecimal(fields.values.growth);
  const variable = parseDecimal(fields.values.variable);
  const fixed = parseMoney(fields.values.fixed);
  const fixedGrowth = parseDecimal(fields.values.fixedGrowth);
  const years = parseCount(fields.values.years);
  const baseYear = parseCount(fields.values.baseYear);
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

  /**
   * THE one main answer, formatted once — the emphasised row and the pinned
   * CTA read the same string, and it keeps its sign in both places.
   */
  const profitAnswer =
    result === null ? null : signedMoney(result.finalOperatingProfit);

  /** A rate with its direction stated, for the assumption line. */
  const signedRate = (value: number) =>
    `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatDecimal(
      Math.abs(value),
      2,
    )}`;

  /**
   * ROW 66's second half: the assumptions, from the fields as entered.
   *
   * Built only when the forecast itself is usable, so the line can never
   * describe a scenario the page is refusing to compute.
   */
  const assumptions =
    result === null ||
    growth === null ||
    variable === null ||
    fixedGrowth === null ||
    tax === null
      ? null
      : F.assumptionLine
          .replace("{growth}", signedRate(growth))
          .replace("{variable}", formatDecimal(variable, 2))
          .replace("{fixedGrowth}", signedRate(fixedGrowth))
          .replace("{tax}", formatDecimal(tax, 2));

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

  const form = (
    <>
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
    </>
  );

  const primary = (
    <>
      {/* The final year plus the margin move: the answer. The per-year table
          is reference and sits in the full-width band, out of the live
          region. ROW 66 makes the final operating profit the headline — it is
          the figure the margin trend is about, and it is signed. */}
      <ResultGroup title={F.resultTitle} className="mt-8" anchorId={RESULT_ID}>
        <ResultRow
          label={F.finalProfitLabel}
          value={profitAnswer}
          emphasis
        />
        <ResultRow
          label={F.finalRevenueLabel}
          value={money(result?.finalRevenue)}
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

      {/* ROW 66: the assumptions, beside the conclusion rather than only in
          the form column. Not inside the live region — it is context that
          would otherwise re-announce on every keystroke. */}
      {assumptions === null ? null : (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">{assumptions}</p>
      )}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}

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
    </>
  );

  const detail = (
    <>
      {rows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={T.caption}
          /*
           * Eight columns, so cards below `md` — docs §3's rule is five
           * columns up, and this table was carrying its debt in
           * `components/calc/wide-table-pending.mjs` until now.
           *
           * THE RECORDED REASON FOR DEFERRING IT DOES NOT HOLD, and it is
           * worth saying why rather than just deleting the line. The reason
           * given was that "nine forecast periods are read ACROSS a row,
           * which a per-row card block breaks up". The periods are the ROWS
           * here — one per forecast year — and the columns are that year's
           * quantities. So a card is one year's whole P&L under its own
           * heading, which is exactly how this table is read; the comparison
           * that runs across periods is the margin trend, and that is already
           * a headline row above, not something a reader scans sideways in
           * the table. The pivot table's entry, which this one was said to
           * share a shape with, is genuinely different: there the columns ARE
           * the levels being compared.
           */
          mobileCards
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
    </>
  );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={form}
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            // Eight inputs across three groups; the tax rate at the bottom
            // moves the after-tax total this block keeps on screen.
            sticky
            answer={{ label: F.finalProfitLabel, value: profitAnswer }}
          />
        }
        primary={primary}
        // No chart on this tool; the per-year table is the figure and it is
        // eight columns wide, so it belongs in the full-width band.
        detail={rows.length > 0 || result?.hasLossYear ? detail : null}
      />
    </CalculatorCard>
  );
}
