"use client";

import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { moneyCell, percentCell } from "@/lib/calc/table-cell";
import {
  MAX_GRACE_LOAN_MONTHS,
  computeGraceLoan,
} from "@/lib/calc/grace-loan";
import {
  gracePaymentBarsModel,
  graceBalanceLineModel,
} from "@/lib/calc/charts/grace-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { INTEREST_ONLY as C } from "@/content/calculators/interest-only";

/**
 * ÂN HẠN GỐC, with a rate reset, from one schedule.
 *
 * ORIGINAL ROW 14. The page used to model an interest-only phase at ONE rate,
 * which meant a reader whose contract had both a grace period and a promotional
 * rate — the ordinary Vietnamese case — had to run this tool and the
 * floating-rate tool and stitch the two answers together. `computeGraceLoan`
 * models both, so the before/after payments, both dates and the debt path all
 * come from a single result and cannot disagree.
 *
 * WHAT IS ON THE FIRST SCREEN: the amount, the term, the grace period and the
 * two rates with the promotional length. All five change the answer materially,
 * so none of them is behind a disclosure.
 *
 * The live region is four rows — the payment in month 1, in the last grace
 * month, in the first month that repays principal, and the jump between the
 * last two. The two dates, the balances and the totals are second views of the
 * same computation and sit in `live={false}` groups, per docs §4.
 */
