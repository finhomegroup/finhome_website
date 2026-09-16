"use client";

import { useState } from "react";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { LOAN as C } from "@/content/calculators/loan";
import { fill } from "@/lib/calc/charts/labels";
import {
  loanChartModel,
  type LoanChartGranularity,
} from "@/lib/calc/charts/loan-chart";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  computeLoan,
  yearlySummary,
  type PmiMode,
  type RepaymentMethod,
} from "@/lib/calc/loan";

/**
 * The loan / mortgage calculator.
 *
 * Inputs are held as raw strings by `useCalcFields` and parsed at render time,
 * so a half-typed "2.000.000." survives in the field. Money fields use
 * `parseMoney` (where "." groups thousands) and rate fields use `parseDecimal`
 * (where "," is the decimal mark) — the two grammars are genuinely different
 * and mixing them turns 500.000 into 500.
 *
 * THREE THINGS CHANGED HERE, EACH FROM A FINDING.
 *
 * 1. **The monthly total is no longer a lie when an extra payment is set.**
 *    The live region now shows what the bank collects, what the borrower adds,
 *    and the sum — as three labelled lines — plus the final month, which is
 *    neither. `computeLoan` supplies all four; this component does no
 *    arithmetic.
 * 2. **PMI is out of the first form.** Four default-visible PMI fields on a
 *    page whose own copy says PMI does not apply to Vietnamese loans was the
 *    audit's clearest context defect. They now sit in a clearly-marked
 *    international panel inside the advanced disclosure, whose summary line
 *    states any setting that is actually moving the result.
 * 3. **The live region shrank from nine rows to four.** docs §4 calls a
 *    nine-row live group "the same failure mode a live table is", and §6 lists
 *    this page as the widest offender. The rows a borrower came for stay live;
 *    the rest moved to a `live={false}` group.
 *
 * The chart sits OUTSIDE every `ResultGroup`, like the schedule table, for the
 * same reason: it must not be re-announced on each keystroke.
 */
