"use client";

import Link from "next/link";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
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
 * The live region is the EXAMINED MONTH: its interest share as the one main
 * answer, the interest and principal amounts it splits into, and the instalment
 * they sum to. The whole-loan structure is context for that, so it sits in the
 * labelled disclosure.
 */
/*
 * CSV row 11 ("Hai cột"): one result region, and the month the form ends by
 * asking about is what it leads with. A browser pass at 390 px found the eight
 * whole-loan rows ahead of it, which made the page answer a question it had not
 * been asked; those eight moved into the disclosure unchanged. The quarter
 * table's three-sentence introduction left the page's entry copy (where it
 * explained a table four screens down, ahead of the chart) and now sits
 * directly above that table. Docs §8.
 */
const FORM_ID = "phan-tich-khoan-vay-nhap";
const RESULT_ID = "phan-tich-khoan-vay-ket-qua";

export function LoanAnalysisCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. `examine` is a count and the two selects
  // are lists; none of them format.
  const fields = useCalcFields(
    {
      amount: C.form.defaultAmount,
      rate: C.form.defaultRate,
      term: C.form.defaultTerm,
      termUnit: C.form.defaultTermUnit,
      method: C.form.defaultMethod,
      examine: C.form.defaultExamine,
    },
    { amount: "money", rate: "rate", term: "rate" },
  );

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

  /*
   * The route back to the loan being planned, and the truth about it. It is
   * this page's most specific next step, so it goes in the layout's next-step
   * slot ahead of the shared library block rather than below the whole tool.
   * `Link` normalises the trailing slash away in the rendered href.
   */
  const returnRoute = (
    <div className="rounded-2xl border border-ink-4/20 p-4">
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
  );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
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
              {/* The same control, and the same two meanings, as the mortgage
                  page. It changes the whole cost structure this page is
                  about. */}
              <RadioGroupField
                {...fields.bind("method")}
                legend={C.form.methodLegend}
                help={C.form.methodHelp}
                options={[
                  { value: "annuity", label: C.form.methodAnnuity },
                  {
                    value: "flatPrincipal",
                    label: C.form.methodFlatPrincipal,
                  },
                ]}
              />
            </FieldGroup>

            {/* Any month in the term, in its own group: this is the page's
                second question and it deserves its own heading rather than
                sitting as a fifth loan input. */}
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={
              amountInvalid || rateInvalid || termInvalid || examineInvalid
            }
            // Measured at 1440×1000 with the examined-month field focused: the
            // first result row sat at y −283,5, the furthest off screen of the
            // six long forms in this repair. The restatement is the EMPHASISED
            // row — the interest share of the examined month — through the same
            // `formatPercent` call that row makes, and the month is named in
            // the label because the group heading that resolves "tháng đó" is
            // not on screen when the block is pinned. `selected` is null on an
            // unusable form, so the block shows its own placeholder.
            sticky
            answer={{
              label: fill(C.form.pinnedShareLabel, {
                month: selected ? formatDecimal(selected.month, 0) : "—",
              }),
              value: selected
                ? formatPercent(selected.interestSharePercent, 1)
                : null,
            }}
          />
        }
        primary={
          /* THE EXAMINED MONTH IS THE ANSWER, and it is the live group.
             A browser pass at 390 px found eight whole-loan rows leading the
             result, so the question the form ends with — what does month 152
             look like — was the ninth thing on the page. The month's own split
             leads now, with the share it answers emphasised and the two amounts
             it is made of directly under it; the whole-loan structure moved
             into the labelled disclosure below, unchanged. */
          <ResultGroup
            title={fill(C.form.examineTitle, {
              month: selected ? formatDecimal(selected.month, 0) : "—",
              year: selected ? formatDecimal(selected.year, 0) : "—",
              monthOfYear: selected
                ? formatDecimal(selected.monthOfYear, 0)
                : "—",
            })}
            anchorId={RESULT_ID}
          >
            <ResultRow
              label={C.form.examineShareLabel}
              value={
                selected ? formatPercent(selected.interestSharePercent, 1) : null
              }
              emphasis
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
              label={C.form.examinePaymentLabel}
              value={money(selected?.payment)}
            />
          </ResultGroup>
        }
        chart={
          /* The chart follows the same selection. Nothing explains it ahead of
             time any more: the quarter table's introduction moved down to the
             table it describes. */
          <ChartFigure model={chart}>
            <ColumnChart model={chart} />
          </ChartFigure>
        }
        actions={actions}
        nextSteps={
          <>
            {returnRoute}
            {nextSteps}
          </>
        }
        detail={
          <DetailDisclosure
            title={C.form.detailToggle}
            hint={C.form.detailHint}
          >
            {/* THE WHOLE-LOAN STRUCTURE, moved here from the live group. Same
                eight figures, same formatters, no calculation changed — they
                are context for the month above, not the answer to it. */}
            <DetailFigures
              title={C.form.resultTitle}
              figures={[
                {
                  label: C.form.monthlyLabel,
                  value: cash(result?.loan.monthlyPrincipalInterest),
                },
                {
                  label: C.form.totalInterestLabel,
                  value: cash(result?.loan.totalInterest),
                },
                {
                  label: C.form.ratioLabel,
                  value: result
                    ? formatPercent(result.interestToPrincipalPercent)
                    : null,
                },
                {
                  label: C.form.firstShareLabel,
                  value: result
                    ? formatPercent(result.firstPaymentInterestSharePercent)
                    : null,
                },
                {
                  label: C.form.lastShareLabel,
                  value: result
                    ? formatPercent(result.lastPaymentInterestSharePercent)
                    : null,
                },
                {
                  label: C.form.crossoverLabel,
                  value:
                    result?.crossoverMonth == null
                      ? null
                      : `${formatDecimal(result.crossoverMonth, 0)} ${C.form.monthsUnit}`,
                },
                {
                  label: C.form.halfInterestLabel,
                  // Prose: "84 tháng (35,0% kỳ hạn)" is a phrase, and figure
                  // treatment would make it `shrink-0` at display size.
                  value: monthWithShare(
                    result?.halfInterestMonth,
                    result?.halfInterestTermSharePercent,
                  ),
                  prose: true,
                },
                {
                  label: C.form.halfPrincipalLabel,
                  value: monthWithShare(
                    result?.halfPrincipalMonth,
                    result?.halfPrincipalTermSharePercent,
                  ),
                  prose: true,
                },
              ]}
            />

            {noCrossover ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noCrossoverNotice}
              </p>
            ) : null}

            <DetailFigures
              className="mt-6"
              title={fill(C.form.examineTitle, {
                month: selected ? formatDecimal(selected.month, 0) : "—",
                year: selected ? formatDecimal(selected.year, 0) : "—",
                monthOfYear: selected
                  ? formatDecimal(selected.monthOfYear, 0)
                  : "—",
              })}
              figures={[
                {
                  label: C.form.examineBalanceLabel,
                  value: cash(selected?.balance),
                },
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
              <>
                {/* The four-quarter reading, beside the table it is about. It
                    used to be the page's entry copy, three sentences describing
                    a table several screens further down and ahead of the
                    chart. */}
                <p className="mt-6 text-sm leading-relaxed text-ink-3">
                  {C.table.intro}
                </p>
                <ResultTable
                  className="mt-4"
                  caption={C.table.caption}
                  // Five columns are 346 px inside a 266 px panel even in the
                  // COMPACT reading, and the scroll hint only shows in the
                  // exact one — so on a phone this table overflowed with no
                  // affordance saying it did. A block per quarter removes the
                  // overflow instead of explaining it, and keeps the numeric
                  // columns full width.
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
              </>
            ) : null}
          </DetailDisclosure>
        }
      />
    </CalculatorCard>
  );
}
