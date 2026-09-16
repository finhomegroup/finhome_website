"use client";

import Link from "next/link";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { moneyCell, percentCell } from "@/lib/calc/table-cell";
import { analyseLoan } from "@/lib/calc/loan-analysis";
import { loanChartModel } from "@/lib/calc/charts/loan-chart";
import type { RepaymentMethod } from "@/lib/calc/loan";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { LOAN_ANALYSIS as C } from "@/content/calculators/loan-analysis";
import { LOAN } from "@/content/calculators/loan";
import { fill } from "@/lib/calc/charts/labels";

/**
 * Why the debt falls so slowly — and what any one month of it looks like.
 *
 * ORIGINAL ROW 6. Three things this page did not do before:
 *
 * 1. **It shares the mortgage's result, including the repayment method.**
 *    `analyseLoan` passes `method` straight to `computeLoan`, so trả góp đều
 *    and trả gốc đều mean exactly what they mean on `/cong-cu/vay-mua-nha/`
 *    and the two pages cannot report different schedules for one loan.
 * 2. **A reader can examine ANY month**, not the first twenty-four. The
 *    selected month drives the result rows, the chart window and the chart's
 *    own table together, so all three answer the same period.
 * 3. **It routes back to the mortgage tool honestly.** An ordinary link, with
 *    the plain statement that nothing typed here travels with it. No financial
 *    figure goes into a URL and no saved context is implied, because there is
 *    none.
 *
 * The live region keeps the eight-row cost-structure summary the page has
 * always led with; the examined month is its own `live={false}` group, because
 * it is a second view of the same schedule.
 */