export function LoanCalculator() {
  const initial = {
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
    extra: C.form.defaultExtra,
    method: C.form.defaultMethod,
    tax: "0",
    insurance: "0",
    otherFee: "0",
    pmi: "0",
    price: "",
    pmiMode: C.form.defaultPmiMode,
  };
  const fields = useCalcFields(initial);
  const [granularity, setGranularity] = useState<LoanChartGranularity>("year");

  // "Still the worked example" is a plain comparison against the values the
  // form opened with — no extra state to drift out of step with the fields.
  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const extra = parseMoney(fields.values.extra);
  const tax = parseMoney(fields.values.tax);
  const insurance = parseMoney(fields.values.insurance);
  const otherFee = parseMoney(fields.values.otherFee);
  const pmi = parseDecimal(fields.values.pmi);
  const price = parseMoney(fields.values.price);

  const termMonths =
    term === null
      ? null
      : fields.values.termUnit === "years"
        ? Math.round(term * 12)
        : Math.round(term);

  // Per-field validity, so each field can show its own message rather than one
  // banner for the whole form.
  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;
  const extraInvalid = extra === null || extra < 0;
  const taxInvalid = tax === null || tax < 0;
  const insuranceInvalid = insurance === null || insurance < 0;
  const otherFeeInvalid = otherFee === null || otherFee < 0;
  const pmiInvalid = pmi === null || pmi < 0;

  const result =
    amountInvalid ||
    rateInvalid ||
    termInvalid ||
    extraInvalid ||
    taxInvalid ||
    insuranceInvalid ||
    otherFeeInvalid ||
    pmiInvalid ||
    termMonths === null
      ? null
      : computeLoan({
          amount,
          annualRatePercent: rate,
          termMonths,
          extraPerMonth: extra,
          method: fields.values.method as RepaymentMethod,
          propertyTaxPerYear: tax,
          insurancePerYear: insurance,
          otherFeePerYear: otherFee,
          pmiPercent: pmi,
          pmiMode: fields.values.pmiMode as PmiMode,
          propertyPrice: price ?? undefined,
        });

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;
  /**
   * The same figure as a RAW cell, for the expanded detail.
   *
   * `money()` above still formats the headline rows, where full đồng is the
   * answer the reader came for. The detail panel shows a dozen amounts in a
   * 266 px frame, so those go in unformatted and `DetailFigures` picks one
   * unit for the block — never by reformatting `money()`'s output.
   */
  const cash = (value: number | null | undefined) =>
    value === null || value === undefined ? null : moneyCell(value);
  const months = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${formatDecimal(value, 0)} ${C.form.monthsUnit}`;

  /**
   * The optional extra payment, disclosed on its own panel's summary line.
   *
   * A malformed entry counts as active: it is clearing the result, so the
   * reader has to be able to find it without opening the panel to guess.
   */
  const extraSettings: DisclosedSetting[] = [
    {
      key: "extra",
      label: C.form.extraLabel,
      value: money(extra ?? 0) ?? "",
      active: extraInvalid || (extra ?? 0) > 0,
    },
  ];

  // `active` is decided here, with the parsed value the calculator itself
  // uses — `disclosed-settings.ts` deliberately never guesses from a string.
  const advancedSettings: DisclosedSetting[] = [
    {
      key: "tax",
      label: C.form.taxLabel,
      value: money(tax ?? 0) ?? "",
      active: (tax ?? 0) > 0,
    },
    {
      key: "insurance",
      label: C.form.insuranceLabel,
      value: money(insurance ?? 0) ?? "",
      active: (insurance ?? 0) > 0,
    },
    {
      key: "otherFee",
      label: C.form.otherFeeLabel,
      value: money(otherFee ?? 0) ?? "",
      active: (otherFee ?? 0) > 0,
    },
    {
      key: "pmi",
      label: C.form.pmiLabel,
      value: `${formatDecimal(pmi ?? 0)}%`,
      active: (pmi ?? 0) > 0,
    },
  ];

  const chart = loanChartModel(result, granularity, {
    ...CHART_UI.money,
    ...C.chart,
  });

  // Typed cells, so the year table reads in one stated unit ("Số tiền: triệu
  // đồng" → 166,1 / 40,2 / 1.959,8) with the exact đồng figures one checkbox
  // away. The year is a `countCell`: a period is never scaled to a money unit.
  const tableRows = result
    ? yearlySummary(result.schedule).map((year) => [
        countCell(year.year),
        moneyCell(year.interest),
        moneyCell(year.principal),
        moneyCell(year.balance),
      ])
    : [];

  return (
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

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
        {/* A Vietnamese control, not an advanced one: both structures are on
            offer here and they produce materially different first payments. */}
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

      {/*
        ORIGINAL ROW 0: the first screen is số tiền vay, lãi suất, kỳ hạn and
        cách trả nợ. Paying extra is optional, so it sits behind its own
        disclosure rather than in the entry form.

        It is a SEPARATE panel from the costs/PMI one below on purpose: an
        extra payment is the borrower's own decision about this loan, not a
        cost the property carries, and putting it next to a US mortgage
        insurance rate would bury it.

        The field is never unmounted — `useCalcFields` keeps every key — so
        closing the panel does not reset the amount, and `AdvancedFields`
        forces itself open while the amount is moving the result.
      */}
      <AdvancedFields
        title={C.form.extraPanelTitle}
        settings={extraSettings}
        emptySummary={C.form.extraPanelSummary}
        className="mt-8"
      >
        <NumberField
          {...fields.bind("extra")}
          label={C.form.extraLabel}
          unit={C.form.extraUnit}
          help={C.form.extraHelp}
          error={C.form.extraInvalid}
          invalid={extraInvalid}
        />
      </AdvancedFields>

      <AdvancedFields
        title={C.form.advancedTitle}
        settings={advancedSettings}
        className="mt-8"
      >
        <NumberField
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.costInvalid}
          invalid={taxInvalid}
        />
        <NumberField
          {...fields.bind("insurance")}
          label={C.form.insuranceLabel}
          unit={C.form.insuranceUnit}
          help={C.form.insuranceHelp}
          error={C.form.costInvalid}
          invalid={insuranceInvalid}
        />
        <NumberField
          {...fields.bind("otherFee")}
          label={C.form.otherFeeLabel}
          unit={C.form.otherFeeUnit}
          help={C.form.otherFeeHelp}
          error={C.form.costInvalid}
          invalid={otherFeeInvalid}
        />

        {/* The international sub-panel. Marked as such in its own heading, so
            a Vietnamese borrower can see it does not apply before reading
            four fields. */}
        <FieldGroup title={C.pmiGroupTitle} className="mt-6">
          <p className="text-sm leading-relaxed text-ink-3">{C.pmiNotice}</p>
          <NumberField
            {...fields.bind("pmi")}
            label={C.form.pmiLabel}
            unit={C.form.pmiUnit}
            help={C.form.pmiHelp}
            error={C.form.pmiInvalid}
            invalid={pmiInvalid}
          />
          <NumberField
            {...fields.bind("price")}
            label={C.form.priceLabel}
            unit={C.form.priceUnit}
            help={C.form.priceHelp}
          />
          <RadioGroupField
            {...fields.bind("pmiMode")}
            legend={C.form.pmiModeLegend}
            options={[
              { value: "until80", label: C.form.pmiModeUntil80 },
              { value: "life", label: C.form.pmiModeLife },
            ]}
          />
        </FieldGroup>
      </AdvancedFields>

      {/*
        THE ANSWER. Three or four rows, and the total is ALWAYS one of them.
        The browser check found `—` against both the extra and the total at the
        defaults, because a `ResultRow` with a null value still renders its
        label: the total was known (17.356.465 ₫) and shown as a dash.

        So the extra row is only MOUNTED when there is an extra payment, and
        the total always carries a value. When the loan clears inside the first
        month there is no full month to report, so the total switches to the
        one real payment rather than an invented one.
      */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyPaymentLabel}
          value={money(result?.monthlyPayment)}
        />
        {result === null || result.monthlyExtra > 0 ? (
          <ResultRow
            label={C.form.extraRowLabel}
            value={money(result?.monthlyExtra)}
          />
        ) : null}
        <ResultRow
          label={
            result && !result.hasFullMonths
              ? C.form.singlePayoffLabel
              : C.form.plannedOutflowLabel
          }
          value={money(
            result === null
              ? null
              : result.hasFullMonths
                ? result.monthlyPlannedOutflow
                : result.finalMonthOutflow,
          )}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
      </ResultGroup>

      {result && !result.hasFullMonths ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.singleMonthNotice}
        </p>
      ) : null}

      {/* The saving from paying extra stays in the primary flow — it is why
          someone typed an extra payment — with its fee caveat beside it. */}
      {result?.interestSaving != null ? (
        <>
          <ResultGroup
            title={C.form.extraResultTitle}
            className="mt-4"
            live={false}
          >
            <ResultRow
              label={C.form.interestSavingLabel}
              value={money(result.interestSaving)}
            />
            <ResultRow
              label={C.form.monthsSavedLabel}
              value={months(result.monthsSaved)}
            />
          </ResultGroup>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            {C.form.prepaymentFeeNotice}
          </p>
        </>
      ) : null}

      {/* THE CHART, immediately after the answer and BEFORE the detail ledger
          and the year table. It was previously below both, which put it
          4030 px down a 390 px viewport. */}
      <RadioGroupField
        value={granularity}
        onValueChange={(next) => setGranularity(next as LoanChartGranularity)}
        legend={C.chart.granularityLegend}
        help={C.chart.granularityHelp}
        className="mt-8"
        options={[
          { value: "year", label: C.chart.granularityYear },
          { value: "firstMonths", label: C.chart.granularityMonths },
        ]}
      />

      <ChartFigure model={chart}>
        <ColumnChart model={chart} />
      </ChartFigure>

      {/* EVERYTHING ELSE, collapsed. */}
      <DetailDisclosure
        title={C.form.detailTitle}
        hint={C.form.detailHint}
        className="mt-8"
      >
        <DetailFigures
          title={C.form.breakdownTitle}
          figures={[
            {
              label: C.form.principalInterestLabel,
              value: cash(result?.monthlyPrincipalInterest),
            },
            { label: C.form.escrowLabel, value: cash(result?.monthlyEscrow) },
            { label: C.form.pmiMonthlyLabel, value: cash(result?.monthlyPmi) },
          ]}
        />

        <DetailFigures
          title={C.form.scheduleTitle}
          className="mt-4"
          figures={[
            {
              // A term, not an amount. It keeps "tháng" and is never scaled.
              label: C.form.termResultLabel,
              value: months(result?.months),
            },
            {
              label: fill(C.form.firstYearLabel, {
                n: result ? result.firstYearMonths : 12,
              }),
              value: cash(result?.firstYearOutflow),
            },
            {
              label: C.form.annualisedLabel,
              value: cash(result?.annualisedPlannedOutflow),
            },
            {
              label: result
                ? fill(C.form.finalMonthLabel, { n: result.finalMonthPeriod })
                : fill(C.form.finalMonthLabel, { n: "—" }),
              value: cash(result?.finalMonthOutflow),
            },
            {
              label: C.form.actualFinalLabel,
              value: cash(result?.actualFinalPrincipalInterest),
            },
            {
              label: C.form.referenceFinalLabel,
              value: cash(result?.referenceFinalInstalment),
            },
            {
              label: C.form.totalPaymentLabel,
              value: cash(result?.totalPayment),
            },
            {
              // A rate, not an amount.
              label: C.form.mortgageConstantLabel,
              value: result
                ? `${formatDecimal(result.mortgageConstant * 100)}%`
                : null,
            },
          ]}
        />

        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.firstYearHelp}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.finalMonthHelp}
        </p>

        {tableRows.length > 0 ? (
          <ResultTable
            className="mt-6"
            caption={C.table.caption}
            columns={[
              { label: C.table.yearColumn, numeric: true, nowrap: true },
              { label: C.table.interestColumn, numeric: true },
              { label: C.table.principalColumn, numeric: true },
              { label: C.table.balanceColumn, numeric: true },
            ]}
            rows={tableRows}
          />
        ) : null}
      </DetailDisclosure>
      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />

    </CalculatorCard>
  );
}