export function InterestOnlyCalculator() {
  const initial = {
    amount: C.form.defaultAmount,
    term: C.form.defaultTerm,
    grace: C.form.defaultGrace,
    promoMonths: C.form.defaultPromoMonths,
    promoRate: C.form.defaultPromoRate,
    postRate: C.form.defaultPostRate,
  };
  const fields = useCalcFields(initial);

  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const amount = parseMoney(fields.values.amount);
  // Three whole-month counts, so `parseCount` — docs §4: `parseDecimal("1.200")`
  // is 1,2, and `parseMoney("3.0")` is 30, both before any integer guard could
  // run. Rejected on the typed value rather than clamped into range.
  const term = parseCount(fields.values.term);
  const grace = parseCount(fields.values.grace);
  const promoMonths = parseCount(fields.values.promoMonths);
  const promoRate = parseDecimal(fields.values.promoRate);
  const postRate = parseDecimal(fields.values.postRate);

  const amountInvalid = amount === null || amount <= 0;
  const termInvalid = term === null || term < 1 || term > MAX_GRACE_LOAN_MONTHS;
  // Both periods must be shorter than the term, so their validity depends on
  // the term as well as their own value.
  const graceInvalid =
    grace === null || (term !== null && grace >= term) || grace > MAX_GRACE_LOAN_MONTHS;
  const promoMonthsInvalid =
    promoMonths === null ||
    (term !== null && promoMonths >= term) ||
    promoMonths > MAX_GRACE_LOAN_MONTHS;
  const promoRateInvalid = promoRate === null || promoRate < 0;
  const postRateInvalid = postRate === null || postRate < 0;

  const usable =
    !amountInvalid &&
    !termInvalid &&
    !graceInvalid &&
    !promoMonthsInvalid &&
    !promoRateInvalid &&
    !postRateInvalid;

  const result = usable
    ? computeGraceLoan({
        amount,
        termMonths: term,
        graceMonths: grace,
        promoMonths,
        promoRatePercent: promoRate,
        postRatePercent: postRate,
      })
    : null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;
  const cash = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : moneyCell(figure);
  const months = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatDecimal(figure, 0)} ${C.form.monthsUnit}`;

  const paymentChart = gracePaymentBarsModel(result, {
    ...CHART_UI.money,
    ...C.paymentChart,
  });
  const balanceChart = graceBalanceLineModel(result, {
    ...CHART_UI.money,
    ...C.balanceChart,
  });

  // Six columns of full đồng do not read at 390 px even compacted, so the
  // phase table gets the block-per-row phone presentation the floating tool
  // uses. The rate is a `percentCell`: never divided into a money unit.
  const tableRows =
    result?.phases.map((phase) => [
      `${formatDecimal(phase.fromMonth, 0)}–${formatDecimal(phase.toMonth, 0)}`,
      percentCell(phase.annualRatePercent, 2),
      moneyCell(phase.payment),
      moneyCell(phase.interest),
      moneyCell(phase.principal),
      moneyCell(phase.balance),
    ]) ?? [];

  /** Does the rate reset fall inside the grace period? */
  const resetInGrace =
    result !== null &&
    result.promoEndMonth !== null &&
    result.graceEndMonth !== null &&
    result.postResetPayment === null;

  /**
   * Does the payment really change TWICE?
   *
   * Only when there is a grace period AND the reset lands after it. A
   * non-null `postResetPayment` alone was not enough: with no grace period at
   * all the schedule changes once, at the reset, and the page was still
   * telling the reader it changed "một lần khi hết ân hạn gốc" — a month that
   * does not exist.
   */
  const changesTwice =
    result !== null &&
    result.graceEndMonth !== null &&
    result.postResetPayment !== null;

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
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
      </FieldGroup>

      {/* The primary framing, in its own group with its own heading. */}
      <FieldGroup title={C.form.graceGroup} className="mt-8">
        <NumberField
          {...fields.bind("grace")}
          label={C.form.graceLabel}
          unit={C.form.graceUnit}
          help={C.form.graceHelp}
          error={C.form.graceInvalid}
          invalid={graceInvalid}
        />
      </FieldGroup>

      {/* The rate path, in a SEPARATE group from the grace period, because the
          two are separate terms of the contract with separate end dates. That
          separation is the whole point of original row 14. */}
      <FieldGroup title={C.form.rateGroup} className="mt-8">
        <NumberField
          {...fields.bind("promoMonths")}
          label={C.form.promoMonthsLabel}
          unit={C.form.promoMonthsUnit}
          help={C.form.promoMonthsHelp}
          error={C.form.promoMonthsInvalid}
          invalid={promoMonthsInvalid}
        />
        <NumberField
          {...fields.bind("promoRate")}
          label={C.form.promoRateLabel}
          unit={C.form.promoRateUnit}
          help={C.form.promoRateHelp}
          error={C.form.promoRateInvalid}
          invalid={promoRateInvalid}
        />
        <NumberField
          {...fields.bind("postRate")}
          label={C.form.postRateLabel}
          unit={C.form.postRateUnit}
          help={C.form.postRateHelp}
          error={C.form.postRateInvalid}
          invalid={postRateInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.firstPaymentLabel}
          value={money(result?.firstPayment)}
        />
        {/* Mounted only when there IS a grace period: a dash against "tháng
            cuối còn ân hạn gốc" on a loan with none would be a row about
            nothing. */}
        {result === null || result.lastGracePayment !== null ? (
          <ResultRow
            label={C.form.lastGracePaymentLabel}
            value={money(result?.lastGracePayment)}
          />
        ) : null}
        <ResultRow
          label={C.form.firstAmortizingLabel}
          value={money(result?.firstAmortizingPayment)}
        />
        {result === null || result.graceJump !== null ? (
          <ResultRow
            label={C.form.graceJumpLabel}
            value={money(result?.graceJump)}
          />
        ) : null}
      </ResultGroup>

      {result !== null && result.graceEndMonth === null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.noGraceNotice}
        </p>
      ) : null}
      {resetInGrace ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.resetInGraceNotice}
        </p>
      ) : null}
      {changesTwice ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.resetAfterGraceNotice}
        </p>
      ) : null}

      {/* THE TWO DATES, side by side and never merged. `live={false}`: this is
          a second reading of the same computation. */}
      <ResultGroup title={C.form.datesTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.graceEndLabel}
          value={months(result?.graceEndMonth)}
        />
        <ResultRow
          label={C.form.promoEndLabel}
          value={months(result?.promoEndMonth)}
        />
        <ResultRow
          label={C.form.balanceAtGraceEndLabel}
          value={money(result?.balanceAtGraceEnd)}
        />
        <ResultRow
          label={C.form.balanceAtPromoEndLabel}
          value={money(result?.balanceAtPromoEnd)}
        />
        {result === null || result.postResetPayment !== null ? (
          <ResultRow
            label={C.form.postResetLabel}
            value={money(result?.postResetPayment)}
          />
        ) : null}
      </ResultGroup>

      {/* Charts straight after the answer and before the detail ledger, both
          outside every ResultGroup so neither is re-announced on a keystroke. */}
      <ChartFigure model={paymentChart}>
        <BarChart model={paymentChart} />
      </ChartFigure>

      <ChartFigure model={balanceChart}>
        <LineChart model={balanceChart} />
      </ChartFigure>

      <DetailDisclosure
        title={C.form.detailTitle}
        hint={C.form.detailHint}
        className="mt-8"
      >
        <DetailFigures
          title={C.form.figuresTitle}
          figures={[
            {
              label: C.form.totalInterestLabel,
              value: cash(result?.totalInterest),
            },
            { label: C.form.totalPaidLabel, value: cash(result?.totalPaid) },
            {
              label: C.form.comparableLabel,
              value: cash(result?.comparableTotalInterest),
            },
            {
              label: C.form.extraInterestLabel,
              value: cash(result?.extraInterest),
            },
            {
              label: C.form.highestPaymentLabel,
              value: cash(result?.highestPayment),
            },
          ]}
        />

        {/* A comparison that could not be built is said out loud, because two
            blank rows would otherwise read as "the grace period is free". */}
        {result !== null && result.comparableTotalInterest === null ? (
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            {C.form.comparableUnavailableNotice}
          </p>
        ) : null}

        {tableRows.length > 0 ? (
          <ResultTable
            className="mt-6"
            caption={C.form.table.caption}
            mobileCards
            columns={[
              { label: C.form.table.phaseColumn, nowrap: true },
              { label: C.form.table.rateColumn, numeric: true },
              { label: C.form.table.paymentColumn, numeric: true },
              { label: C.form.table.interestColumn, numeric: true },
              { label: C.form.table.principalColumn, numeric: true },
              { label: C.form.table.balanceColumn, numeric: true },
            ]}
            rows={tableRows}
          />
        ) : null}
      </DetailDisclosure>

      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