export function LoanAnalysisCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
    method: C.form.defaultMethod,
    examine: C.form.defaultExamine,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  // A whole month count, so `parseCount` — docs §4.
  const examine = parseCount(fields.values.examine);
  const method = fields.values.method as RepaymentMethod;

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;

  const termMonths =
    term === null
      ? null
      : Math.round(fields.values.termUnit === "years" ? term * 12 : term);

  // Rejected on the TYPED value against the term, not clamped: a tool that
  // moved a typed 300 to 240 would answer a question nobody asked.
  const examineInvalid =
    examine === null ||
    examine < 1 ||
    termMonths === null ||
    examine > termMonths;

  const result =
    amountInvalid ||
    rateInvalid ||
    termInvalid ||
    examineInvalid ||
    termMonths === null
      ? null
      : analyseLoan({
          amount,
          annualRatePercent: rate,
          termMonths,
          method,
          selectedMonth: examine,
        });

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;
  const cash = (value: number | null | undefined) =>
    value === null || value === undefined ? null : moneyCell(value);

  /** "84 tháng (35,0% kỳ hạn)" — the month, and where it sits in the term. */
  const monthWithShare = (
    month: number | null | undefined,
    share: number | null | undefined,
  ) => {
    if (month === null || month === undefined) return null;
    const months = `${formatDecimal(month, 0)} ${C.form.monthsUnit}`;
    if (share === null || share === undefined) return months;
    return `${months} (${formatPercent(share, 1)} ${C.form.ofTerm})`;
  };

  // The crossover is absent only at rates no product carries, so this notice
  // reads as "check what you typed" rather than as a normal outcome.
  const noCrossover = result !== null && result.crossoverMonth === null;

  const selected = result?.selected ?? null;

  /**
   * The SAME adapter the mortgage page uses, in its window mode.
   *
   * No second chart model for this page: a stacked interest/principal column
   * with the balance over it is exactly what `loanChartModel` builds, and the
   * only difference row 6 needs is which 24 months it covers.
   */
  const chart = loanChartModel(
    result?.loan ?? null,
    "window",
    { ...CHART_UI.money, ...C.chart },
    { examineMonth: selected?.month },
  );

  const tableRows = result
    ? result.segments.map((segment) => [
        fill(C.table.quarterFormat, {
          from: formatDecimal(segment.fromMonth, 0),
          to: formatDecimal(segment.toMonth, 0),
        }),
        moneyCell(segment.interest),
        moneyCell(segment.principal),
        percentCell(segment.interestSharePercent, 1),
        moneyCell(segment.balance),
      ])
    : [];

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
        <SelectField
          {...fields.bind("termUnit")}
          label={C.form.termUnitLabel}
          options={[
            { value: "years", label: C.form.termUnitYears },
            { value: "months", label: C.form.termUnitMonths },
          ]}
        />
        {/* The same control, and the same two meanings, as the mortgage page.
            It changes the whole cost structure this page is about. */}
        <RadioGroupField
          {...fields.bind("method")}
          legend={C.form.methodLegend}
          help={C.form.methodHelp}
          options={[
            { value: "annuity", label: C.form.methodAnnuity },
            { value: "flatPrincipal", label: C.form.methodFlatPrincipal },
          ]}
        />
      </FieldGroup>

      {/* Any month in the term, in its own group: this is the page's second
          question and it deserves its own heading rather than sitting as a
          fifth loan input. */}
      <FieldGroup title={C.form.examineGroup} className="mt-8">
        <NumberField
          {...fields.bind("examine")}
          label={C.form.examineLabel}
          unit={C.form.examineUnit}
          help={C.form.examineHelp}
          error={C.form.examineInvalid}
          invalid={examineInvalid}
        />
      </FieldGroup>

      {/* Eight rows is at the top of what a live region should announce, but
          they are the summary a screen-reader user is here for. The examined
          month, the chart and the segment table all stay out of it. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.loan.monthlyPrincipalInterest)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.loan.totalInterest)}
        />
        <ResultRow
          label={C.form.ratioLabel}
          value={result ? formatPercent(result.interestToPrincipalPercent) : null}
        />
        <ResultRow
          label={C.form.firstShareLabel}
          value={
            result
              ? formatPercent(result.firstPaymentInterestSharePercent)
              : null
          }
        />
        <ResultRow
          label={C.form.lastShareLabel}
          value={
            result ? formatPercent(result.lastPaymentInterestSharePercent) : null
          }
        />
        <ResultRow
          label={C.form.crossoverLabel}
          value={
            result?.crossoverMonth == null
              ? null
              : `${formatDecimal(result.crossoverMonth, 0)} ${C.form.monthsUnit}`
          }
        />
        <ResultRow
          label={C.form.halfInterestLabel}
          value={monthWithShare(
            result?.halfInterestMonth,
            result?.halfInterestTermSharePercent,
          )}
        />
        <ResultRow
          label={C.form.halfPrincipalLabel}
          value={monthWithShare(
            result?.halfPrincipalMonth,
            result?.halfPrincipalTermSharePercent,
          )}
        />
      </ResultGroup>

      {noCrossover ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noCrossoverNotice}
        </p>
      ) : null}

      {/* THE EXAMINED MONTH. Its heading names the month three ways — over the
          term, and as a month of a year — because that is how a borrower
          holds it. `live={false}`: a second reading of the same schedule. */}
      <ResultGroup
        title={fill(C.form.examineTitle, {
          month: selected ? formatDecimal(selected.month, 0) : "—",
          year: selected ? formatDecimal(selected.year, 0) : "—",
          monthOfYear: selected ? formatDecimal(selected.monthOfYear, 0) : "—",
        })}
        className="mt-4"
        live={false}
      >
        <ResultRow
          label={C.form.examinePaymentLabel}
          value={money(selected?.payment)}
        />
        <ResultRow
          label={C.form.examineInterestLabel}
          value={money(selected?.interest)}
        />
        <ResultRow
          label={C.form.examinePrincipalLabel}
          value={money(selected?.principal)}
        />
        <ResultRow
          label={C.form.examineShareLabel}
          value={
            selected ? formatPercent(selected.interestSharePercent, 1) : null
          }
        />
        <ResultRow
          label={C.form.examineBalanceLabel}
          value={money(selected?.balance)}
        />
      </ResultGroup>

      {/* The chart follows the same selection. */}
      <ChartFigure model={chart}>
        <ColumnChart model={chart} />
      </ChartFigure>

      <DetailDisclosure
        title={C.form.examineGroup}
        hint={C.form.examineHelp}
        className="mt-8"
      >
        <DetailFigures
          title={C.form.examineTitle
            .replace("{month}", selected ? formatDecimal(selected.month, 0) : "—")
            .replace("{year}", selected ? formatDecimal(selected.year, 0) : "—")
            .replace(
              "{monthOfYear}",
              selected ? formatDecimal(selected.monthOfYear, 0) : "—",
            )}
          figures={[
            {
              label: C.form.examineCumulativeInterestLabel,
              value: cash(selected?.cumulativeInterest),
            },
            {
              label: C.form.examineCumulativePrincipalLabel,
              value: cash(selected?.cumulativePrincipal),
            },
            {
              // A share, not an amount.
              label: C.form.examineRepaidShareLabel,
              value:
                selected === null
                  ? null
                  : formatPercent(selected.principalRepaidSharePercent, 1),
            },
            {
              // A count of months, never scaled into a money unit.
              label: C.form.examineRemainingLabel,
              value:
                selected === null
                  ? null
                  : `${formatDecimal(selected.remainingMonths, 0)} ${C.form.monthsUnit}`,
            },
          ]}
        />

        {tableRows.length > 0 ? (
          <ResultTable
            className="mt-6"
            caption={C.table.caption}
            // Five columns are 346 px inside a 266 px panel even in the
            // COMPACT reading, and the scroll hint only shows in the exact
            // one — so on a phone this table overflowed with no affordance
            // saying it did. A block per quarter removes the overflow instead
            // of explaining it, and keeps the numeric columns full width.
            mobileCards
            columns={[
              { label: C.table.quarterColumn, nowrap: true },
              { label: C.table.interestColumn, numeric: true },
              { label: C.table.principalColumn, numeric: true },
              { label: C.table.shareColumn, numeric: true },
              { label: C.table.balanceColumn, numeric: true },
            ]}
            rows={tableRows}
          />
        ) : null}
      </DetailDisclosure>

      {/* The route back to the loan being planned, and the truth about it.
          `Link` normalises the trailing slash away in the rendered href. */}
      <div className="mt-6 rounded-2xl border border-ink-4/20 p-4">
        <p className="text-sm leading-relaxed">
          <Link
            href={LOAN.slug}
            // `-ink`: raw brand green is 3.02:1 on white, below the 4.5:1 this
            // normal-size link owes.
            className="font-medium text-brand-green-ink underline-offset-4 hover:underline"
          >
            {C.form.returnRouteLabel}
          </Link>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-3">
          {C.form.returnRouteNote}
        </p>
      </div>
    </CalculatorCard>
  );
}
