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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeCommercialLoan } from "@/lib/calc/commercial-loan";
import { yearlySummary } from "@/lib/calc/loan";
import { COMMERCIAL_LOAN as C } from "@/content/calculators/commercial-loan";

export function CommercialLoanCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    grace: C.form.defaultGrace,
    balloon: C.form.defaultBalloon,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const grace = parseDecimal(fields.values.grace);
  const balloon = parseDecimal(fields.values.balloon);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  // A grace period as long as the term is an interest-only loan, which the
  // module rejects rather than reinterpreting — so it is flagged here.
  const graceInvalid =
    grace === null ||
    grace < 0 ||
    !Number.isInteger(grace) ||
    (term !== null && grace >= term);
  const balloonInvalid = balloon === null || balloon < 0 || balloon >= 100;

  const result =
    amountInvalid || rateInvalid || termInvalid || graceInvalid || balloonInvalid
      ? null
      : computeCommercialLoan({
          amount,
          annualRatePercent: rate,
          termMonths: term,
          graceMonths: grace,
          balloonPercent: balloon,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const tableRows = result
    ? yearlySummary(result.schedule).map((year) => [
        formatDecimal(year.year, 0),
        formatMoney(year.interest),
        formatMoney(year.principal),
        formatMoney(year.balance),
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
      </FieldGroup>

      <FieldGroup title={C.form.structureGroup} className="mt-8">
        <NumberField
          {...fields.bind("grace")}
          label={C.form.graceLabel}
          unit={C.form.graceUnit}
          help={C.form.graceHelp}
          error={C.form.graceInvalid}
          invalid={graceInvalid}
        />
        <NumberField
          {...fields.bind("balloon")}
          label={C.form.balloonLabel}
          unit={C.form.balloonUnit}
          help={C.form.balloonHelp}
          error={C.form.balloonInvalid}
          invalid={balloonInvalid}
        />
      </FieldGroup>

      {/* Three rows because there are three payments. A single "monthly
          payment" would be true for neither stretch of the loan. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.gracePaymentLabel}
          value={money(result?.gracePayment)}
        />
        <ResultRow
          label={C.form.amortizingPaymentLabel}
          value={money(result?.amortizingPayment)}
        />
        <ResultRow
          label={C.form.balloonResultLabel}
          value={money(result?.balloonAmount)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.ratioLabel}
          value={
            result ? formatPercent(result.interestToPrincipalPercent, 2) : null
          }
        />
        <ResultRow
          label={C.form.structureCostLabel}
          value={money(result?.structureCost)}
        />
        {/* The yardstick: the same money with no grace and no balloon. */}
        <ResultRow
          label={C.form.plainPaymentLabel}
          value={money(result?.plainPayment)}
        />
        <ResultRow
          label={C.form.plainInterestLabel}
          value={money(result?.plainTotalInterest)}
        />
        <ResultRow
          label={C.form.graceInterestLabel}
          value={money(result?.graceInterest)}
        />
        <ResultRow
          label={C.form.amortizingMonthsLabel}
          value={
            result
              ? `${formatDecimal(result.amortizingMonths, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.yearColumn },
            { label: C.form.table.interestColumn, numeric: true },
            { label: C.form.table.principalColumn, numeric: true },
            { label: C.form.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
