"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { analyseLoan } from "@/lib/calc/loan-analysis";
import { LOAN_ANALYSIS as C } from "@/content/calculators/loan-analysis";

export function LoanAnalysisCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;

  const termMonths =
    term === null
      ? null
      : Math.round(fields.values.termUnit === "years" ? term * 12 : term);

  const result =
    amountInvalid || rateInvalid || termInvalid || termMonths === null
      ? null
      : analyseLoan({
          amount,
          annualRatePercent: rate,
          termMonths,
        });

  const money = (value: number | undefined) =>
    value === undefined ? null : `${formatMoney(value)} ₫`;

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

  const tableRows = result
    ? result.segments.map((segment) => [
        C.table.quarterFormat
          .replace("{from}", formatDecimal(segment.fromMonth, 0))
          .replace("{to}", formatDecimal(segment.toMonth, 0)),
        formatMoney(segment.interest),
        formatMoney(segment.principal),
        formatPercent(segment.interestSharePercent, 1),
        formatMoney(segment.balance),
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
      </FieldGroup>

      {/* Eight rows is at the top of what a live region should announce, but
          they are the summary a screen-reader user is here for. The segment
          table below is the part that stays out of the live region. */}
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

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.quarterColumn },
            { label: C.table.interestColumn, numeric: true },
            { label: C.table.principalColumn, numeric: true },
            { label: C.table.shareColumn, numeric: true },
            { label: C.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
